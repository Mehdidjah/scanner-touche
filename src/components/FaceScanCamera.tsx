import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FaceScanCameraProps {
    onCapture: (file: File, preview: string) => void;
}

export function FaceScanCamera({ onCapture }: FaceScanCameraProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'loading' | 'scanning' | 'detected' | 'capturing' | 'captured'>('loading');
    const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
    // Countdown shown to the user before auto-capture.
    // We keep this short (3s) so the total scan time stays within ~3–5 seconds.
    const [countdown, setCountdown] = useState<number>(3);
    const { toast } = useToast();
    
    const onCaptureRef = useRef(onCapture);
    const mountedRef = useRef(true);
    const hasCapturedRef = useRef(false);

    useEffect(() => {
        onCaptureRef.current = onCapture;
    }, [onCapture]);

    useEffect(() => {
        mountedRef.current = true;
        hasCapturedRef.current = false;

        let initTimeout: NodeJS.Timeout | null = null;
        let captureTimeout: NodeJS.Timeout | null = null;
        let countdownInterval: NodeJS.Timeout | null = null;
        let hardTimeout: NodeJS.Timeout | null = null;

        // Simple capture function
        const capturePhoto = () => {
            if (hasCapturedRef.current || !mountedRef.current) {
                console.log('❌ Already captured or not mounted');
                return;
            }

            hasCapturedRef.current = true;
            console.log('📸 CAPTURING PHOTO NOW!');
            setStatus('capturing');

            setTimeout(() => {
                // Find canvas
                const canvas = document.querySelector('canvas') as HTMLCanvasElement;
                console.log('Canvas found:', !!canvas);

                if (!canvas) {
                    console.error('No canvas!');
                    toast({
                        title: "Error",
                        description: "Camera not ready. Refreshing...",
                        variant: "destructive",
                    });
                    setTimeout(() => window.location.reload(), 2000);
                    return;
                }

                // Capture from canvas
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('No blob created!');
                        return;
                    }

                    console.log('✅ Blob created! Size:', blob.size);

                    const file = new File([blob], `face-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const preview = URL.createObjectURL(blob);

                    if (!mountedRef.current) return;

                    setCapturedPreview(preview);
                    setStatus('captured');

                    console.log('✅ PHOTO CAPTURED SUCCESSFULLY!');

                    toast({
                        title: "✅ Perfect!",
                        description: "Face photo captured",
                    });

                    // Send to analysis
                    setTimeout(() => {
                        if (mountedRef.current) {
                            console.log('📤 Sending to analysis...');
                            onCaptureRef.current(file, preview);
                        }
                    }, 1500);
                }, 'image/jpeg', 0.92);
            }, 150);
        };

        // Initialize XR / A-Frame integration
        const init = () => {
            const win = window as any;

            if (!win.AFRAME || !win.XR8 || !win.THREE) {
                initTimeout = setTimeout(init, 100);
                return;
            }

            const AFRAME = win.AFRAME;
            const THREE = win.THREE;

            console.log('🎯 Initializing...');

            try {
                // Register alpha-map
                if (!AFRAME.components['alpha-map']) {
                    AFRAME.registerComponent('alpha-map', {
                        schema: { type: 'string' },
                        init() {
                            const scene = this.el.sceneEl;
                            const selector = this.data;
                            if (!selector) return;
                            
                            const resourceEl = scene.querySelector(selector);
                            const src = resourceEl ? resourceEl.getAttribute('src') : selector;
                            const alphaMap = new THREE.TextureLoader().load(src);

                            scene.addEventListener('xrfacefound', () => {
                                const mesh = this.el.getObject3D('mesh');
                                if (mesh?.material) {
                                    mesh.material.alphaMap = alphaMap;
                                    mesh.material.needsUpdate = true;
                                }
                            });
                        }
                    });
                }

                // Register face-scanner
                if (!AFRAME.components['face-scanner']) {
                    AFRAME.registerComponent('face-scanner', {
                        init() {
                            const scene = this.el.sceneEl;
                            let animFrame = null;
                            let scanTime = 0;
                            
                            // Holographic colors
                            const colors = ['#0047ab', '#00ffff', '#87ceeb', '#00bfff', '#0047ab'];
                            
                            const lerpColor = (c1, c2, t) => {
                                const r1 = parseInt(c1.slice(1, 3), 16);
                                const g1 = parseInt(c1.slice(3, 5), 16);
                                const b1 = parseInt(c1.slice(5, 7), 16);
                                const r2 = parseInt(c2.slice(1, 3), 16);
                                const g2 = parseInt(c2.slice(3, 5), 16);
                                const b2 = parseInt(c2.slice(5, 7), 16);
                                const r = Math.round(r1 + (r2 - r1) * t);
                                const g = Math.round(g1 + (g2 - g1) * t);
                                const b = Math.round(b1 + (b2 - b1) * t);
                                return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                            };

                            // Animate
                            const animate = () => {
                                scanTime += 0.03;
                                const pos = (Math.sin(scanTime) + 1) / 2;
                                const opacity = 0.4 + Math.sin(scanTime * 2) * 0.25;

                                const idx = Math.floor(pos * (colors.length - 1));
                                const nextIdx = Math.min(idx + 1, colors.length - 1);
                                const blend = (pos * (colors.length - 1)) - idx;
                                const color = lerpColor(colors[idx], colors[nextIdx], blend);

                                const lipstick = document.getElementById('lipstick');
                                const leftEye = document.getElementById('leftIris');
                                const rightEye = document.getElementById('rightIris');

                                if (lipstick) {
                                    lipstick.setAttribute('material', `color: ${color}; opacity: ${opacity}; visible: true; transparent: true`);
                                }
                                if (leftEye) {
                                    leftEye.setAttribute('material', `color: ${color}; opacity: ${opacity * 0.7}; transparent: true`);
                                }
                                if (rightEye) {
                                    rightEye.setAttribute('material', `color: ${color}; opacity: ${opacity * 0.7}; transparent: true`);
                                }

                                animFrame = requestAnimationFrame(animate);
                            };

                            // Face detection
                            scene.addEventListener('xrfacefound', () => {
                                if (mountedRef.current && !hasCapturedRef.current) {
                                    console.log('👤 Face detected!');
                                    setStatus('detected');
                                }
                            });

                            scene.addEventListener('xrfacelost', () => {
                                if (mountedRef.current && !hasCapturedRef.current) {
                                    console.log('👤 Face lost');
                                    setStatus('scanning');
                                }
                            });

                            // Camera ready
                            scene.addEventListener('realityready', () => {
                                if (!mountedRef.current) return;
                                
                                console.log('✅ CAMERA READY!');
                                setStatus('scanning');

                                // Start animation
                                setTimeout(animate, 200);

                                // Start countdown timer – keep it short so users
                                // are not waiting too long once the camera is ready.
                                let timeLeft = 3;
                                countdownInterval = setInterval(() => {
                                    timeLeft--;
                                    if (mountedRef.current) {
                                        setCountdown(timeLeft);
                                    }
                                    if (timeLeft <= 0) {
                                        if (countdownInterval) clearInterval(countdownInterval);
                                    }
                                }, 1000);

                                // GUARANTEED capture shortly after camera is ready
                                // (3 seconds after "realityready").
                                console.log('⏰ Setting 3-second auto-capture timer after camera ready...');
                                captureTimeout = setTimeout(() => {
                                    console.log('⏰ 3 SECONDS AFTER CAMERA READY - CAPTURING NOW!');
                                    
                                    // Stop animation
                                    if (animFrame) cancelAnimationFrame(animFrame);
                                    
                                    // Hide overlays
                                    const lipstick = document.getElementById('lipstick');
                                    const leftEye = document.getElementById('leftIris');
                                    const rightEye = document.getElementById('rightIris');
                                    
                                    if (lipstick) lipstick.setAttribute('material', 'visible: false');
                                    if (leftEye) leftEye.setAttribute('visible', 'false');
                                    if (rightEye) rightEye.setAttribute('visible', 'false');
                                    
                                    // Capture
                                    capturePhoto();
                                }, 3000);
                            });
                        }
                    });
                }

                console.log('✅ Components registered');
            } catch (error) {
                console.error('❌ Registration error:', error);
            }
        };

        // Start initialization
        init();

        // HARD upper bound: if for some reason the XR "realityready" event
        // never fires or takes too long, still attempt a capture after ~5s.
        // This keeps the overall scan duration within the 3–5 second window.
        hardTimeout = setTimeout(() => {
            if (!mountedRef.current || hasCapturedRef.current) {
                return;
            }

            console.log('⏰ HARD FALLBACK TIMEOUT REACHED (~5s) - ATTEMPTING CAPTURE');
            capturePhoto();
        }, 5000);

        return () => {
            mountedRef.current = false;
            if (initTimeout) clearTimeout(initTimeout);
            if (captureTimeout) clearTimeout(captureTimeout);
            if (countdownInterval) clearInterval(countdownInterval);
            if (hardTimeout) clearTimeout(hardTimeout);
        };
    }, [toast]);

    return (
        <div ref={containerRef} className="relative w-full h-64 md:h-80 bg-black rounded-lg overflow-hidden">
            
            {/* A-Frame Scene */}
            {status !== 'captured' && (
                <div className="absolute inset-0">
                    {/* @ts-ignore */}
                    <a-scene
                        embedded
                        vr-mode-ui="enabled: false"
                        xrextras-loading
                        xrextras-runtime-error
                        xrface="uvType: standard; maxDetections:1; allowedDevices: any; cameraDirection: front; mirroredDisplay: true"
                        face-scanner
                        style={{ width: '100%', height: '100%' }}
                    >
                        {/* @ts-ignore */}
                        <a-assets>
                            {/* @ts-ignore */}
                            <a-asset-item id="head-occluder" src="/face-scanner-assets/head-occluder.glb"></a-asset-item>
                        </a-assets>

                        {/* @ts-ignore */}
                        <xrextras-resource id="lipstick-alpha" src="/face-scanner-assets/alpha-masks/blush-alpha3grid.png"></xrextras-resource>
                        {/* @ts-ignore */}
                        <xrextras-resource id="contacts-alpha" src="/face-scanner-assets/alpha-masks/contacts-alpha.png"></xrextras-resource>

                        {/* @ts-ignore */}
                        <a-camera look-controls="enabled: false" wasd-controls="enabled: false" position="0 2 0" />

                        {/* @ts-ignore */}
                        <a-entity gltf-model="#head-occluder" position="0 0 0.02" xrextras-hider-material></a-entity>

                        {/* @ts-ignore */}
                        <xrextras-faceanchor id="face-anchor">
                            {/* @ts-ignore */}
                            <xrextras-face-mesh
                                id="lipstick"
                                material="shader:standard; visible:true; color:#0047ab; transparent:true; opacity:0.5"
                                alpha-map="#lipstick-alpha"
                            ></xrextras-face-mesh>

                            {/* @ts-ignore */}
                            <xrextras-face-attachment point="leftIris">
                                {/* @ts-ignore */}
                                <a-cylinder
                                    id="leftIris"
                                    alpha-map="#contacts-alpha"
                                    scale="0.9 0.9 0.9"
                                    height=".01"
                                    radius=".055"
                                    position="0 0 0.01"
                                    rotation="90 0 0"
                                    material="color:#00ffff; transparent:true; opacity:0.4"
                                ></a-cylinder>
                            </xrextras-face-attachment>

                            {/* @ts-ignore */}
                            <xrextras-face-attachment point="rightIris">
                                {/* @ts-ignore */}
                                <a-cylinder
                                    id="rightIris"
                                    alpha-map="#contacts-alpha"
                                    scale="0.9 0.9 0.9"
                                    height=".01"
                                    radius=".055"
                                    position="-0.003 0 0.01"
                                    rotation="90 0 0"
                                    material="color:#00ffff; transparent:true; opacity:0.4"
                                ></a-cylinder>
                            </xrextras-face-attachment>
                        </xrextras-faceanchor>

                        {/* @ts-ignore */}
                        <a-light type="directional" position="0 1.8 3" intensity="0.8" />
                        {/* @ts-ignore */}
                        <a-light type="ambient" intensity="0.6" />
                    </a-scene>
                </div>
            )}

            {/* Status Overlay */}
            <div className="absolute top-4 left-0 right-0 z-50 pointer-events-none">
                <div className="flex justify-center">
                    <div className={`px-6 py-3 rounded-full backdrop-blur-md border-2 ${
                        status === 'loading' ? 'bg-yellow-900/80 border-yellow-400' :
                        status === 'scanning' ? 'bg-blue-900/80 border-blue-400' :
                        status === 'detected' ? 'bg-cyan-900/80 border-cyan-400' :
                        status === 'capturing' ? 'bg-green-900/80 border-green-400' :
                        'bg-gray-900/80 border-gray-400'
                    }`}>
                        <p className={`text-lg font-bold ${
                            status === 'loading' ? 'text-yellow-400' :
                            status === 'scanning' ? 'text-blue-400' :
                            status === 'detected' ? 'text-cyan-400' :
                            status === 'capturing' ? 'text-green-400' :
                            'text-white'
                        }`}>
                            {status === 'loading' && '⏳ Starting Camera...'}
                            {status === 'scanning' && `🔍 Scanning... ${countdown}s`}
                            {status === 'detected' && `✅ Face Found! ${countdown}s`}
                            {status === 'capturing' && '📸 Taking Picture...'}
                            {status === 'captured' && '✅ Captured!'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Face Frame */}
            {(status === 'scanning' || status === 'detected') && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <div className={`relative w-44 h-56 md:w-52 md:h-64 border-4 rounded-full transition-all duration-500 ${
                        status === 'detected' 
                            ? 'border-cyan-400 shadow-[0_0_50px_rgba(0,255,255,0.8)] scale-105' 
                            : 'border-white/70 shadow-[0_0_30px_rgba(255,255,255,0.4)]'
                    }`}>
                        <div 
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full"
                            style={{
                                boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
                                animation: 'scanMove 2s ease-in-out infinite',
                            }}
                        />
                        
                        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-3xl" />
                        <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-3xl" />
                        <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-3xl" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-3xl" />
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-6 left-4 right-4 z-50 pointer-events-none">
                <div className="text-center">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <Camera className="w-12 h-12 mb-3 text-cyan-400 animate-pulse" />
                            <p className="text-white text-lg font-medium">Starting Camera...</p>
                            <Loader2 className="w-6 h-6 mt-2 text-cyan-400 animate-spin" />
                        </div>
                    )}
                    {(status === 'scanning' || status === 'detected') && (
                        <>
                            <p className="text-white text-xl font-bold mb-2">
                                {status === 'detected' ? '✨ Face Detected!' : 'Position Your Face'}
                            </p>
                            <p className="text-cyan-300 text-lg font-medium">
                                Photo in {countdown} second{countdown !== 1 ? 's' : ''}...
                            </p>
                        </>
                    )}
                    {status === 'capturing' && (
                        <p className="text-green-400 text-xl font-bold animate-pulse">
                            📸 Smile! Taking Photo...
                        </p>
                    )}
                </div>
            </div>

            {/* Flash */}
            {status === 'capturing' && (
                <div 
                    className="absolute inset-0 z-[60] bg-white"
                    style={{ animation: 'flash 0.5s ease-out' }}
                />
            )}

            {/* Success Screen */}
            {status === 'captured' && capturedPreview && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
                    <div className="relative mb-6">
                        <img 
                            src={capturedPreview} 
                            alt="Captured face" 
                            className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-green-400"
                            style={{ boxShadow: '0 0 50px rgba(34, 197, 94, 0.7)' }}
                        />
                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-green-900">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-3">Perfect Shot! ✨</h2>
                    <p className="text-green-300 text-center px-6 mb-6 text-lg">
                        Your face photo is ready!<br />
                        Starting skin analysis...
                    </p>

                    <div className="flex items-center gap-3 px-6 py-4 bg-green-500/20 rounded-full border-2 border-green-400/50">
                        <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                        <span className="text-green-300 font-semibold text-lg">Analyzing...</span>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes scanMove {
                    0%, 100% { top: 15%; opacity: 0.5; }
                    50% { top: 80%; opacity: 1; }
                }
                @keyframes flash {
                    0% { opacity: 0.9; }
                    50% { opacity: 0.1; }
                    100% { opacity: 0; }
                }
            `}</style>
        </div>
    );
}
