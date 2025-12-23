# Plan-In - Aplicación Unificada

Aplicación React unificada que integra múltiples módulos del sistema Plan-In.

## Módulos

### /abm/usuarios
Módulo de gestión (ABM) de usuarios del sistema.

### /reporte/productividad
Módulo de reportes de productividad con tabla dinámica y vistas personalizables.

## Tecnologías

- React 19.1
- React Router 6.22
- Vite 7.1
- TailwindCSS
- Lucide React (iconos)
- React Pivottable
- XLSX (exportación Excel)

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Copiar el archivo de variables de entorno:
```bash
copy .env.example .env
```

3. Configurar las URLs de las APIs en `.env`:
```
VITE_API_SECURITY_URL=http://localhost:5000
VITE_API_ABMS_URL=http://localhost:5001
VITE_API_REPORTS_URL=http://localhost:5002
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

El build generará archivos estáticos en la carpeta `dist/` que pueden ser servidos directamente o usados en un iframe.

## Autenticación

La aplicación obtiene el token de autenticación del localStorage:
- `token`: Token de acceso
- `user`: Datos del usuario autenticado

Ambos módulos validan la autenticación al cargar y muestran un mensaje si no hay sesión activa.

## Uso como iframe

La aplicación está diseñada para ser usada como iframe en una aplicación principal. El build estándar genera archivos estáticos que pueden ser servidos directamente.
