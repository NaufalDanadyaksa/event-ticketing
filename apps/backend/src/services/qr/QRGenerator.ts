import QRCode from 'qrcode';

export class QRGenerator {
  /**
   * Generates a base64 PNG data URL from input string using the qrcode library.
   * @param text String to encode in QR code
   * @param options Optional QRCodeToDataURLOptions for customization
   * @returns Promise<string> Base64 PNG data URL (e.g. data:image/png;base64,...)
   */
  public static async generateQRCodeDataURL(
    text: string,
    options?: QRCode.QRCodeToDataURLOptions
  ): Promise<string> {
    return QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#0F172A', // slate-900 for sharp, high-contrast readability
        light: '#FFFFFF',
      },
      ...options,
    });
  }

  public async generateQRCodeDataURL(
    text: string,
    options?: QRCode.QRCodeToDataURLOptions
  ): Promise<string> {
    return QRGenerator.generateQRCodeDataURL(text, options);
  }
}

export const qrGenerator = new QRGenerator();
export const generateQRCodeDataURL = QRGenerator.generateQRCodeDataURL;
