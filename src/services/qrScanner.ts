import QrScanner from 'qr-scanner';

export class QRScannerService {
  private static scanner: QrScanner | null = null;
  private static videoElement: HTMLVideoElement | null = null;

  static async startScanning(
    videoElement: HTMLVideoElement,
    onResult: (result: string) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      this.videoElement = videoElement;
      
      this.scanner = new QrScanner(
        videoElement,
        (result) => {
          onResult(result.data);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await this.scanner.start();
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }

  static stopScanning(): void {
    if (this.scanner) {
      this.scanner.stop();
      this.scanner.destroy();
      this.scanner = null;
    }
  }

  static async hasCamera(): Promise<boolean> {
    return QrScanner.hasCamera();
  }

  static async listCameras(): Promise<QrScanner.Camera[]> {
    return QrScanner.listCameras(true);
  }

  static setCamera(deviceId: string): void {
    if (this.scanner) {
      this.scanner.setCamera(deviceId);
    }
  }
}