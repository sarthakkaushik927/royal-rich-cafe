"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function QRScanner({ onClose, onScan }: { onClose: () => void; onScan?: (text: string) => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader-container";

  useEffect(() => {
    let mounted = true;
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Prefer back camera
          const backCamera = cameras.find(c => c.label.toLowerCase().includes('back')) || cameras[0];
          
          if (!mounted) return;
          
          await scanner.start(
            backCamera.id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            async (decodedText) => {
              // Success callback
              
              if (scannerRef.current?.isScanning) {
                try {
                  await scannerRef.current.stop();
                } catch (e) {}
              }

              if (onScan) {
                onScan(decodedText);
                onClose();
              } else {
                try {
                  toast.success('QR Code Scanned Successfully!');
                  const url = new URL(decodedText);
                  if (url.origin === window.location.origin) {
                    router.push(url.pathname + url.search);
                  } else {
                    window.location.href = decodedText;
                  }
                  onClose();
                } catch (e) {
                  console.error("Invalid QR content", decodedText);
                  toast.error('Invalid QR Code');
                  onClose();
                }
              }
            },
            (errorMessage) => {
              // Parse errors are frequent during scanning, ignore them
            }
          );
          if (mounted) setIsStarting(false);
        } else {
          if (mounted) {
            setError("No cameras found on your device.");
            setIsStarting(false);
          }
        }
      } catch (err) {
        console.error("Camera start error", err);
        if (mounted) {
          setError("Failed to access camera. Please allow camera permissions.");
          setIsStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);

  const handleClose = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-[#1A1410] border border-[#D4A24C]/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative flex flex-col items-center">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute -top-3 -right-3 bg-[#D4A24C] text-[#1A1410] rounded-full p-1.5 hover:bg-[#c8963f] transition-colors shadow-lg z-10"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-[#D4A24C] mb-4">
          <Camera size={24} />
          <h2 className="font-serif text-xl font-bold">Scan QR Code</h2>
        </div>

        {/* Scanner Container */}
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-black relative border border-white/10 flex items-center justify-center">
          {isStarting && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1410] z-10">
              <Loader2 className="w-8 h-8 text-[#D4A24C] animate-spin mb-2" />
              <p className="text-[#C7BFB2] text-sm">Starting camera...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1410] z-10 p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button 
                onClick={handleClose}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Close Scanner
              </button>
            </div>
          )}
          
          <div id={containerId} className="w-full h-full !border-none"></div>
        </div>

        <style>{`
          #${containerId} {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
          }
          #${containerId} video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 0.75rem !important;
          }
          /* Hide the default QR box if we want, or let it stay */
          #qr-shaded-region {
            border-radius: 0.75rem !important;
          }
        `}</style>

        <p className="text-[#C7BFB2] mt-5 text-center text-sm">
          Position the QR code inside the frame to scan.
        </p>
      </div>
    </div>
  );
}
