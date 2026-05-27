import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await getDB();
  const body = await req.json();
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'id inválido' }, { status: 400 });
  }

  const updates: string[] = [];
  const args: (string | number)[] = [];

  if (body.activo !== undefined) {
    updates.push('activo = ?');
    args.push(Number(body.activo));
  }
  if (body.nombre !== undefined) {
    updates.push('nombre = ?');
    args.push(String(body.nombre));
  }
  if (body.orden !== undefined) {
    updates.push('orden = ?');
    args.push(Number(body.orden));
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'nada que actualizar' }, { status: 400 });
  }

  args.push(id);

  await db.execute({
    sql: `UPDATE personas SET ${updates.join(', ')} WHERE id = ?`,
    args,
  });

  return NextResponse.json({ ok: true });
}
