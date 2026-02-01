# Platziflix - Curso de Claude Code de Platzi

Plataforma de cursos online multi-plataforma desarrollada como proyecto del curso de Claude Code.

## Profesor

- Eduardo Alvarez

## Requisitos Previos

### Backend
- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- Make (incluido en la mayoría de sistemas Unix/Linux)

### Frontend
- [Node.js](https://nodejs.org/) v18 o superior
- [Yarn](https://yarnpkg.com/) como gestor de paquetes

## Descargar el Proyecto

```bash
git clone https://github.com/platzi/claude-code.git
cd claude-code
```

---

## Backend

El backend está construido con **FastAPI + PostgreSQL** y se ejecuta completamente en contenedores Docker.

### Construir y Ejecutar

```bash
cd Backend

# Iniciar los contenedores (API + PostgreSQL)
make start

# Ejecutar migraciones de base de datos
make migrate

# Cargar datos de ejemplo
make seed
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `make start` | Inicia los contenedores Docker |
| `make stop` | Detiene los contenedores |
| `make logs` | Muestra los logs de los contenedores |
| `make migrate` | Ejecuta las migraciones de base de datos |
| `make seed` | Carga datos de ejemplo |
| `make seed-fresh` | Limpia y recarga los datos de ejemplo |
| `make test` | Ejecuta las pruebas unitarias |
| `make create-migration` | Crea una nueva migración (interactivo) |

### URLs del Backend

- **API**: http://localhost:8000
- **Documentación Swagger**: http://localhost:8000/docs
- **Documentación ReDoc**: http://localhost:8000/redoc

---

## Frontend

El frontend está construido con **Next.js 15 + TypeScript + SCSS**.

### Construir y Ejecutar

```bash
cd Frontend

# Instalar dependencias
yarn install

# Ejecutar en modo desarrollo (con Turbopack)
yarn dev
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `yarn dev` | Servidor de desarrollo con Turbopack |
| `yarn build` | Compilación para producción |
| `yarn start` | Ejecutar build de producción |
| `yarn lint` | Ejecutar linter (ESLint) |
| `yarn test` | Ejecutar pruebas (Vitest) |

### URL del Frontend

- **Aplicación**: http://localhost:3000

---

## Colecciones Postman (API)

Para probar los endpoints de la API, se incluyen colecciones de Postman listas para usar:

### Archivos Disponibles

| Archivo | Descripción |
|---------|-------------|
| [Platziflix_API.postman_collection.json](Backend/Platziflix_API.postman_collection.json) | Colección completa de endpoints |
| [Platziflix_API.postman_environment.json](Backend/Platziflix_API.postman_environment.json) | Variables de entorno para desarrollo local |

### Cómo Importar en Postman

1. Abre Postman
2. Ve a **File > Import** (o usa `Ctrl+O`)
3. Selecciona ambos archivos JSON desde la carpeta `Backend/`
4. La colección y el entorno se importarán automáticamente

### Endpoints Incluidos

La colección incluye endpoints para:

- **Autenticación**: Login, registro y manejo de JWT tokens
- **Cursos**: CRUD completo de cursos
- **Clases**: Gestión de clases dentro de cursos
- **Profesores**: Información de profesores
- **Ratings**: Sistema de calificaciones de cursos

> **Nota**: Al hacer login, el token JWT se captura automáticamente y se usa en las siguientes peticiones.

---

## Estructura del Proyecto

```
├── Backend/          # API FastAPI + PostgreSQL (Docker)
├── Frontend/         # Aplicación Next.js 15
├── Mobile/           # Apps móviles
│   ├── PlatziFlixAndroid/   # Android (Kotlin)
│   └── PlatziFlixiOS/       # iOS (Swift)
├── spec/             # Especificaciones del proyecto
└── CLAUDE.md         # Guía de desarrollo para Claude Code
```

## Documentación Adicional

- [Documentación de la API](Backend/API_DOCUMENTATION.md)
- [Guía de Migraciones](Backend/README_MIGRATIONS.md)
- [Guía de Testing](Backend/TESTING_README.md)



