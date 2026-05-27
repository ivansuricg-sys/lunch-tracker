# Registro de Almuerzos — Guía de instalación y deploy

## 1. Crear base de datos gratuita en Turso

1. Ir a [turso.tech](https://turso.tech) y crear una cuenta gratuita
2. Instalar la CLI de Turso:
   ```bash
   # macOS / Linux
   curl -sSfL https://get.tur.so/install.sh | bash

   # Windows (PowerShell)
   winget install chiselstrike.turso
   ```
3. Iniciar sesión:
   ```bash
   turso auth login
   ```
4. Crear la base de datos:
   ```bash
   turso db create almuerzos
   ```
5. Obtener la URL de conexión:
   ```bash
   turso db show almuerzos --url
   # Copia el valor: libsql://almuerzos-<tu-usuario>.turso.io
   ```
6. Crear un token de autenticación:
   ```bash
   turso db tokens create almuerzos
   # Copia el token generado
   ```

> Las tablas y datos iniciales se crean automáticamente la primera vez que se inicia la app.

---

## 2. Configurar variables de entorno

### Local (desarrollo)

Copia el archivo de ejemplo y rellena los valores:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```
TURSO_DATABASE_URL=libsql://almuerzos-<tu-usuario>.turso.io
TURSO_AUTH_TOKEN=<tu-token>
ADMIN_PASSWORD=<contraseña-que-elijas>
```

### En Vercel (producción)

En el dashboard de Vercel de tu proyecto:
1. Ir a **Settings → Environment Variables**
2. Agregar las tres variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSWORD`
3. Marcarlas como disponibles en **Production** (y opcionalmente Preview)

---

## 3. Deploy en Vercel conectando GitHub

1. Subir el proyecto a un repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/<usuario>/<repo>.git
   git push -u origin main
   ```
2. Ir a [vercel.com](https://vercel.com) → **New Project**
3. Seleccionar el repositorio de GitHub
4. En la configuración del proyecto:
   - **Framework Preset**: Next.js (se detecta automáticamente)
   - **Root Directory**: `.` (raíz del repo)
5. Agregar las variables de entorno (ver sección anterior)
6. Hacer click en **Deploy**

Vercel asignará automáticamente una URL pública (ej: `https://almuerzos.vercel.app`).

---

## 4. Imprimir el QR desde la página admin

1. Abrir `/admin` en el navegador
2. Ingresar la contraseña configurada en `ADMIN_PASSWORD`
3. Hacer click en el botón **QR 📱** (arriba a la derecha)
4. En el modal que aparece, hacer click en **Imprimir 🖨️**
5. El navegador abre el diálogo de impresión con el QR listo para imprimir
6. Se recomienda imprimir en papel A5 o recortar para pegarlo en un lugar visible de la oficina

---

## 5. Agregar o desactivar personas desde el admin

### Agregar una persona

1. Abrir `/admin` y loguearse
2. Bajar hasta la sección **Personas**
3. Escribir el nombre en el campo de texto y hacer click en **Agregar**
4. La persona aparece inmediatamente en la página principal

### Desactivar una persona (sin borrar sus registros)

1. En la sección **Personas** del admin, localizar el nombre
2. Hacer click en **Desactivar** (botón rojo)
3. La persona queda oculta en la página principal pero sus registros históricos se conservan
4. Para reactivarla, hacer click en **Activar** (botón verde)

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

- Página principal: `http://localhost:3000`
- Panel admin: `http://localhost:3000/admin`
