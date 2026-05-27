import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import type { ResumenRow } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const mes = req.nextUrl.searchParams.get('mes');
  const anio = req.nextUrl.searchParams.get('anio');

  if (!mes || !anio) return NextResponse.json({ error: 'mes y anio requeridos' }, { status: 400 });

  const prefix = `${anio}-${String(mes).padStart(2, '0')}`;

  const result = await execute({
    sql: `
      SELECT r.id, p.nombre, r.fecha, r.created_at
      FROM registros r
      JOIN personas p ON p.id = r.persona_id
      WHERE r.fecha LIKE ?
      ORDER BY p.nombre ASC, r.fecha ASC
    `,
    args: [`${prefix}-%`],
  });

  const map = new Map<string, ResumenRow>();

  for (const row of result.rows) {
    const nombre = String(row.nombre);
    if (!map.has(nombre)) map.set(nombre, { nombre, cantidad: 0, dias: [] });
    const entry = map.get(nombre)!;
    entry.cantidad++;
    entry.dias.push({
      id: Number(row.id),
      fecha: String(row.fecha),
      created_at: String(row.created_at),
    });
  }

  return NextResponse.json(Array.from(map.values()).sort((a, b) => b.cantidad - a.cantidad));
}
