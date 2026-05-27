'use client';

interface ConfirmModalProps {
  nombre: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ConfirmModal({ nombre, onConfirm, onCancel, loading }: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-2">¿Fuiste a almorzar hoy?</h2>
        <p className="text-gray-500 mb-6">
          Registrarás la asistencia de{' '}
          <span className="font-semibold text-gray-700">{nombre}</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Sí, fui 🍽️'}
          </button>
        </div>
      </div>
    </div>
  );
}
