import { createClient, type Client } from '@libsql/client';

let db: Client | null = null;
let initialized = false;

export async function getDB(): Promise<Client> {
  if (!db) {
    // Use https:// for HTTP transport (required in Vercel serverless)
    const url = (process.env.TURSO_DATABASE_URL ?? '').replace('libsql://', 'https://');
    db = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  if (!initialized) {
    await setupDB(db);
    initialized = true;
  }

  return db;
}

async function setupDB(client: Client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      activo INTEGER DEFAULT 1,
      orden INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_id INTEGER NOT NULL REFERENCES personas(id),
      fecha TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(persona_id, fecha)
    )
  `);

  const result = await client.execute('SELECT COUNT(*) as count FROM personas');
  const count = Number(result.rows[0].count);

  if (count === 0) {
    const names = ['Ana', 'Carlos', 'Diego', 'Fernanda', 'Gonzalo', 'Isabel'];
    for (let i = 0; i < names.length; i++) {
      await client.execute({
        sql: 'INSERT INTO personas (nombre, orden) VALUES (?, ?)',
        args: [names[i], i],
      });
    }
  }
}
