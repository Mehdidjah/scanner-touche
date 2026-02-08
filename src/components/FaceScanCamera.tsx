import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";

interface FaceScanCameraProps {
  onCapture: (file: File, preview: string) => void;
  onClear?: () => void;
}

type ScanStatus = "initializing" | "scanning" | "detected" | "captured" | "error";

export function FaceScanCamera({ onCapture, onClear }: FaceScanCameraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<ScanStatus>("initializing");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onCaptureRef = useRef(onCapture);
  const mountedRef = useRef(true);
  const hasCapturedRef = useRef(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
    setCountdown(3);
  }, []);

  const capturePhoto = useCallback(() => {
    if (hasCapturedRef.current || !mountedRef.current) {
      return;
    }

    stopCountdown();
    hasCapturedRef.current = true;

    setTimeout(() => {
      const container = containerRef.current;
      const canvas =
        (container?.querySelector("canvas") as HTMLCanvasElement) ||
        (document.querySelector("a-scene canvas") as HTMLCanvasElement);

      if (!canvas) {
        setStatus("error");
        setErrorMessage("Camera not available. Please upload a photo instead.");
        setFallbackMode(true);
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (!blob || !mountedRef.current) return;

          const file = new File([blob], `face-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          const preview = URL.createObjectURL(blob);

          setCapturedPreview(preview);
          setStatus("captured");

          onCaptureRef.current(file, preview);
        },
        "image/jpeg",
        0.92
      );
    }, 100);
  }, [stopCountdown]);

  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current || captureTimeoutRef.current) return;

    let timeLeft = 3;
    setCountdown(timeLeft);

    countdownIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      if (mountedRef.current) {
        setCountdown(Math.max(timeLeft, 0));
      }
      if (timeLeft <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 1000);

    captureTimeoutRef.current = setTimeout(() => {
      capturePhoto();
    }, 3000);
  }, [capturePhoto]);

  const handleFileSelect = useCallback((file: File, preview: string) => {
    hasCapturedRef.current = true;
    setCapturedPreview(preview);
    setStatus("captured");
    onCaptureRef.current(file, preview);
  }, []);

  const handleClear = useCallback(() => {
    hasCapturedRef.current = false;
    setCapturedPreview(null);
    setStatus("scanning");
    stopCountdown();
    onClear?.();
  }, [onClear, stopCountdown]);

  useEffect(() => {
    mountedRef.current = true;
    hasCapturedRef.current = false;

    let initTimeout: NodeJS.Timeout | null = null;

    const init = () => {
      const win = window as any;
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max wait

      const tryInit = () => {
        attempts += 1;

        if (!win.AFRAME || !win.XR8) {
          if (attempts < maxAttempts) {
            initTimeout = setTimeout(tryInit, 100);
            return;
          }

          setStatus("error");
          setErrorMessage("Face tracking failed to load. Please upload a photo instead.");
          setFallbackMode(true);
          return;
        }

        const AFRAME = win.AFRAME;

        const hideLoadingScreens = () => {
          const selectors = [
            ".xrextras-loading",
            ".xrextras-runtime-error",
            "[class*=\"xrextras-loading\"]",
            "#loadingContainer",
            "[class*=\"powered\"]",
            "[id*=\"loading\"]",
            "[id*=\"8thwall\"]",
          ];
          selectors.forEach((selector) => {
            try {
              const elements = document.querySelectorAll(selector);
              elements.forEach((el) => {
                (el as HTMLElement).style.display = "none";
                (el as HTMLElement).style.opacity = "0";
                (el as HTMLElement).style.visibility = "hidden";
                (el as HTMLElement).style.pointerEvents = "none";
              });
            } catch (e) {
              // Ignore selector errors
            }
          });
        };

        hideLoadingScreens();
        const hideInterval = setInterval(hideLoadingScreens, 100);
        setTimeout(() => clearInterval(hideInterval), 5000);

        if (!AFRAME.components["face-scanner"]) {
          AFRAME.registerComponent("face-scanner", {
            init() {
              const scene = this.el.sceneEl;

              scene.addEventListener("realityready", () => {
                if (!mountedRef.current) return;
                setStatus("scanning");
              });

              scene.addEventListener("xrfacefound", () => {
                if (!mountedRef.current || hasCapturedRef.current) return;
                setStatus("detected");
                startCountdown();
              });

              scene.addEventListener("xrfacelost", () => {
                if (!mountedRef.current || hasCapturedRef.current) return;
                setStatus("scanning");
                stopCountdown();
              });
            },
          });
        }
      };

      tryInit();
    };

    init();

    return () => {
      mountedRef.current = false;
      if (initTimeout) clearTimeout(initTimeout);
      stopCountdown();
    };
  }, [startCountdown, stopCountdown]);

  if (fallbackMode) {
    return (
      <div className="space-y-3">
        {errorMessage && (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {errorMessage}
          </div>
        )}
        <ImageUpload
          onImageSelect={handleFileSelect}
          selectedImage={capturedPreview}
          onClear={handleClear}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 md:h-80 bg-black rounded-lg overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {status === "captured" && capturedPreview ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <img src={capturedPreview} alt="Captured face" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-0 right-0 z-50 flex justify-center">
            <div className="px-4 py-2 rounded-full bg-green-900/80 border-2 border-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-bold">Photo Ready</span>
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 z-50 flex justify-center">
            <Button variant="secondary" size="sm" onClick={handleClear} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retake
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 overflow-hidden" style={{ contain: "strict" }}>
            {/* @ts-ignore */}
            <a-scene
              embedded
              vr-mode-ui="enabled: false"
              xrface="uvType: standard; maxDetections:1; allowedDevices: any; cameraDirection: front; mirroredDisplay: true"
              face-scanner
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              {/* @ts-ignore */}
              <a-camera look-controls="enabled: false" wasd-controls="enabled: false" position="0 2 0" />

              {/* @ts-ignore */}
              <a-light type="directional" position="0 1.8 3" intensity="0.8" />
              {/* @ts-ignore */}
              <a-light type="ambient" intensity="0.6" />
            </a-scene>
          </div>

          {(status === "scanning" || status === "detected") && (
            <>
              <div className="absolute top-4 left-0 right-0 z-50 pointer-events-none">
                <div className="flex justify-center">
                  <div
                    className={`px-4 py-2 rounded-full backdrop-blur-md border-2 ${
                      status === "detected"
                        ? "bg-cyan-900/80 border-cyan-400"
                        : "bg-blue-900/80 border-blue-400"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        status === "detected" ? "text-cyan-400" : "text-blue-400"
                      }`}
                    >
                      {status === "detected"
                        ? `Face found. Capturing in ${countdown}s...`
                        : "Position your face in the frame"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div
                  className={`relative w-44 h-56 md:w-52 md:h-64 border-4 rounded-full transition-all duration-500 ${
                    status === "detected"
                      ? "border-cyan-400 shadow-[0_0_50px_rgba(0,255,255,0.8)] scale-105"
                      : "border-white/70 shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                  }`}
                >
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"
                    style={{
                      boxShadow: "0 0 20px rgba(0, 255, 255, 0.8)",
                      animation: "scanMove 2s ease-in-out infinite",
                    }}
                  />

                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-3xl" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-3xl" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-3xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-3xl" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3">
                <p className="text-white text-center text-sm font-medium flex-1">
                  {status === "detected" ? "Hold still for a clear capture" : "Good lighting helps"}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={capturePhoto}
                  className="gap-2 shrink-0"
                >
                  <Camera className="w-4 h-4" />
                  Capture
                </Button>
              </div>
            </>
          )}

          {status === "initializing" && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes scanMove {
          0%, 100% { top: 15%; opacity: 0.5; }
          50% { top: 80%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
