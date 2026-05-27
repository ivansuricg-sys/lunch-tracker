import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getTodayLocalString } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const db = await getDB();
  const fecha = req.nextUrl.searchParams.get('fecha') || getTodayLocalString();

  const result = await db.execute({
    sql: 'SELECT persona_id FROM registros WHERE fecha = ?',
    args: [fecha],
  });

  return NextResponse.json(result.rows.map((r) => Number(r.persona_id)));
}
