type SqlValue = string | number | null;
type Row = Record<string, SqlValue>;
export type ExecResult = { rows: Row[] };

function toArg(v: unknown): object {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') return { type: Number.isInteger(v) ? 'integer' : 'float', value: String(v) };
  return { type: 'text', value: String(v) };
}

function parseResult(result: { cols: { name: string }[]; rows: { type: string; value?: string }[][] }): ExecResult {
  const cols = result.cols.map((c) => c.name);
  const rows: Row[] = result.rows.map((row) => {
    const obj: Row = {};
    row.forEach((cell, i) => {
      obj[cols[i]] =
        cell.type === 'null' ? null :
        cell.type === 'integer' || cell.type === 'float' ? Number(cell.value) :
        (cell.value ?? null);
    });
    return obj;
  });
  return { rows };
}

type Statement = string | { sql: string; args?: unknown[] };

export async function execute(stmt: Statement): Promise<ExecResult> {
  const rawUrl = process.env.TURSO_DATABASE_URL ?? '';
  const url = rawUrl.replace('libsql://', 'https://');
  const token = process.env.TURSO_AUTH_TOKEN ?? '';

  const s =
    typeof stmt === 'string'
      ? { sql: stmt }
      : { sql: stmt.sql, args: (stmt.args ?? []).map(toArg) };

  const res = await fetch(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{ type: 'execute', stmt: s }, { type: 'close' }],
    }),
  });

  if (!res.ok) throw new Error(`Turso error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  if (data.results[0].type === 'error') throw new Error(data.results[0].error.message);

  return parseResult(data.results[0].response.result);
}

let initialized = false;

export async function getDB() {
  if (!initialized) {
    await setupDB();
    initialized = true;
  }
  return { execute };
}

async function setupDB() {
  await execute(`
    CREATE TABLE IF NOT EXISTS personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      orden INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await execute(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_id INTEGER NOT NULL REFERENCES personas(id),
      fecha TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(persona_id, fecha)
    )
  `);

  const result = await execute('SELECT COUNT(*) as count FROM personas');
  const count = Number(result.rows[0].count);

  if (count === 0) {
    const names = ['Ana', 'Carlos', 'Diego', 'Fernanda', 'Gonzalo', 'Isabel'];
    for (let i = 0; i < names.length; i++) {
      await execute({ sql: 'INSERT INTO personas (nombre, orden) VALUES (?, ?)', args: [names[i], i] });
    }
  }
}
