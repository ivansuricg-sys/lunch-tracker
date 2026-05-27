import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: 'id inválido' }, { status: 400 });

  await execute({ sql: 'DELETE FROM registros WHERE id = ?', args: [numId] });
  return NextResponse.json({ ok: true });
}
