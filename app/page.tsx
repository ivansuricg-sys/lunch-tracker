'use client';

import { useEffect, useState, useCallback } from 'react';
import PersonaBoton from '@/components/PersonaBoton';
import ConfirmModal from '@/components/ConfirmModal';
import { formatDateSpanish, getTodayLocalString } from '@/lib/utils';

interface Persona {
  id: number;
  nombre: string;
  activo: number;
  orden: number;
}

export default function Home() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [registradosHoy, setRegistradosHoy] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [today] = useState(() => getTodayLocalString());

  const loadData = useCallback(async () => {
    try {
      const [personasRes, hoyRes] = await Promise.all([
        fetch('/api/personas'),
        fetch(`/api/registros/hoy?fecha=${today}`),
      ]);
      const personasData: Persona[] = await personasRes.json();
      const hoyData: number[] = await hoyRes.json();
      setPersonas(personasData);
      setRegistradosHoy(new Set(hoyData));
    } finally {
      setLoadingData(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona_id: selected.id, fecha: today }),
      });
      if (res.ok || res.status === 409) {
        setRegistradosHoy((prev) => new Set([...prev, selected.id]));
        const nombre = selected.nombre;
        setSelected(null);
        setToast(`¡Listo, ${nombre}! Registrado 🎉`);
        setTimeout(() => setToast(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) setSelected(null);
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-6 pb-24">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">🍽️ Almuerzo</h1>
        <p className="text-gray-500 mt-1 text-lg">{formatDateSpanish(today)}</p>
      </header>

      {loadingData ? (
        <div className="text-center text-gray-400 py-16 text-lg">Cargando...</div>
      ) : personas.length === 0 ? (
        <div className="text-center text-gray-400 py-16">No hay personas registradas.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {personas.map((p) => (
            <PersonaBoton
              key={p.id}
              nombre={p.nombre}
              yaRegistrado={registradosHoy.has(p.id)}
              onClick={() => setSelected(p)}
            />
          ))}
        </div>
      )}

      <footer className="mt-8 text-center">
        <a href="/admin" className="text-xs text-gray-300 hover:text-gray-400 transition-colors">
          admin
        </a>
      </footer>

      {selected && (
        <ConfirmModal
          nombre={selected.nombre}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </main>
  );
}
