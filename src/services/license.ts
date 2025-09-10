export class LicenseService {
  private static readonly STORAGE_KEY = 'license_key';
  private static readonly HEADER_NAME = 'X-License-Key';

  get headerName(): string {
    return LicenseService.HEADER_NAME;
  }

  getKey(): string | null {
    try {
      return localStorage.getItem(LicenseService.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to read license key from storage', error);
      return null;
    }
  }

  setKey(key: string): void {
    try {
      localStorage.setItem(LicenseService.STORAGE_KEY, key);
      window.dispatchEvent(new CustomEvent('license:updated'));
    } catch (error) {
      console.error('Failed to save license key', error);
    }
  }

  clearKey(): void {
    try {
      localStorage.removeItem(LicenseService.STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('license:cleared'));
    } catch (error) {
      console.error('Failed to clear license key', error);
    }
  }

  isPresent(): boolean {
    const key = this.getKey();
    return Boolean(key && key.trim().length > 0);
  }
}

export const licenseService = new LicenseService();


