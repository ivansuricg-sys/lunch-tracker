import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { generateYearCSV } from '@/lib/utils';
import type { YearRow } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const db = await getDB();
  const anio = Number(req.nextUrl.searchParams.get('anio'));

  if (!anio) {
    return NextResponse.json({ error: 'anio requerido' }, { status: 400 });
  }

  const result = await db.execute({
    sql: `
      SELECT p.nombre, CAST(SUBSTR(r.fecha, 6, 2) AS INTEGER) as mes
      FROM registros r
      JOIN personas p ON p.id = r.persona_id
      WHERE r.fecha LIKE ?
      ORDER BY p.nombre ASC
    `,
    args: [`${anio}-%`],
  });

  const map = new Map<string, number[]>();

  for (const row of result.rows) {
    const nombre = String(row.nombre);
    if (!map.has(nombre)) {
      map.set(nombre, new Array(12).fill(0));
    }
    const monthIndex = Number(row.mes) - 1;
    map.get(nombre)![monthIndex]++;
  }

  const data: YearRow[] = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([nombre, months]) => ({ nombre, months }));

  const csv = generateYearCSV(data, anio);
  const filename = `almuerzos-${anio}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
