'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CameraOff, X } from 'lucide-react';

interface QRCameraProps {
  onScan: (result: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCamera({ onScan, isOpen, onClose }: QRCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const initScanner = async () => {
      try {
        setError(null);
        setPermissionDenied(false);

        // Check if device has camera
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');

        if (!hasCamera) {
          setError('No se encontró cámara en tu dispositivo');
          return;
        }

        const newScanner = new QrScanner(
          videoRef.current!,
          (result) => {
            // Extract the text from the QR code result
            const qrText = result.data;
            onScan(qrText);
            setIsScanning(true);
            // Stop scanning after successful detection
            setTimeout(() => {
              newScanner.stop();
              setIsScanning(false);
            }, 500);
          },
          {
            onDecodeError: () => {
              // Silent error - normal during scanning
            },
            maxScansPerSecond: 5,
            preferredCamera: 'environment',
          }
        );

        await newScanner.start();
        setScanner(newScanner);
        setIsScanning(true);
      } catch (err: any) {
        console.error('Error initializing QR scanner:', err);
        if (err.name === 'NotAllowedError' || err.message.includes('Permission')) {
          setPermissionDenied(true);
          setError('Permiso de cámara denegado. Por favor, habilita la cámara en la configuración de tu navegador.');
        } else if (err.name === 'NotFoundError') {
          setError('No se encontró cámara disponible');
        } else {
          setError('Error al iniciar la cámara: ' + (err.message || 'Error desconocido'));
        }
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.destroy();
        setScanner(null);
        setIsScanning(false);
      }
    };
  }, [isOpen, onScan]);

  const handleClose = () => {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      setScanner(null);
      setIsScanning(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Escanear Código QR</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleClose}
                  className="flex-1"
                  variant="outline"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-green-500 rounded-lg animate-pulse" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  {isScanning
                    ? 'Apunta la cámara hacia el código QR'
                    : 'Inicializando cámara...'}
                </p>
              </div>

              <div className="flex gap-2">
                {isScanning && (
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1"
                  >
                    <CameraOff className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
                {!isScanning && !error && (
                  <Button
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
