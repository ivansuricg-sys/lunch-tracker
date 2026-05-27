'use client';

interface PersonaBotonProps {
  nombre: string;
  yaRegistrado: boolean;
  onClick: () => void;
}

export default function PersonaBoton({ nombre, yaRegistrado, onClick }: PersonaBotonProps) {
  if (yaRegistrado) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 w-full min-h-[80px] rounded-xl bg-gray-200 text-gray-500 text-lg font-medium cursor-not-allowed select-none"
      >
        <span className="text-green-500 text-xl">✓</span>
        <span>{nombre}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full min-h-[80px] rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-lg font-semibold transition-colors select-none touch-manipulation"
    >
      {nombre}
    </button>
  );
}
