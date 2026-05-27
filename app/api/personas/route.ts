import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = await getDB();
    const all = req.nextUrl.searchParams.get('all') === 'true';

    const result = await db.execute(
      all
        ? 'SELECT * FROM personas ORDER BY orden ASC, id ASC'
        : 'SELECT * FROM personas WHERE activo = 1 ORDER BY orden ASC, id ASC'
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = await getDB();
  const body = await req.json();
  const nombre: string = body.nombre;

  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return NextResponse.json({ error: 'nombre requerido' }, { status: 400 });
  }

  const maxOrden = await db.execute('SELECT COALESCE(MAX(orden), -1) as max FROM personas');
  const nextOrden = Number(maxOrden.rows[0].max) + 1;

  const result = await db.execute({
    sql: 'INSERT INTO personas (nombre, orden) VALUES (?, ?) RETURNING *',
    args: [nombre.trim(), nextOrden],
  });

  return NextResponse.json(result.rows[0], { status: 201 });
}
