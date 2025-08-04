# CoffeCraft - Aplicación React

## 🚀 Descripción

Aplicación React para e-commerce de café ecuatoriano con sistema de recomendaciones inteligente y experiencias de turismo cafetero. **Completamente integrada con Supabase** sin datos hardcodeados.

## ✨ Características

- **Catálogo de Productos**: Gestión completa de cafés ecuatoriales
- **Sistema de Recomendaciones**: IA que sugiere productos basados en preferencias
- **Experiencias de Turismo**: Tours y experiencias en fincas cafeteras
- **Reservas**: Sistema completo de reservas para experiencias
- **Cuestionarios**: Perfiles de sabor personalizados
- **Integración Supabase**: 100% datos dinámicos, sin mock data

## 🛠️ Tecnologías

- **React** 19.1.0
- **TypeScript** 5.8.3
- **Supabase** 2.50.0
- **TailwindCSS** 4.1.8
- **Vite** 6.3.5
- **Vitest** para testing

## 📋 Requisitos Previos

1. **Node.js** 18+ 
2. **npm** o **pnpm**
3. **Cuenta de Supabase** con proyecto creado

## 🔧 Instalación

### 1. Clonar y configurar
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd react-joaoMoreira

# Instalar dependencias
npm install
```

### 2. Configurar Supabase

#### 2.1 Crear la base de datos
1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido completo del archivo `supabase-schema.sql`
4. Ejecuta el script (esto creará todas las tablas, índices y datos de ejemplo)

#### 2.2 Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui
```

**Obtener las credenciales:**
1. Ve a tu proyecto en Supabase
2. Ir a **Settings** → **API**
3. Copia la **URL** y **anon key**

### 3. Ejecutar la aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

La aplicación estará disponible en `http://localhost:5173`

## 🗄️ Estructura de Base de Datos

El archivo `supabase-schema.sql` incluye:

### Tablas Principales:
- **`productos`** - Catálogo de cafés
- **`experiencias`** - Tours y experiencias
- **`fechas_tours`** - Fechas disponibles para tours
- **`reservas`** - Reservas de usuarios
- **`cuestionarios`** - Cuestionarios de recomendación
- **`respuestas_cuestionario`** - Respuestas de usuarios
- **`perfiles_sabor`** - Perfiles de sabor generados
- **`recomendaciones`** - Recomendaciones de IA

### Características:
- ✅ **Índices optimizados** para consultas rápidas
- ✅ **Triggers automáticos** para timestamps
- ✅ **Datos de ejemplo** incluidos
- ✅ **Restricciones de integridad** referencial
- ✅ **Validaciones** de datos

## 🏗️ Arquitectura del Código

### Servicios (100% Supabase):
- **`catalogoService.ts`** - Gestión de productos
- **`experienciasService.ts`** - Tours y reservas
- **`recomendacionService.ts`** - Sistema de recomendaciones

### Componentes:
- **`catalogo/`** - Componentes del catálogo
- **`experiencias/`** - Componentes de experiencias
- **`recomendacion/`** - Sistema de recomendaciones
- **`shared/`** - Componentes compartidos

### Tipos:
- **`catalogo.types.ts`** - Tipos para productos
- **`experiencias.types.ts`** - Tipos para experiencias
- **`recomendacion.types.ts`** - Tipos para recomendaciones

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con interfaz
npm run test:ui

# Coverage
npm run test:coverage
```

## 📚 Funcionalidades Principales

### 1. Catálogo de Productos
- Listado con filtros avanzados
- Detalles de productos
- Búsqueda por nombre y descripción
- Productos relacionados
- Ofertas y descuentos

### 2. Sistema de Recomendaciones
- Cuestionario de preferencias
- Generación de perfil de sabor
- Recomendaciones personalizadas con IA
- Historial de recomendaciones

### 3. Experiencias de Turismo
- Tours en fincas cafeteras
- Sistema de reservas
- Gestión de fechas y cupos
- Confirmaciones automáticas

### 4. Gestión de Datos
- **Sin datos hardcodeados**: Todo viene de Supabase
- **Manejo de errores**: Errores descriptivos
- **Validaciones**: Integridad de datos
- **Optimizaciones**: Consultas eficientes

## 🔐 Seguridad

- **RLS (Row Level Security)** configurado en Supabase
- **Validaciones** tanto en cliente como servidor
- **Autenticación** integrada con Supabase Auth
- **Variables de entorno** para credenciales

## 🚀 Despliegue

### Variables de Entorno para Producción:
```env
VITE_SUPABASE_URL=tu_url_de_produccion
VITE_SUPABASE_ANON_KEY=tu_clave_de_produccion
```

### Build:
```bash
npm run build
```

Los archivos compilados estarán en `dist/`

## 📞 Soporte

Si encuentras problemas:

1. **Verifica** que las tablas de Supabase estén creadas
2. **Confirma** las variables de entorno
3. **Revisa** los logs de la consola del navegador
4. **Consulta** la documentación de Supabase

## 🎯 Próximos Pasos

- [ ] Implementar autenticación de usuarios
- [ ] Añadir carrito de compras
- [ ] Sistema de pagos
- [ ] Notificaciones push
- [ ] Panel de administración

---

## 🔄 Cambios Recientes

**v1.0.0** - Migración completa a Supabase
- ❌ Eliminados todos los datos mock
- ✅ Integración 100% con Supabase
- ✅ Esquema de base de datos completo
- ✅ Manejo de errores mejorado
- ✅ Nuevas funcionalidades añadidas

