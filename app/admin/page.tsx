'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
const QRModal = dynamic(() => import('@/components/QRModal'), { ssr: false });
import { getMonthName, parseTimestamp, getTodayLocalString } from '@/lib/utils';
import type { ResumenRow } from '@/lib/utils';

interface Persona {
  id: number;
  nombre: string;
  activo: number;
  orden: number;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const now = useMemo(() => new Date(), []);
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());

  const [resumen, setResumen] = useState<ResumenRow[]>([]);
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [newName, setNewName] = useState('');
  const [loadingResumen, setLoadingResumen] = useState(false);

  // New registro form
  const [newRegPersonaId, setNewRegPersonaId] = useState('');
  const [newRegFecha, setNewRegFecha] = useState('');
  const [addingReg, setAddingReg] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') setAuthed(true);
    setAppUrl(window.location.origin);
    setNewRegFecha(getTodayLocalString());
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem('admin_auth', 'true');
      setAuthed(true);
    } else {
      setAuthError('Contraseña incorrecta');
    }
  };

  const loadResumen = useCallback(async () => {
    setLoadingResumen(true);
    try {
      const res = await fetch(`/api/registros/resumen?mes=${mes}&anio=${anio}`);
      setResumen(await res.json());
    } finally {
      setLoadingResumen(false);
    }
  }, [mes, anio]);

  const loadPersonas = useCallback(async () => {
    const res = await fetch('/api/personas?all=true');
    setPersonas(await res.json());
  }, []);

  useEffect(() => { if (authed) loadResumen(); }, [authed, loadResumen]);
  useEffect(() => { if (authed) loadPersonas(); }, [authed, loadPersonas]);

  // "Por día" view with registro IDs for deletion
  const byDia = useMemo(() => {
    const map = new Map<string, { id: number; nombre: string }[]>();
    for (const row of resumen) {
      for (const d of row.dias) {
        if (!map.has(d.fecha)) map.set(d.fecha, []);
        map.get(d.fecha)!.push({ id: d.id, nombre: row.nombre });
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, registros]) => ({ fecha, registros }));
  }, [resumen]);

  const handleDeleteRegistro = async (id: number) => {
    await fetch(`/api/registros/${id}`, { method: 'DELETE' });
    loadResumen();
  };

  const handleAddRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegPersonaId || !newRegFecha) return;
    setAddingReg(true);
    setRegError('');
    try {
      const res = await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona_id: Number(newRegPersonaId), fecha: newRegFecha }),
      });
      if (res.status === 409) {
        setRegError('Esa persona ya tiene registro en esa fecha.');
      } else {
        setNewRegPersonaId('');
        loadResumen();
      }
    } finally {
      setAddingReg(false);
    }
  };

  const handleExportCSV = async () => {
    const res = await fetch(`/api/registros/export?mes=${mes}&anio=${anio}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almuerzos-${anio}-${String(mes).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: newName.trim() }),
    });
    setNewName('');
    loadPersonas();
  };

  const toggleActivo = async (id: number, activo: number) => {
    await fetch(`/api/personas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: activo === 1 ? 0 : 1 }),
    });
    loadPersonas();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
    setPassword('');
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">🍽️ Admin</h1>
          <p className="text-gray-400 text-center mb-6 text-sm">Panel de administración</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              autoFocus
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-lg transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </main>
    );
  }

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const personasActivas = personas.filter((p) => p.activo === 1);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Panel Admin</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowQR(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            QR 📱
          </button>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Salir
          </button>
        </div>
      </header>

      {/* Month selector + export */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
            {months.map((m) => <option key={m} value={m}>{getMonthName(m)}</option>)}
          </select>
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors">
            Exportar CSV ⬇️
          </button>
        </div>
      </section>

      {/* Summary by person */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Resumen — {getMonthName(mes)} {anio}</h2>
          {!loadingResumen && (
            <span className="text-xs text-gray-400">{resumen.reduce((s, r) => s + r.cantidad, 0)} registros</span>
          )}
        </div>
        {loadingResumen ? (
          <div className="py-8 text-center text-gray-400">Cargando...</div>
        ) : resumen.length === 0 ? (
          <div className="py-8 text-center text-gray-400">Sin registros este mes</div>
        ) : (
          <div>
            {resumen.map((row) => (
              <div key={row.nombre} className="border-b border-gray-50 last:border-0">
                <button
                  onClick={() => setExpandedPersona(expandedPersona === row.nombre ? null : row.nombre)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800">{row.nombre}</span>
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {row.cantidad} {row.cantidad === 1 ? 'almuerzo' : 'almuerzos'}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs ml-2">{expandedPersona === row.nombre ? '▲' : '▼'}</span>
                </button>
                {expandedPersona === row.nombre && (
                  <div className="px-4 pb-3 bg-gray-50 space-y-1.5">
                    {row.dias.map((d) => (
                      <div key={d.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{d.fecha}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">{parseTimestamp(d.created_at)} UTC</span>
                          <button
                            onClick={() => handleDeleteRegistro(d.id)}
                            className="text-red-400 hover:text-red-600 font-bold text-base leading-none"
                            title="Borrar registro"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Por día con delete */}
      {byDia.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Por día</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {byDia.map(({ fecha, registros }) => (
              <div key={fecha} className="px-4 py-3">
                <p className="text-sm font-medium text-gray-500 mb-1.5">{fecha}</p>
                <div className="flex flex-wrap gap-2">
                  {registros.map(({ id, nombre }) => (
                    <span key={id} className="inline-flex items-center gap-1 bg-green-50 text-green-800 text-sm px-2 py-0.5 rounded-full">
                      {nombre}
                      <button
                        onClick={() => handleDeleteRegistro(id)}
                        className="text-red-400 hover:text-red-600 font-bold leading-none ml-0.5"
                        title="Borrar"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Agregar registro manual */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Agregar registro manual</h2>
        </div>
        <form onSubmit={handleAddRegistro} className="px-4 py-3 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <select
              value={newRegPersonaId}
              onChange={(e) => setNewRegPersonaId(e.target.value)}
              className="flex-1 min-w-[140px] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="">— Persona —</option>
              {personasActivas.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <input
              type="date"
              value={newRegFecha}
              onChange={(e) => setNewRegFecha(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <button
              type="submit"
              disabled={!newRegPersonaId || !newRegFecha || addingReg}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            >
              {addingReg ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
          {regError && <p className="text-red-500 text-sm">{regError}</p>}
        </form>
      </section>

      {/* Personas CRUD */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">Personas</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {personas.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3">
              <span className={`font-medium ${p.activo ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                {p.nombre}
              </span>
              <button
                onClick={() => toggleActivo(p.id, p.activo)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  p.activo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {p.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddPersona} className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Agregar persona..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
          >
            Agregar
          </button>
        </form>
      </section>

      {showQR && <QRModal url={appUrl} onClose={() => setShowQR(false)} />}
    </main>
  );
}
