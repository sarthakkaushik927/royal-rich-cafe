import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFrameSequenceProps {
  /** Path to the folder containing frame images (relative to /public), e.g. "/heroassets" */
  assetFolder: string;
  /** Total number of frames in the sequence */
  frameCount: number;
  /**
   * A function that returns the filename for a given 1-based frame index.
   * Example: (i) => `frame_${String(i).padStart(4, '0')}.jpg`
   */
  getFrameName: (index: number) => string;
  /** How tall the scroll-through area is (in vh units). Default 300. */
  scrollHeightVh?: number;
  /** Extra CSS class names for the outer container */
  className?: string;
  /** Optional overlay content (text, CTAs, etc.) rendered on top of the canvas */
  children?: React.ReactNode;
}

/**
 * Draws an image onto a canvas using "cover" fit logic,
 * centering the image and cropping overflow — just like CSS `object-fit: cover`.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imgRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    offsetX = 0;
    offsetY = (canvasHeight - drawHeight) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

export default function ScrollFrameSequence({
  assetFolder,
  frameCount,
  getFrameName,
  scrollHeightVh = 300,
  className = '',
  children,
}: ScrollFrameSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // ─── Build full src path for a frame ────────────────────────────────
  const getFrameSrc = useCallback(
    (index: number) => `${assetFolder}/${getFrameName(index)}`,
    [assetFolder, getFrameName]
  );

  // ─── Render a specific frame onto the canvas ───────────────────────
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[index];
    if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Only resize the backing store when the display size actually changes
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    drawCover(ctx, img, displayWidth, displayHeight);
  }, []);

  // ─── Preload all frames ─────────────────────────────────────────────
  useEffect(() => {
    let loadedCount = 0;
    const totalFrames = frameCount;
    const images: HTMLImageElement[] = new Array(totalFrames);

    const onFrameReady = () => {
      loadedCount++;
      setLoadProgress(Math.round((loadedCount / totalFrames) * 100));
      if (loadedCount >= totalFrames) {
        imagesRef.current = images;
        setLoaded(true);
        // Draw the first frame once everything is ready
        renderFrame(0);
      }
    };

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameSrc(i + 1); // frames are 1-indexed on disk
      img.onload = onFrameReady;
      img.onerror = onFrameReady;
      images[i] = img;
    }

    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
      imagesRef.current = [];
    };
  }, [frameCount, getFrameSrc, renderFrame]);

  // ─── GSAP ScrollTrigger setup ───────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;

    const ctx = gsap.context(() => {
      const obj = { frame: 0 };

      gsap.to(obj, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
        onUpdate: () => {
          const newFrame = Math.round(obj.frame);
          if (newFrame !== currentFrameRef.current) {
            currentFrameRef.current = newFrame;
            if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = requestAnimationFrame(() => {
              renderFrame(newFrame);
            });
          }
        },
      });
    }, containerRef);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      ctx.revert();
    };
  }, [loaded, frameCount, renderFrame]);

  // ─── Handle window resize → re-render current frame ────────────────
  useEffect(() => {
    if (!loaded) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      renderFrame(currentFrameRef.current);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loaded, renderFrame]);

  // Circumference for the SVG ring progress indicator
  const circumference = 2 * Math.PI * 34;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: `${scrollHeightVh}vh`, position: 'relative' }}
    >
      {/* Sticky inner viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Loading state */}
        {!loaded && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-background">
            {/* Progress ring */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle
                cx="40" cy="40" r="34"
                fill="none" stroke="rgba(43,27,23,0.08)" strokeWidth="3"
              />
              <circle
                cx="40" cy="40" r="34"
                fill="none" stroke="#D4AF37" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - loadProgress / 100)}
                className="origin-center -rotate-90 transition-[stroke-dashoffset] duration-300 ease-out"
              />
              <text
                x="40" y="44"
                textAnchor="middle"
                fill="#2B1B17"
                fontSize="14"
                fontFamily="'Inter', sans-serif"
                fontWeight="500"
              >
                {loadProgress}%
              </text>
            </svg>
            <span className="font-body text-[10px] tracking-[0.25em] uppercase text-text-muted">
              Loading frames
            </span>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="block w-full h-full bg-background"
        />

        {/* Overlay content */}
        {loaded && children}
      </div>
    </div>
  );
}
