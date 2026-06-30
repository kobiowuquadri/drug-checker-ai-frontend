"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Loader2, RefreshCw, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/app/components/ui/Button";
import { api } from "@/lib/api";
import { Drug } from "@/lib/types";

// ── BarcodeDetector type (not in TS stdlib yet) ────────────────────────────────
declare class BarcodeDetector {
  static getSupportedFormats(): Promise<string[]>;
  constructor(options?: { formats?: string[] });
  detect(source: HTMLVideoElement): Promise<Array<{
    rawValue: string;
    format: string;
    boundingBox: DOMRectReadOnly;
    cornerPoints: Array<{ x: number; y: number }>;
  }>>;
}

type ScanState = "unsupported" | "loading-camera" | "scanning" | "processing" | "result" | "not-found" | "error";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDrugDetected: (drug: Drug) => void;
}

const SUPPORTED_FORMATS = [
  "ean_13", "ean_8", "upc_a", "upc_e",
  "code_128", "code_39", "code_93",
  "qr_code", "data_matrix", "pdf417",
];

export default function BarcodeScanner({ isOpen, onClose, onDrugDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const frameRef = useRef<number | null>(null);
  const stateRef = useRef<ScanState>("loading-camera");

  const [scanState, setScanState] = useState<ScanState>("loading-camera");
  const [rawBarcode, setRawBarcode] = useState("");
  const [barcodeFormat, setBarcodeFormat] = useState("");
  const [detectedName, setDetectedName] = useState("");
  const [detectedGeneric, setDetectedGeneric] = useState("");
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  function setState(s: ScanState) {
    stateRef.current = s;
    setScanState(s);
  }

  // ── Camera ────────────────────────────────────────────────────────────────────

  function stopEverything() {
    if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null; }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // Draw bounding box on canvas overlay
  function highlightBarcode(box: DOMRectReadOnly) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 12;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.fillStyle = "rgba(34,197,94,0.15)";
    ctx.fillRect(box.x, box.y, box.width, box.height);
  }

  // rAF loop: run BarcodeDetector on each video frame
  const startDetectLoop = useCallback(() => {
    async function loop() {
      if (stateRef.current !== "scanning" || !videoRef.current || !detectorRef.current) return;

      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0 && stateRef.current === "scanning") {
          const { rawValue, format, boundingBox } = barcodes[0];
          highlightBarcode(boundingBox);
          // Small pause to let the highlight render before switching state
          await new Promise((r) => setTimeout(r, 250));
          await handleBarcodeFound(rawValue, format);
          return;
        }
      } catch {}

      if (stateRef.current === "scanning") {
        frameRef.current = requestAnimationFrame(loop);
      }
    }
    frameRef.current = requestAnimationFrame(loop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startCamera = useCallback(async () => {
    stopEverything();
    setState("loading-camera");
    setRawBarcode("");
    setBarcodeFormat("");
    setDetectedName("");
    setDetectedGeneric("");
    setSearchResults([]);
    setErrorMsg("");

    // Check API support
    if (!("BarcodeDetector" in window)) {
      setState("unsupported");
      return;
    }

    try {
      const supported = await BarcodeDetector.getSupportedFormats();
      const formats = SUPPORTED_FORMATS.filter((f) => supported.includes(f));
      detectorRef.current = new BarcodeDetector({ formats: formats.length ? formats : undefined });

      const stream = await navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("scanning");
      startDetectLoop();
    } catch {
      setState("error");
      setErrorMsg("Camera access was denied. Please allow camera access in your browser settings.");
    }
  }, [startDetectLoop]);

  // ── Barcode found ─────────────────────────────────────────────────────────────

  async function handleBarcodeFound(rawValue: string, format: string) {
    setState("processing");
    stopEverything(); // stop stream, stop rAF
    setRawBarcode(rawValue);
    setBarcodeFormat(format.replace(/_/g, "-").toUpperCase());

    try {
      const res = await api.drugs.barcode({ barcodeValue: rawValue, format });
      const medName = res.data.medicationName;
      const genName = res.data.genericName;

      if (!medName) {
        // Not in FDA/RxNorm — try local search with raw barcode as fallback
        const searchName = rawValue.length > 6 ? "" : rawValue; // raw barcode numbers are useless for search
        if (searchName) {
          const r = await api.drugs.search(searchName);
          setSearchResults(r.data.drugs.slice(0, 5));
        }
        setState("not-found");
        return;
      }

      setDetectedName(medName);
      setDetectedGeneric(genName || "");

      // Search the database for matching results
      const searchTerms = [medName, genName].filter(Boolean) as string[];
      let results: Drug[] = [];

      for (const term of searchTerms) {
        for (const part of term.split(/\s*\+\s*/)) {
          const r = await api.drugs.search(part.trim());
          const hits = r.data.drugs.slice(0, 5);
          if (hits.length > 0) { results = hits; break; }
        }
        if (results.length > 0) break;
      }

      setSearchResults(results);
      setState("result");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Lookup failed. Please try again.");
    }
  }

  // ── Selection ─────────────────────────────────────────────────────────────────

  function handleSelect(drug: Drug) {
    stopEverything();
    onDrugDetected(drug);
    toast.success(`${drug.name} added to workspace`, { description: "From barcode scan" });
    onClose();
  }

  function handleRetry() {
    startCamera();
  }

  function handleClose() {
    stopEverything();
    setState("loading-camera");
    setRawBarcode("");
    setBarcodeFormat("");
    setDetectedName("");
    setDetectedGeneric("");
    setSearchResults([]);
    setErrorMsg("");
    onClose();
  }

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopEverything();
      setState("loading-camera");
    }
    return stopEverything;
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const isProcessing = scanState === "loading-camera" || scanState === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/65 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[32px] border border-border-app bg-white shadow-premium">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-app px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-blue">Barcode scan</p>
            <h3 className="text-lg font-black text-text-primary">Scan medication barcode</h3>
          </div>
          <button onClick={handleClose} className="rounded-2xl border border-border-app p-2 text-text-muted hover:bg-surface-app" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full w-full object-cover transition-opacity duration-300 ${scanState === "scanning" ? "opacity-100" : "opacity-0"}`}
          />

          {/* Canvas overlay for barcode highlight */}
          <canvas
            ref={canvasRef}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />

          {/* Scanning overlay */}
          {scanState === "scanning" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
              {/* Barcode viewfinder — wider than camera's square */}
              <div className="relative h-24 w-72">
                {(["top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-lg",
                   "top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-lg",
                   "bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-lg",
                   "bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-lg"] as const).map((c, i) => (
                  <div key={i} className={`absolute h-7 w-7 border-white ${c}`} />
                ))}
                <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-medical-green shadow-[0_0_16px_rgba(76,209,55,0.9)] animate-scan-line" />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-1.5">
                <ScanLine className="h-3.5 w-3.5 text-medical-green" />
                <p className="text-xs font-semibold text-white/90">Point at the barcode on the packaging</p>
              </div>
            </div>
          )}

          {/* Loading / processing */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/75">
              <Loader2 className="h-9 w-9 animate-spin text-white" />
              <p className="text-sm font-semibold text-white">
                {scanState === "loading-camera" ? "Starting camera…" : "Looking up medication…"}
              </p>
            </div>
          )}

          {/* Unsupported browser */}
          {scanState === "unsupported" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <AlertTriangle className="h-10 w-10 text-warning-orange" />
              <p className="text-sm font-semibold text-white">
                Barcode detection requires Chrome, Edge, or Safari 17+.
              </p>
              <p className="text-xs text-white/60">Use the Camera scan instead to identify medications by label.</p>
            </div>
          )}

          {/* Camera error (no capture) */}
          {scanState === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <AlertTriangle className="h-10 w-10 text-warning-orange" />
              <p className="text-sm font-semibold text-white">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Bottom panel */}
        <div className="px-5 py-5">

          {/* Result */}
          {(scanState === "result" || scanState === "not-found") && (
            <div className="mb-4">
              {/* Barcode badge */}
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-xl border border-border-app bg-surface-app px-2.5 py-1 font-mono text-[10px] font-bold text-text-muted">
                  {barcodeFormat}
                </span>
                <span className="font-mono text-xs text-text-muted truncate">{rawBarcode}</span>
              </div>

              {scanState === "result" && (
                <>
                  <div className="mb-3 space-y-1">
                    {detectedName && (
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                        Drug:{" "}
                        <span className="font-black normal-case tracking-normal text-primary-blue">{detectedName}</span>
                      </p>
                    )}
                    {detectedGeneric && detectedGeneric !== detectedName && (
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                        Ingredient:{" "}
                        <span className="font-black normal-case tracking-normal text-text-primary">{detectedGeneric}</span>
                      </p>
                    )}
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {searchResults.map((drug) => (
                        <button
                          key={drug.rxcui}
                          type="button"
                          onClick={() => handleSelect(drug)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-border-app bg-surface-app px-4 py-3 text-left transition hover:border-primary-blue/40 hover:bg-primary-blue/5 active:scale-[0.98]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-blue/10 text-base">💊</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-text-primary">{drug.name}</p>
                            {drug.aliases && drug.aliases.length > 0 && (
                              <p className="truncate text-xs font-medium text-text-muted">{drug.aliases.slice(0, 3).join(", ")}</p>
                            )}
                          </div>
                          <Check className="h-4 w-4 shrink-0 text-primary-blue" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-surface-app p-4 text-sm font-medium text-text-secondary">
                      Identified as <strong>{detectedName}</strong> but no database match found. Try searching manually.
                    </p>
                  )}
                </>
              )}

              {scanState === "not-found" && (
                <div className="rounded-2xl bg-surface-app p-4">
                  <p className="text-sm font-black text-text-primary">Barcode not in database</p>
                  <p className="mt-1 text-xs font-medium text-text-secondary">
                    This product ({rawBarcode}) is not in the FDA or RxNorm databases. Try the Camera scan to identify it by label.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {scanState === "scanning" && (
              <Button variant="secondary" onClick={handleClose} className="flex-1 py-3">
                Cancel
              </Button>
            )}
            {(scanState === "result" || scanState === "not-found" || scanState === "error" || scanState === "unsupported") && (
              <Button variant="secondary" onClick={scanState === "unsupported" ? handleClose : handleRetry} className="flex-1 py-3">
                {scanState === "unsupported" ? (
                  "Close"
                ) : (
                  <><RefreshCw className="h-4 w-4" /> Try again</>
                )}
              </Button>
            )}
            {(scanState === "loading-camera" || scanState === "processing") && (
              <Button variant="secondary" onClick={handleClose} className="flex-1 py-3" disabled={scanState === "processing"}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
