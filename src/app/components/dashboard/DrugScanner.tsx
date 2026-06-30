"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, Check, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/app/components/ui/Button";
import { api } from "@/lib/api";
import { Drug } from "@/lib/types";

type ScanState = "loading-camera" | "streaming" | "processing" | "result" | "error";

interface DrugScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDrugDetected: (drug: Drug) => void;
}

// ── Helpers (outside component — no stale closure risk) ────────────────────────

async function geminiScan(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  const res = await api.drugs.scan({ image: base64, mimeType: "image/jpeg" });
  return {
    brand: res.data.medicationName?.trim() || "UNKNOWN",
    generic: res.data.genericName?.trim() || "UNKNOWN",
  };
}

async function findDrugs(brand: string, generic: string) {
  const brandOk = brand !== "UNKNOWN" && brand.length >= 3;
  const genericOk = generic !== "UNKNOWN" && generic.length >= 3;

  let results: Drug[] = [];
  let usedKey: "brand" | "generic" = "brand";

  if (brandOk) {
    const r = await api.drugs.search(brand);
    results = r.data.drugs.slice(0, 5);
  }

  if (results.length === 0 && genericOk) {
    // Try each ingredient (e.g. "Aceclofenac + Paracetamol" → two searches)
    for (const ingredient of generic.split(/\s*\+\s*/)) {
      const r = await api.drugs.search(ingredient.trim());
      const hits = r.data.drugs.slice(0, 5);
      if (hits.length > 0) { results = hits; usedKey = "generic"; break; }
    }
  }

  return { results, usedKey };
}

function captureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement, targetW: number, quality = 0.84): string | null {
  // Don't capture if video hasn't received frames yet — would produce a black image
  if (!video.videoWidth || !video.videoHeight || video.readyState < 2) return null;
  const scale = Math.min(1, targetW / video.videoWidth);
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function DrugScanner({ isOpen, onClose, onDrugDetected }: DrugScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stateRef = useRef<ScanState>("loading-camera");
  const autoTimerRef = useRef<number | null>(null);
  const autoIntervalRef = useRef<number | null>(null);
  const busyRef = useRef(false);

  const [scanState, setScanState] = useState<ScanState>("loading-camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedBrand, setDetectedBrand] = useState("");
  const [detectedGeneric, setDetectedGeneric] = useState("");
  const [searchedBy, setSearchedBy] = useState<"brand" | "generic">("brand");
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  function setState(s: ScanState) {
    stateRef.current = s;
    setScanState(s);
  }

  // ── Camera management ────────────────────────────────────────────────────────

  function clearAuto() {
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    if (autoIntervalRef.current) { clearInterval(autoIntervalRef.current); autoIntervalRef.current = null; }
  }

  function stopStream() {
    clearAuto();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  const startCamera = useCallback(async () => {
    clearAuto();
    busyRef.current = false;
    setState("loading-camera");
    setCapturedImage(null);
    setDetectedBrand("");
    setDetectedGeneric("");
    setSearchResults([]);
    setErrorMsg("");

    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // Wait for metadata so videoWidth/videoHeight are available
        await new Promise<void>((resolve) => {
          if (video.readyState >= 1) { resolve(); return; }
          video.onloadedmetadata = () => resolve();
        });
        await video.play();
      }
      setState("streaming");

      // Auto-detect: 3 s warmup (camera needs time to focus/expose), then scan every 3 s
      autoTimerRef.current = window.setTimeout(() => {
        autoIntervalRef.current = window.setInterval(runAutoScan, 3000);
      }, 3000);
    } catch {
      setState("error");
      setErrorMsg("Camera access was denied. Please allow camera access in your browser settings.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Shared: present detected result ─────────────────────────────────────────

  async function presentResult(dataUrl: string, brand: string, generic: string) {
    clearAuto();
    stopStream();
    setState("processing");
    setCapturedImage(dataUrl);

    const brandKnown = brand !== "UNKNOWN" && brand.length >= 2;
    const genericKnown = generic !== "UNKNOWN" && generic.length >= 2;

    if (!brandKnown && !genericKnown) {
      setState("error");
      setErrorMsg("No medication label detected. Try holding the camera steady with good lighting.");
      return;
    }

    setDetectedBrand(brandKnown ? brand : "");
    setDetectedGeneric(genericKnown ? generic : "");

    try {
      const { results, usedKey } = await findDrugs(brand, generic);
      setSearchedBy(usedKey);
      setSearchResults(results);
      setState("result");
    } catch {
      setState("error");
      setErrorMsg("Search failed. Please try again.");
    }
  }

  // ── Auto-scan ────────────────────────────────────────────────────────────────

  async function runAutoScan() {
    if (busyRef.current || stateRef.current !== "streaming") return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    busyRef.current = true;
    try {
      const dataUrl = captureFrame(video, canvas, 960, 0.88);
      if (!dataUrl) return; // video not ready yet — skip this cycle

      const { brand, generic } = await geminiScan(dataUrl);

      const brandValid = brand !== "UNKNOWN" && brand.length >= 4;
      const genericValid = generic !== "UNKNOWN" && generic.length >= 3;

      if ((brandValid || genericValid) && stateRef.current === "streaming") {
        await presentResult(dataUrl, brand, generic);
      }
    } catch {
      // silent — keep trying on next interval
    } finally {
      busyRef.current = false;
    }
  }

  // ── Manual capture ───────────────────────────────────────────────────────────

  const captureManually = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || stateRef.current !== "streaming") return;

    const dataUrl = captureFrame(video, canvas, 960, 0.90);
    clearAuto();

    if (!dataUrl) {
      setState("error");
      setErrorMsg("Camera not ready. Wait a moment and try again.");
      return;
    }

    try {
      setState("processing");
      setCapturedImage(dataUrl);
      stopStream();

      const { brand, generic } = await geminiScan(dataUrl);
      await presentResult(dataUrl, brand, generic);
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to identify the medication. Please try again.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Drug selection ───────────────────────────────────────────────────────────

  function handleSelect(drug: Drug) {
    stopStream();
    onDrugDetected(drug);
    toast.success(`${drug.name} added to workspace`, { description: "From camera scan" });
    onClose();
  }

  function handleRetry() {
    startCamera();
  }

  function handleClose() {
    stopStream();
    setState("loading-camera");
    setCapturedImage(null);
    setDetectedBrand("");
    setDetectedGeneric("");
    setSearchResults([]);
    setErrorMsg("");
    onClose();
  }

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setState("loading-camera");
    }
    return stopStream;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const isProcessing = scanState === "loading-camera" || scanState === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/65 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded-t-[32px] sm:rounded-[32px] border border-border-app bg-white shadow-premium">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-app px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-blue">Camera scan</p>
            <h3 className="text-lg font-black text-text-primary">Scan medication label</h3>
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
            className={`h-full w-full object-cover transition-opacity duration-300 ${scanState === "streaming" ? "opacity-100" : "opacity-0"}`}
          />

          {capturedImage && (
            <img src={capturedImage} alt="Captured frame" className="absolute inset-0 h-full w-full object-cover" />
          )}

          {/* Viewfinder */}
          {scanState === "streaming" && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative h-40 w-64">
                {(["top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-lg",
                   "top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-lg",
                   "bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-lg",
                   "bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-lg"] as const).map((corner, i) => (
                  <div key={i} className={`absolute h-7 w-7 border-white ${corner}`} />
                ))}
                <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-medical-green shadow-[0_0_16px_rgba(76,209,55,0.9)] animate-scan-line" />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-medical-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-medical-green" />
                </span>
                <p className="text-xs font-semibold text-white/90">Hold steady — auto-detecting</p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/75">
              <Loader2 className="h-9 w-9 animate-spin text-white" />
              <p className="text-sm font-semibold text-white">
                {scanState === "loading-camera" ? "Starting camera…" : "Identifying medication…"}
              </p>
            </div>
          )}

          {/* Error overlay (no captured image) */}
          {scanState === "error" && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
              <AlertTriangle className="h-10 w-10 text-warning-orange" />
              <p className="text-sm font-semibold text-white">{errorMsg}</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Bottom panel */}
        <div className="px-5 py-5">
          {/* Detection labels */}
          {scanState === "result" && (
            <div className="mb-4">
              <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
                {detectedBrand && (
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Brand: <span className="font-black normal-case tracking-normal text-primary-blue">{detectedBrand}</span>
                  </p>
                )}
                {detectedGeneric && (
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
                    Ingredient: <span className="font-black normal-case tracking-normal text-text-primary">{detectedGeneric}</span>
                  </p>
                )}
              </div>
              {searchedBy === "generic" && searchResults.length > 0 && (
                <p className="mb-2 text-[10px] italic text-text-muted">Matched by active ingredient</p>
              )}

              {searchResults.length > 0 ? (
                <div className="max-h-52 space-y-2 overflow-y-auto">
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
                <div className="rounded-2xl bg-surface-app p-4 text-sm font-medium text-text-secondary">
                  No database match for <strong>{detectedBrand || detectedGeneric}</strong>.
                  <span className="mt-1 block text-xs text-text-muted">Close this and search manually by the generic name.</span>
                </div>
              )}
            </div>
          )}

          {/* Error (with captured image) */}
          {scanState === "error" && capturedImage && (
            <p className="mb-4 rounded-2xl border border-danger-red/20 bg-danger-red/5 px-4 py-3 text-sm font-semibold text-danger-red">
              {errorMsg}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {scanState === "streaming" && (
              <>
                <Button variant="secondary" onClick={handleClose} className="flex-1 py-3">Cancel</Button>
                <Button onClick={captureManually} className="flex-1 py-3">
                  <Camera className="h-4 w-4" /> Capture
                </Button>
              </>
            )}
            {(scanState === "result" || scanState === "error") && (
              <Button variant="secondary" onClick={handleRetry} className="flex-1 py-3">
                <RefreshCw className="h-4 w-4" /> Try again
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
