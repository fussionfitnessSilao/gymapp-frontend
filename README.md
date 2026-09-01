# Frontend — Cliente (React + Vite)

SPA para el rol Cliente (Fase 6 del documento maestro). Admin y Recepción
usan Django Admin, no esta app (D6).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`. Necesita el backend corriendo en
`http://localhost:8000` (ver el README del backend).

## Estructura

```
src/
  api/          Llamadas a la API REST (Fase 7): auth, sessions, reservations, membership
  context/      AuthContext — sesión JWT, con auto-refresh en apps/api/client.js
  components/   Navbar, ProtectedRoute, CapacityDots (indicador de cupo)
  pages/        Login, Registro, Horario, Mis reservas, Perfil
```

## Flujo implementado (Fase 6)
Login/Registro autoservicio (D14) → Horario (cupo en tiempo real vía
`CapacityDots`, badge de evento especial, botón que refleja el estado real
de la membresía y la reserva) → Mis reservas (tabs próximas/pasadas,
cancelación con mensaje diferenciado según la ventana de 2h — D5) → Perfil
(datos de contacto editables + membresía vigente).

## Identidad visual
Paleta verde bosque + ochre, tipografía Fraunces (display) + Work Sans
(cuerpo) + IBM Plex Mono (horas y datos). El indicador de cupo usa un
grid de puntos en vez de un badge genérico "3/10" — cada punto es un lugar
real en la clase.
