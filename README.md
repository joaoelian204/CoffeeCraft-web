# CoffeCraft Ecuador - Microfrontend Application

Esta aplicación utiliza una arquitectura de microfrontends con diferentes tecnologías:

- **Shell**: Webpack + Single-SPA (Puerto 9000)
- **React**: Vite + React (Puerto 3001)
- **Angular**: Angular CLI (Puerto 3002)
- **Vue**: Vite + Vue (Puerto 3003)

## 🚀 Inicio Rápido

### Instalar todas las dependencias
```bash
npm run install:all
```

### Iniciar todos los microfrontends
```bash
npm start
```

Este comando iniciará simultáneamente:
- Shell en http://localhost:9000
- React en http://localhost:3001
- Angular en http://localhost:3002
- Vue en http://localhost:3003

## 📁 Estructura del Proyecto

```
nueviAhorasi/
├── coffeecraft-shell/     # Shell principal (Single-SPA)
├── react-joaoMoreira/     # Microfrontend React
├── angular-carlosValencia/ # Microfrontend Angular
├── Vue-JoseSarabia/       # Microfrontend Vue
└── package.json           # Configuración raíz
```

## 🛠️ Comandos Disponibles

### Instalación
- `npm run install:all` - Instala dependencias de todos los proyectos

### Desarrollo
- `npm start` - Inicia todos los microfrontends
- `npm run start:shell` - Solo el shell
- `npm run start:react` - Solo React
- `npm run start:angular` - Solo Angular
- `npm run start:vue` - Solo Vue

### Build
- `npm run build` - Build de todos los proyectos
- `npm run build:shell` - Build del shell
- `npm run build:react` - Build de React
- `npm run build:angular` - Build de Angular
- `npm run build:vue` - Build de Vue

## 🌐 Puertos

- **Shell**: http://localhost:9000
- **React**: http://localhost:3001
- **Angular**: http://localhost:3002
- **Vue**: http://localhost:3003

## 🎨 Tecnologías

- **Shell**: Webpack, Single-SPA, Tailwind CSS
- **React**: Vite, React 19, TypeScript, Tailwind CSS
- **Angular**: Angular CLI, TypeScript, Tailwind CSS
- **Vue**: Vite, Vue 3, TypeScript, Tailwind CSS

## 📝 Notas

- Todos los microfrontends usan el mismo fondo degradado para consistencia visual
- El shell maneja la navegación entre microfrontends
- Cada microfrontend puede ejecutarse independientemente
- Los iframes se adaptan automáticamente al contenido 