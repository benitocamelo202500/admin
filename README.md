# SUCAMEC Admin - Sistema de Administración

Panel administrativo para validar solicitudes de armas del sistema SUCAMEC.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno

El archivo `.env` debe contener:

```env
VITE_SUPABASE_URL=https://pbzoqfxbgcgrlddehscaq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiem9xZnhiZ2NncmxkZWhzY2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjQ5MjUsImV4cCI6MjA3NDcwMDkyNX0.m0Zv_3HkqXh5zxOPzpQ8FZ9EsF3TqBOjXaHh8hqLVxo
```

### 3. Iniciar Aplicación

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5174**

### 4. Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 👥 Credenciales de Acceso

### Administrador (Valida Documentos)
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Función**: Revisar y aprobar/rechazar documentos cargados por clientes

### Logístico (Verifica Stock)
- **Usuario**: `logistic`
- **Contraseña**: `admin123`
- **Función**: Verificar disponibilidad de stock para las armas solicitadas

## 📋 Funcionalidades

### Dashboard Principal
- Estadísticas en tiempo real:
  - Total de solicitudes
  - Solicitudes pendientes de validación
  - Solicitudes validadas
- Filtros:
  - Todas las solicitudes
  - Solo pendientes
  - Solo validadas

### Vista de Solicitudes
- Lista completa de todas las órdenes
- Información resumida de cada orden:
  - Número de orden
  - Datos del cliente (nombre, DNI)
  - Cantidad de armas solicitadas
  - Monto total
  - Estado de validaciones

### Detalle de Solicitud (Modal)

#### Tab 1: Información General
- Datos completos del cliente
- Lista detallada de armas solicitadas
- Subtotales y total
- Estado de validaciones (documentos y stock)

#### Tab 2: Documentos (Solo Administrador)
- Lista de documentos requeridos según armas
- Verificación visual: cargado vs faltante
- Acceso para visualizar cada documento
- Botones: Aprobar / Rechazar
- Campo de notas opcional

#### Tab 3: Verificación de Stock (Solo Logístico)
- Lista de armas con cantidades solicitadas
- Comparación: stock disponible vs solicitado
- Indicadores visuales de disponibilidad
- Botones: Aprobar / Rechazar
- Campo de notas opcional

## 🔄 Flujo de Validación

1. **Cliente crea solicitud** en la aplicación principal
2. **Administrador valida documentos**:
   - Inicia sesión con `admin`
   - Revisa que todos los documentos estén presentes
   - Aprueba o rechaza
3. **Logístico verifica stock**:
   - Inicia sesión con `logistic`
   - Verifica disponibilidad de stock
   - Aprueba o rechaza
4. **Sistema actualiza estado**:
   - Si ambos aprueban → orden pasa a "aprobado"
   - Si alguno rechaza → orden pasa a "rechazado"

## 🎨 Características Técnicas

### Stack Tecnológico
- **React 18** con TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilos
- **Supabase** para base de datos y backend

### Estructura de Carpetas
```
admin/
├── src/
│   ├── components/
│   │   ├── Login.tsx          # Pantalla de login
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   ├── OrdersList.tsx     # Lista de órdenes
│   │   └── OrderDetails.tsx   # Modal de detalles
│   ├── lib/
│   │   └── supabase.ts        # Cliente Supabase y funciones
│   ├── App.tsx                # Componente principal
│   ├── main.tsx              # Entry point
│   └── index.css             # Estilos globales
├── .env                       # Variables de entorno
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Tipos TypeScript
Todos los tipos están definidos en `src/lib/supabase.ts`:
- `AdminUser` - Usuario administrador
- `Order` - Orden de compra
- `Customer` - Cliente
- `OrderItem` - Item de orden
- `Weapon` - Arma
- `OrderDocument` - Documento cargado
- `OrderValidation` - Validación registrada

## 🔒 Seguridad

### Row Level Security (RLS)
- Todas las tablas tienen RLS habilitado
- Políticas públicas de lectura para consultas
- Validaciones a nivel de aplicación

### Autenticación
- Sistema de login simple basado en usuario/contraseña
- Sin hash de contraseñas (usar en producción bcrypt/argon2)
- Roles: `administrator` y `logistic`

## 🐛 Solución de Problemas

### "No se cargan las solicitudes"
**Causa**: Base de datos vacía o sin conexión
**Solución**:
1. Verifica que ejecutaste `init_database.sql` en Supabase
2. Verifica las credenciales en `.env`
3. Revisa la consola del navegador (F12) para errores

### "Usuario o contraseña incorrectos"
**Causa**: Usuario no existe en la base de datos
**Solución**:
```sql
-- Ejecuta en Supabase SQL Editor
SELECT * FROM admin_users;
```
Si está vacío, ejecuta nuevamente `init_database.sql`

### "Error al validar orden"
**Causa**: Problemas de conexión o permisos
**Solución**:
1. Verifica logs en consola del navegador
2. Verifica logs en Supabase (proyecto > Logs)
3. Confirma que las políticas RLS estén activas

### Build/Compilación falla
**Solución**:
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Base de Datos

### Tablas Principales

#### `admin_users`
- `id` - UUID
- `username` - Nombre de usuario único
- `password_hash` - Contraseña (simple text, mejorar en producción)
- `role` - 'administrator' o 'logistic'
- `full_name` - Nombre completo

#### `orders`
- `id` - UUID
- `order_number` - Número único de orden
- `status` - Estado: pendiente/aprobado/rechazado
- `documents_validated` - Boolean
- `stock_validated` - Boolean
- `documents_validator_id` - ID del admin que validó
- `stock_validator_id` - ID del logístico que validó

#### `order_validations`
- `id` - UUID
- `order_id` - Referencia a orden
- `admin_user_id` - Quien validó
- `validation_type` - 'documents' o 'stock'
- `status` - 'approved' o 'rejected'
- `notes` - Notas opcionales

## 🚀 Despliegue

### Opción 1: Netlify
```bash
npm run build
# Arrastra carpeta dist/ a Netlify
```

### Opción 2: Vercel
```bash
npm install -g vercel
vercel
```

### Opción 3: Servidor propio
```bash
npm run build
# Copia dist/ a tu servidor
# Configura nginx/apache para servir archivos estáticos
```

## 📝 Notas Importantes

1. **Contraseñas**: En producción, implementa hash con bcrypt/argon2
2. **Validación**: Ambos roles deben aprobar para que la orden sea aprobada
3. **Trazabilidad**: Todas las validaciones quedan registradas en `order_validations`
4. **Estados**: Una vez rechazada, una orden no puede cambiar de estado
5. **Sincronización**: Las actualizaciones son en tiempo real si recargas la página

## 🎯 Próximas Mejoras

- [ ] Notificaciones en tiempo real con Supabase Realtime
- [ ] Sistema de roles más robusto
- [ ] Historial de cambios de estado
- [ ] Exportar reportes en PDF/Excel
- [ ] Panel de métricas avanzadas
- [ ] Sistema de comentarios entre admins
- [ ] Upload de documentos desde admin
- [ ] Vista de documentos en modal interno

## 📧 Soporte

Para problemas o consultas sobre esta aplicación, revisa:
1. Logs de consola del navegador (F12)
2. Logs de Supabase
3. Documentación de Supabase: https://supabase.com/docs

---

**Versión**: 1.0.0
**Última actualización**: Octubre 2024
