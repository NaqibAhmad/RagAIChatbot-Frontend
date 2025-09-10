import React, { useEffect, useState } from 'react';
import { licenseService } from '@/services/license';
import toast from 'react-hot-toast';

interface LicenseGateProps {
  children: React.ReactNode;
}

const LicenseGate: React.FC<LicenseGateProps> = ({ children }) => {
  const [licenseKey, setLicenseKey] = useState<string>(licenseService.getKey() || '');
  const [isLicensed, setIsLicensed] = useState<boolean>(licenseService.isPresent());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const onCleared = () => {
      setIsLicensed(false);
      setLicenseKey('');
      toast.error('License invalid or missing. Please enter a valid license key.');
    };
    const onUpdated = () => {
      setIsLicensed(licenseService.isPresent());
      setLicenseKey(licenseService.getKey() || '');
    };

    window.addEventListener('license:cleared', onCleared as EventListener);
    window.addEventListener('license:updated', onUpdated as EventListener);
    return () => {
      window.removeEventListener('license:cleared', onCleared as EventListener);
      window.removeEventListener('license:updated', onUpdated as EventListener);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = licenseKey.trim();
    if (!trimmed) {
      toast.error('Please enter your license key');
      return;
    }
    setIsSubmitting(true);
    try {
      licenseService.setKey(trimmed);
      setIsLicensed(true);
      toast.success('License applied');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLicensed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Enter License Key</h1>
          <p className="text-gray-500 mt-1">Access is restricted. Please provide your license key to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Key</label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-60"
          >
            {isSubmitting ? 'Applying…' : 'Apply License'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LicenseGate;


