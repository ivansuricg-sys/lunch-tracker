'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  url: string;
  onClose: () => void;
}

export default function QRModal({ url, onClose }: QRModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">QR de acceso</h2>
        <div className="flex justify-center mb-4 p-4 bg-white rounded-xl border border-gray-100">
          <QRCodeSVG value={url} size={220} includeMargin />
        </div>
        <p className="text-xs text-gray-400 mb-6 break-all">{url}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Imprimir 🖨️
          </button>
        </div>
      </div>
    </div>
  );
}
