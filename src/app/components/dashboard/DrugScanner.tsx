"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, Camera, UploadCloud, Loader2, Check, 
  AlertCircle, Pill, Sparkles, Scan, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";
import { SelectedDrug } from "./DrugChecker";

interface DrugScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDrugs: (drugs: SelectedDrug[]) => void;
}

export default function DrugScanner({ isOpen, onClose, onAddDrugs }: DrugScannerProps) {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  
  // Camera States
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  
  // Scanning/Processing States
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResults, setScanResults] = useState<SelectedDrug[]>([]);
  const [unresolvedDrugs, setUnresolvedDrugs] = useState<string[]>([]);
  const [selectedResults, setSelectedResults] = useState<Record<string, boolean>>({});
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when modal closes or tab changes
  useEffect(() => {
    if (!isOpen || activeTab !== "camera") {
      stopCamera();
    } else {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, activeTab]);

  // Handle Scan Steps Animation
  useEffect(() => {
    if (!isScanning) {
      setScanStep(0);
      return;
    }

    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isScanning]);

  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check permissions or upload an image instead.");
    } finally {
      setIsCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const dataUrl = canvas.toDataURL("image/jpeg");
      setImageSrc(dataUrl);
      setFilename("camera_capture.jpg");
      
      // Stop camera once captured
      stopCamera();
      
      // Start OCR scan
      processScan(dataUrl, "camera_capture.jpg");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageSrc(dataUrl);
      setFilename(file.name);
      processScan(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const processScan = async (base64Image: string, name: string) => {
    setIsScanning(true);
    setScanResults([]);
    setUnresolvedDrugs([]);

    try {
      // 1. Call server-side OCR api
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, filename: name })
      });

      const json = await response.json();
      if (!json.success || !json.data?.drugs) {
        throw new Error(json.message || "Failed to parse drug names");
      }

      const rawDrugs = json.data.drugs as string[];

      // 2. Query search database for each drug to get valid RxCUI
      const resolved: SelectedDrug[] = [];
      const unresolved: string[] = [];

      await Promise.all(
        rawDrugs.map(async (drugName) => {
          try {
            const searchRes = await fetch(`/drugs/search?q=${encodeURIComponent(drugName)}`);
            const searchJson = await searchRes.json();
            if (searchJson.success && searchJson.data?.drugs?.length > 0) {
              // Find the best match (exact or first match)
              const matched = searchJson.data.drugs[0];
              resolved.push({
                rxcui: matched.rxcui,
                name: matched.name,
                synonym: matched.synonym
              });
            } else {
              unresolved.push(drugName);
            }
          } catch (err) {
            console.error(`Error resolving drug ${drugName}:`, err);
            unresolved.push(drugName);
          }
        })
      );

      setScanResults(resolved);
      setUnresolvedDrugs(unresolved);

      // Pre-select all resolved drugs
      const initialSelection: Record<string, boolean> = {};
      resolved.forEach((drug) => {
        initialSelection[drug.rxcui] = true;
      });
      setSelectedResults(initialSelection);

    } catch (err: any) {
      console.error("Scan error:", err);
      toast.error(err.message || "An error occurred during scanning");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelectDrug = (rxcui: string) => {
    setSelectedResults((prev) => ({
      ...prev,
      [rxcui]: !prev[rxcui]
    }));
  };

  const handleAddSelected = () => {
    const drugsToAdd = scanResults.filter((drug) => selectedResults[drug.rxcui]);
    if (drugsToAdd.length === 0) {
      toast.error("Please select at least one medication to add.");
      return;
    }
    onAddDrugs(drugsToAdd);
    toast.success(`Added ${drugsToAdd.length} medication(s) to checklist.`);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImageSrc(null);
    setFilename(null);
    setScanResults([]);
    setUnresolvedDrugs([]);
    setSelectedResults({});
    setIsScanning(false);
    setScanStep(0);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border-app bg-card-app p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-app pb-4 dark:border-slate-850">
          <div className="flex items-center gap-2 text-primary-blue dark:text-primary-blue-light">
            <Scan className="h-5 w-5 animate-pulse" />
            <h3 className="text-base font-extrabold text-text-primary dark:text-white">
              Scan Medications
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-xl border border-border-app p-2 text-text-muted hover:bg-surface-app hover:text-text-primary transition cursor-pointer dark:border-slate-800 dark:hover:bg-slate-800"
            aria-label="Close scanner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scan Workflow content */}
        <div className="flex-1 overflow-y-auto mt-4 py-2 space-y-4">
          
          {/* STEP 1: PROCESSING / SCANNING ANIMATION */}
          {isScanning && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary-blue/20 dark:border-primary-blue-light/10" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary-blue border-r-transparent border-b-transparent border-l-transparent animate-spin dark:border-t-primary-blue-light" />
                <div className="absolute inset-4 bg-primary-blue/10 dark:bg-primary-blue-light/10 rounded-full flex items-center justify-center">
                  <Pill className="h-8 w-8 text-primary-blue dark:text-primary-blue-light animate-bounce" />
                </div>
              </div>
              
              <div className="space-y-2 max-w-sm">
                <h4 className="text-lg font-bold text-text-primary dark:text-white">
                  Processing Smart Scan...
                </h4>
                <p className="text-xs text-text-muted">
                  We are analyzing your bottle/label using secure vision processing.
                </p>
              </div>

              {/* Progress Stepper list */}
              <div className="w-full max-w-md bg-surface-app border border-border-app/40 rounded-2xl p-4 text-left space-y-3 dark:bg-slate-900/50 dark:border-slate-800">
                {[
                  "Uploading image safely...",
                  "Extracting printed text elements...",
                  "Parsing ingredient & chemical matches...",
                  "Resolving items with RxNorm database..."
                ].map((step, idx) => {
                  const isDone = scanStep > idx;
                  const isCurrent = scanStep === idx;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                      {isDone ? (
                        <div className="h-5 w-5 bg-medical-green text-white rounded-full flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : isCurrent ? (
                        <div className="h-5 w-5 border border-primary-blue text-primary-blue rounded-full flex items-center justify-center animate-pulse shrink-0 dark:border-primary-blue-light dark:text-primary-blue-light">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 border border-border-app text-text-muted rounded-full flex items-center justify-center shrink-0 dark:border-slate-800">
                          {idx + 1}
                        </div>
                      )}
                      <span className={`${isDone ? "text-text-primary dark:text-slate-300" : isCurrent ? "text-primary-blue font-bold dark:text-primary-blue-light" : "text-text-muted"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DISPLAY RESULTS */}
          {!isScanning && (scanResults.length > 0 || unresolvedDrugs.length > 0) && (
            <div className="space-y-4">
              <div className="bg-primary-blue/5 border border-primary-blue/10 dark:bg-primary-blue/10 dark:border-primary-blue/20 rounded-2xl p-4 flex gap-3 items-center">
                <Sparkles className="h-5 w-5 text-primary-blue dark:text-primary-blue-light shrink-0" />
                <p className="text-xs font-semibold text-text-secondary dark:text-slate-300 leading-relaxed">
                  We identified the following medications from your scan. Check the medications you want to add to your combination checker.
                </p>
              </div>

              {scanResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Resolved Medications ({scanResults.length})
                  </h4>
                  <div className="border border-border-app rounded-2xl overflow-hidden divide-y divide-border-app bg-surface-app/30 dark:border-slate-800 dark:divide-slate-800">
                    {scanResults.map((drug) => (
                      <label
                        key={drug.rxcui}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-app transition duration-150 select-none"
                      >
                        <div className="flex items-center gap-3 pr-4">
                          <input
                            type="checkbox"
                            checked={!!selectedResults[drug.rxcui]}
                            onChange={() => toggleSelectDrug(drug.rxcui)}
                            className="h-4.5 w-4.5 rounded border-gray-300 text-primary-blue focus:ring-primary-blue cursor-pointer"
                          />
                          <div>
                            <span className="block text-sm font-extrabold text-text-primary dark:text-white leading-tight">
                              {drug.name}
                            </span>
                            {drug.synonym && (
                              <span className="block text-xs text-text-muted mt-0.5">
                                {drug.synonym}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-primary-blue bg-primary-blue/10 px-2 py-0.5 rounded-md dark:bg-primary-blue/20 dark:text-primary-blue-light shrink-0">
                          RxCUI: {drug.rxcui}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {unresolvedDrugs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Unrecognized or Ingredient Matches ({unresolvedDrugs.length})
                  </h4>
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 space-y-2 dark:bg-yellow-950/10 dark:border-yellow-900/25">
                    <div className="flex gap-2 text-warning-orange">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold">Additional safety info</span>
                    </div>
                    <p className="text-[11px] font-semibold text-text-muted leading-relaxed">
                      We detected some ingredients that aren't matching exact products in our database. You might want to search for these manually:
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {unresolvedDrugs.map((name, i) => (
                        <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 rounded-2xl border border-border-app py-3 text-sm font-bold text-text-secondary hover:bg-surface-app transition duration-200 cursor-pointer dark:border-slate-800"
                >
                  Scan Another Image
                </button>
                <button
                  type="button"
                  onClick={handleAddSelected}
                  className="flex-1 rounded-2xl bg-primary-blue text-white py-3 text-sm font-bold hover:bg-primary-blue-dark transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary-blue/15"
                >
                  <Check className="h-4 w-4" /> Add Selected Drugs
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SCAN INITIATION (CAMERA OR UPLOAD) */}
          {!isScanning && scanResults.length === 0 && unresolvedDrugs.length === 0 && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex p-1 bg-surface-app border border-border-app/40 rounded-2xl dark:bg-slate-900/50 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setActiveTab("camera")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
                    activeTab === "camera"
                      ? "bg-white text-primary-blue shadow dark:bg-slate-800 dark:text-primary-blue-light"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Camera className="h-4 w-4" /> Use Device Camera
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition duration-200 cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-white text-primary-blue shadow dark:bg-slate-800 dark:text-primary-blue-light"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <UploadCloud className="h-4 w-4" /> Upload Label Photo
                </button>
              </div>

              {/* CAMERA TAB VIEW */}
              {activeTab === "camera" && (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 border border-dashed border-border-app rounded-3xl text-center space-y-4 dark:border-slate-800">
                      <div className="bg-red-500/10 text-red-500 rounded-2xl p-3">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-semibold text-text-secondary max-w-sm">
                        {cameraError}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("upload")}
                        className="rounded-xl bg-primary-blue text-white px-5 py-2.5 text-xs font-bold hover:bg-primary-blue-dark transition cursor-pointer"
                      >
                        Upload a file instead
                      </button>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-3xl border border-border-app bg-black aspect-video flex items-center justify-center dark:border-slate-800">
                      
                      {/* Video element */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* Viewfinder overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center border-[20px] border-black/40">
                        <div className="relative w-64 h-48 border-2 border-dashed border-primary-blue-light/75 rounded-2xl flex items-center justify-center">
                          {/* Corner highlights */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary-blue rounded-tl-lg" />
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary-blue rounded-tr-lg" />
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary-blue rounded-bl-lg" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary-blue rounded-br-lg" />
                          
                          {/* Scanning Neon Line laser animation */}
                          <div className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-blue to-transparent shadow-lg shadow-primary-blue animate-scan-laser" />
                        </div>
                      </div>

                      {isCameraLoading && (
                        <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin text-primary-blue dark:text-primary-blue-light" />
                          <p className="text-xs font-semibold text-white">Opening camera stream...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!cameraError && !isCameraLoading && (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full rounded-2xl bg-primary-blue text-white py-3.5 text-sm font-bold hover:bg-primary-blue-dark transition duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-primary-blue/15"
                    >
                      <Camera className="h-5 w-5" /> Take Picture & Scan Label
                    </button>
                  )}
                </div>
              )}

              {/* UPLOAD TAB VIEW */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-border-app hover:border-primary-blue dark:border-slate-800 dark:hover:border-primary-blue-light rounded-3xl text-center space-y-4 cursor-pointer hover:bg-surface-app/30 transition duration-200"
                  >
                    <div className="bg-primary-blue/5 text-primary-blue rounded-2xl p-4 dark:bg-primary-blue/10 dark:text-primary-blue-light">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-text-primary dark:text-white">
                        Click or Drag Prescription Label Photo Here
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Supports PNG, JPG or JPEG up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-border-app dark:border-slate-850 rounded-xl items-start">
                <AlertCircle className="h-4.5 w-4.5 text-text-muted shrink-0 mt-0.5" />
                <p className="text-[10px] font-semibold text-text-muted leading-relaxed">
                  Scanning works best when label names are clear and well-lit. We will verify scanned medications against our database. Always double-check results before submitting.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Canvas for rendering frames invisibly */}
        <canvas ref={canvasRef} className="hidden" />

      </div>
    </div>
  );
}
