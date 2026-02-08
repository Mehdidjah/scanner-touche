import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, CheckCircle } from "lucide-react";

interface FaceScanCameraProps {
    onCapture: (file: File, preview: string) => void;
}

export function FaceScanCamera({ onCapture }: FaceScanCameraProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'initializing' | 'scanning' | 'detected' | 'captured'>('initializing');
    const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number>(3);
    
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

        // Capture function - captures silently and stores the image
        const capturePhoto = () => {
            if (hasCapturedRef.current || !mountedRef.current) {
                return;
            }

            hasCapturedRef.current = true;

            setTimeout(() => {
                const container = containerRef.current;
                const canvas = container?.querySelector('canvas') as HTMLCanvasElement 
                    || document.querySelector('a-scene canvas') as HTMLCanvasElement;

                if (!canvas) {
                    console.error('No canvas found');
                    return;
                }

                canvas.toBlob((blob) => {
                    if (!blob || !mountedRef.current) return;

                    const file = new File([blob], `face-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const preview = URL.createObjectURL(blob);

                    setCapturedPreview(preview);
                    setStatus('captured');
                    
                    // Send to parent - user will click button to analyze
                    onCaptureRef.current(file, preview);
                }, 'image/jpeg', 0.92);
            }, 100);
        };

        // Initialize XR / A-Frame
        const init = () => {
            const win = window as any;
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds max wait

            const tryInit = () => {
                attempts++;
                
                // Check if scripts are loaded
                if (!win.AFRAME || !win.XR8 || !win.THREE) {
                    if (attempts < maxAttempts) {
                        initTimeout = setTimeout(tryInit, 100);
                        return;
                    } else {
                        console.error('8th Wall scripts failed to load after 10 seconds');
                        setStatus('scanning'); // Show camera anyway
                        return;
                    }
                }

                const AFRAME = win.AFRAME;
                const THREE = win.THREE;

                // Hide any 8th Wall loading overlays that get injected
                const hideLoadingScreens = () => {
                    const selectors = [
                        '.xrextras-loading',
                        '.xrextras-runtime-error',
                        '[class*="xrextras-loading"]',
                        '#loadingContainer',
                        '[class*="powered"]',
                        '[id*="loading"]',
                        '[id*="8thwall"]',
                    ];
                    selectors.forEach(selector => {
                        try {
                            const elements = document.querySelectorAll(selector);
                            elements.forEach(el => {
                                (el as HTMLElement).style.display = 'none';
                                (el as HTMLElement).style.opacity = '0';
                                (el as HTMLElement).style.visibility = 'hidden';
                                (el as HTMLElement).style.pointerEvents = 'none';
                            });
                        } catch (e) {
                            // Ignore selector errors
                        }
                    });
                };

                // Run immediately and periodically to catch dynamically injected elements
                hideLoadingScreens();
                const hideInterval = setInterval(hideLoadingScreens, 100);
                setTimeout(() => clearInterval(hideInterval), 5000);

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
                            let animFrame: number | null = null;
                            let scanTime = 0;
                            
                            const colors = ['#0047ab', '#00ffff', '#87ceeb', '#00bfff', '#0047ab'];
                            
                            const lerpColor = (c1: string, c2: string, t: number) => {
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

                            const animate = () => {
                                if (hasCapturedRef.current) return;
                                
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

                            scene.addEventListener('xrfacefound', () => {
                                if (mountedRef.current && !hasCapturedRef.current) {
                                    setStatus('detected');
                                }
                            });

                            scene.addEventListener('xrfacelost', () => {
                                if (mountedRef.current && !hasCapturedRef.current) {
                                    setStatus('scanning');
                                }
                            });

                            scene.addEventListener('realityready', () => {
                                if (!mountedRef.current) return;
                                
                                setStatus('scanning');
                                setTimeout(animate, 200);

                                let timeLeft = 3;
                                countdownInterval = setInterval(() => {
                                    timeLeft--;
                                    if (mountedRef.current) {
                                        setCountdown(timeLeft);
                                    }
                                    if (timeLeft <= 0 && countdownInterval) {
                                        clearInterval(countdownInterval);
                                    }
                                }, 1000);

                                // Auto-capture after 3 seconds
                                captureTimeout = setTimeout(() => {
                                    if (animFrame) cancelAnimationFrame(animFrame);
                                    
                                    // Hide scan overlays
                                    const lipstick = document.getElementById('lipstick');
                                    const leftEye = document.getElementById('leftIris');
                                    const rightEye = document.getElementById('rightIris');
                                    
                                    if (lipstick) lipstick.setAttribute('material', 'visible: false');
                                    if (leftEye) leftEye.setAttribute('visible', 'false');
                                    if (rightEye) rightEye.setAttribute('visible', 'false');
                                    
                                    capturePhoto();
                                }, 3000);
                            });
                        }
                    });
                }
                } catch (error) {
                    console.error('Registration error:', error);
                    setStatus('scanning'); // Continue anyway
                }
            };

            // Start the initialization attempt
            tryInit();
        };

        // Start initialization
        init();

        // Hard fallback
        hardTimeout = setTimeout(() => {
            if (!mountedRef.current || hasCapturedRef.current) return;
            capturePhoto();
        }, 5000);

        return () => {
            mountedRef.current = false;
            if (initTimeout) clearTimeout(initTimeout);
            if (captureTimeout) clearTimeout(captureTimeout);
            if (countdownInterval) clearInterval(countdownInterval);
            if (hardTimeout) clearTimeout(hardTimeout);
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="relative w-full h-64 md:h-80 bg-black rounded-lg overflow-hidden"
            style={{ isolation: 'isolate' }}
        >
            {/* Show captured preview OR live camera */}
            {status === 'captured' && capturedPreview ? (
                // Show the captured image
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <img 
                        src={capturedPreview} 
                        alt="Captured face" 
                        className="w-full h-full object-cover"
                    />
                    {/* Success indicator */}
                    <div className="absolute top-4 left-0 right-0 z-50 flex justify-center">
                        <div className="px-4 py-2 rounded-full bg-green-900/80 border-2 border-green-400 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-bold">Photo Ready</span>
                        </div>
                    </div>
                </div>
            ) : (
                // Live camera with A-Frame
                <>
                    <div className="absolute inset-0 overflow-hidden" style={{ contain: 'strict' }}>
                        {/* @ts-ignore */}
                        <a-scene
                            embedded
                            vr-mode-ui="enabled: false"
                            xrface="uvType: standard; maxDetections:1; allowedDevices: any; cameraDirection: front; mirroredDisplay: true"
                            face-scanner
                            style={{ 
                                width: '100%', 
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
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

                    {/* Scanning overlay - only show during scanning/detected */}
                    {(status === 'scanning' || status === 'detected') && (
                        <>
                            {/* Status badge */}
                            <div className="absolute top-4 left-0 right-0 z-50 pointer-events-none">
                                <div className="flex justify-center">
                                    <div className={`px-4 py-2 rounded-full backdrop-blur-md border-2 ${
                                        status === 'detected' 
                                            ? 'bg-cyan-900/80 border-cyan-400' 
                                            : 'bg-blue-900/80 border-blue-400'
                                    }`}>
                                        <p className={`text-sm font-bold ${
                                            status === 'detected' ? 'text-cyan-400' : 'text-blue-400'
                                        }`}>
                                            {status === 'detected' 
                                                ? `✅ Face Found! ${countdown}s` 
                                                : `🔍 Scanning... ${countdown}s`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Face frame */}
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

                            {/* Bottom instruction */}
                            <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-none">
                                <p className="text-white text-center text-sm font-medium">
                                    {status === 'detected' ? '✨ Hold still...' : 'Position your face in the frame'}
                                </p>
                            </div>
                        </>
                    )}

                    {/* Initializing state - minimal */}
                    {status === 'initializing' && (
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
