import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import { QRScannerService } from '../services/qrScanner';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (result: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      setError(null);
      
      const hasCamera = await QRScannerService.hasCamera();
      if (!hasCamera) {
        setError('Nenhuma câmera encontrada no dispositivo');
        return;
      }

      const availableCameras = await QRScannerService.listCameras();
      setCameras(availableCameras);
      
      if (availableCameras.length > 0 && !selectedCamera) {
        setSelectedCamera(availableCameras[0].id);
      }

      if (videoRef.current) {
        await QRScannerService.startScanning(
          videoRef.current,
          (result) => {
            onResult(result);
            onClose();
          },
          (error) => {
            setError(`Erro no scanner: ${error.message}`);
          }
        );
        setIsScanning(true);
      }
    } catch (error) {
      setError(`Erro ao inicializar câmera: ${(error as Error).message}`);
    }
  };

  const stopScanning = () => {
    QRScannerService.stopScanning();
    setIsScanning(false);
  };

  const switchCamera = (cameraId: string) => {
    setSelectedCamera(cameraId);
    QRScannerService.setCamera(cameraId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Escanear QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error ? (
          <div className="text-center py-8">
            <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={initializeScanner}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div>
            <div className="relative mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
                  <div className="text-white text-center">
                    <Camera className="mx-auto h-8 w-8 mb-2" />
                    <p>Iniciando câmera...</p>
                  </div>
                </div>
              )}
            </div>

            {cameras.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Câmera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Câmera ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-sm text-gray-600 text-center">
              Posicione o QR Code dentro da área de visualização
            </p>
          </div>
        )}
      </div>
    </div>
  );
};