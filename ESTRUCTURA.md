# Estructura del Proyecto Plan-In

## Arquitectura

Proyecto React unificado con React Router que integra dos módulos principales:

```
plan-in/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx          # Contexto compartido de autenticación
│   ├── services/
│   │   └── api.js                    # API consolidada (todos los endpoints)
│   ├── utils/
│   │   └── constants.js              # Constantes compartidas
│   ├── pages/
│   │   ├── ABMUsuarios.jsx          # Página /abm/usuarios
│   │   └── ReporteProductividad.jsx # Página /reporte/productividad
│   ├── abm-usuarios/                # Componentes del módulo ABM
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/                # Re-exporta desde src/services/api.js
│   │   ├── utils/                   # Re-exporta desde src/utils/constants.js
│   │   └── assets/
│   ├── reporte-productividad/       # Componentes del módulo Reportes
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/                # Re-exporta desde src/services/api.js
│   │   └── utils/                   # Re-exporta desde src/utils/constants.js
│   ├── App.jsx                      # Router principal
│   ├── main.jsx                     # Entry point
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

## Rutas

- **/** → Redirige a `/abm/usuarios`
- **/abm/usuarios** → Módulo de gestión de usuarios
- **/reporte/productividad** → Módulo de reportes con tabla dinámica

## Servicios API Consolidados

Todos los servicios están en `src/services/api.js`:

- `usersAPI` - CRUD de usuarios
- `rolesAPI` - Gestión de roles
- `senioritiesAPI` - Gestión de seniorities
- `organizationChartsAPI` - Organigrama
- `securityAPI` - Autenticación y seguridad
- `signaturesAPI` - Firmas
- `reportsAPI` - Datos de productividad
- `labelsAPI` - Etiquetas
- `viewsAPI` - Vistas de productividad

## Autenticación

- Contexto compartido en `src/context/AuthContext.jsx`
- Lee token y user del localStorage
- Protege ambas rutas automáticamente
- Muestra mensaje si no hay sesión activa

## Build

El build genera archivos estáticos estándar en `dist/` (no en modo librería):
- No genera archivos .js de librería
- Build optimizado para uso en iframe
- Mantiene la estructura de rutas de React Router
