import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, AlertCircle, FlipHorizontal } from 'lucide-react';
import { Button } from './ui/Button';

export interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (errorMessage: string) => void;
  facingMode?: 'environment' | 'user';
  fps?: number;
  qrbox?: number | { width: number; height: number };
  className?: string;
  paused?: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  facingMode = 'environment',
  fps = 10,
  qrbox = 250,
  className = '',
  paused = false,
}) => {
  const containerId = useRef(`qr-scanner-${Math.random().toString(36).substring(2, 9)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>(facingMode);
  const isStartingRef = useRef(false);

  const startScanner = async (facing: 'environment' | 'user') => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setErrorMessage(null);

    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      }

      const scanner = new Html5Qrcode(containerId.current);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: facing },
        {
          fps,
          qrbox,
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          if (!paused) {
            onScan(decodedText);
          }
        },
        (scanError: string) => {
          // Continuous minor scan errors (no QR in frame) are ignored; real errors handled in catch
          if (onError) {
            onError(scanError);
          }
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Gagal mengakses kamera. Pastikan izin kamera telah diberikan.';
      setErrorMessage(errorMsg);
      setIsScanning(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        // Ignore stop error on unmount
      }
      setIsScanning(false);
    }
  };

  const toggleCamera = async () => {
    const nextMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    setCurrentFacingMode(nextMode);
    await startScanner(nextMode);
  };

  useEffect(() => {
    startScanner(currentFacingMode);

    return () => {
      stopScanner();
    };
  }, [currentFacingMode]);

  return (
    <div className={`relative flex flex-col items-center w-full max-w-sm mx-auto ${className}`}>
      {/* Scanner Viewport Container */}
      <div className="relative w-full aspect-square bg-slate-950 rounded-3xl overflow-hidden border-2 border-blue-300/60 shadow-xl">
        {/* html5-qrcode target div */}
        <div id={containerId.current} className="w-full h-full" />

        {/* Visual Viewfinder Frame & Scan Line */}
        {isScanning && !errorMessage && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-full h-full max-w-[260px] max-h-[260px] border-2 border-blue-400/40 rounded-2xl overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />

              {/* Animated scan line */}
              <div className="scanner-line" />
            </div>
          </div>
        )}

        {/* Error Fallback Overlay */}
        {errorMessage && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white gap-3 z-20">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <CameraOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Kamera Tidak Tersedia</h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
              {errorMessage}
            </p>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => startScanner(currentFacingMode)}
              className="mt-2"
            >
              Coba Lagi
            </Button>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3 mt-4 w-full">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FlipHorizontal className="w-4 h-4" />}
          onClick={toggleCamera}
          disabled={!isScanning}
        >
          Putar Kamera
        </Button>

        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={() => startScanner(currentFacingMode)}
        >
          Muat Ulang
        </Button>
      </div>
    </div>
  );
};

export default QRScanner;
