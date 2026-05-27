import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(req: NextRequest) {
  const db = await getDB();
  const body = await req.json();
  const { persona_id, fecha } = body;

  if (!persona_id || !fecha) {
    return NextResponse.json({ error: 'persona_id y fecha requeridos' }, { status: 400 });
  }

  // Basic date format validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return NextResponse.json({ error: 'fecha inválida, usar YYYY-MM-DD' }, { status: 400 });
  }

  try {
    await db.execute({
      sql: 'INSERT INTO registros (persona_id, fecha) VALUES (?, ?)',
      args: [Number(persona_id), fecha],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return NextResponse.json({ error: 'ya registrado' }, { status: 409 });
    }
    return NextResponse.json({ error: 'error interno' }, { status: 500 });
  }
}
