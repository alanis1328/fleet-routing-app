# Guía de Instalación y Uso: Planificador de Rutas

Esta aplicación permite registrar alumnos, ubicar sus domicilios en el mapa de Gran Concepción y calcular automáticamente el recorrido más corto y eficiente respetando el sentido del tránsito vial.

---

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu equipo:
- **Node.js** (versión 18 o superior) y **npm**.
- **Git** para clonar el repositorio.
- Una cuenta en **Supabase** (o una base de datos PostgreSQL con extensión PostGIS activa).

---

### Estructura del Proyecto

El código está organizado de manera modular donde ningún archivo supera las 200 líneas:

- **`src/` (Backend):** Servidor Express, configuración de base de datos (`config/db.ts`), endpoints REST (`routes/passengers.ts`) y punto de entrada (`server.ts`).
- **`server/` (Frontend):** Vistas estáticas (`index.html`), diseño Rose Milk & Lavender (`css/styles.css`) y módulos JavaScript desacoplados (`js/api.js`, `js/map.js`, `js/modal.js`, `js/router.js`, `js/main.js`).

---

### 1. Clonar el Repositorio

Abre tu terminal y descarga el proyecto:

```bash
git clone [https://github.com/alanis1328/fleet-routing-app.git](https://github.com/alanis1328/fleet-routing-app.git)
cd fleet-routing-app
```

---

### 2. Instalar Dependencias

Instala todas las librerías necesarias del proyecto:

```bash
npm install
```

---

### 3. Configurar la Base de Datos (Supabase + PostGIS)

1. En tu proyecto de Supabase, entra al **SQL Editor**.
2. Ejecuta la siguiente consulta para activar PostGIS y crear la tabla de pasajeros:

```sql
-- Activar la extensión espacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- Crear tabla de alumnos/pasajeros
CREATE TABLE IF NOT EXISTS passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  guardian_name VARCHAR(150),
  guardian_phone VARCHAR(50),
  address TEXT NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 4. Configurar Variables de Entorno

1. Copia la plantilla de ejemplo:
   * En Windows (PowerShell):
     ```powershell
     copy .env.example .env
     ```
   * En Linux/Mac:
     ```bash
     cp .env.example .env
     ```
2. Abre el archivo `.env` recién creado y coloca la cadena de conexión de tu base de datos:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:[TU_CONTRASEÑA]@[HOST_SUPABASE]:5432/postgres"
   ```

---

### 5. Iniciar la Aplicación

Ejecuta el servidor en modo desarrollo:

```bash
npm run dev
```

Abre tu navegador web e ingresa a:
👉 **`http://localhost:3000/`**

---

### 6. Cómo Usar la Plataforma

#### Registrar un Alumno
1. Haz clic en el botón superior **Agregar Persona**.
2. Escribe el nombre, apellido, apoderado y teléfono de contacto (solo dígitos, formato `+569...`).
3. Para la dirección tienes dos opciones:
   * **Búsqueda por texto:** Escribe la calle en el buscador y presiona **Buscar**.
   * **Directo en el mapa:** Haz clic sobre cualquier punto o calle del mapa interactivo; las coordenadas y la dirección se actualizarán automáticamente.
4. Presiona **Guardar**.

#### Calcular la Secuencia Óptima de Recorrido
1. Asegúrate de tener al menos 2 alumnos registrados en la lista.
2. Haz clic en el botón **Ruta Más Corta**.
3. El sistema evaluará las combinaciones posibles en la red vial real:
   * Se trazará la ruta en color violeta sobre las calles autorizadas.
   * En el panel lateral superior aparecerá la **distancia total (km)** y el **tiempo estimado (min)**.
   * La lista de alumnos se ordenará automáticamente como `Parada #1`, `Parada #2`, etc.

#### Editar o Eliminar Alumnos
- **Editar:** Haz clic en **Editar** en la tarjeta del alumno para modificar sus datos o reubicar su punto en el mapa.
- **Eliminar:** Haz clic en **Eliminar** para darlo de baja; el mapa y la base de datos se actualizarán de inmediato.
