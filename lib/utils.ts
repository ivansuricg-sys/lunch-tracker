export type ResumenRow = {
  nombre: string;
  cantidad: number;
  dias: { fecha: string; created_at: string }[];
};

export function formatDateSpanish(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}

export function getTodayLocalString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return months[month - 1];
}

export function parseTimestamp(ts: string): string {
  if (ts.includes('T')) return ts.split('T')[1].slice(0, 5);
  if (ts.includes(' ')) return ts.split(' ')[1]?.slice(0, 5) ?? ts;
  return ts;
}

export function generateCSV(data: ResumenRow[], mes: number, anio: number): string {
  const header = `Registro de almuerzos - ${getMonthName(mes)} ${anio}\n`;
  const cols = 'Nombre,Fecha,Hora de registro\n';
  const rows = data.flatMap((p) =>
    p.dias.map((d) => `"${p.nombre}","${d.fecha}","${parseTimestamp(d.created_at)}"`)
  );
  // BOM for Excel UTF-8 compatibility
  return '﻿' + header + cols + rows.join('\n');
}
