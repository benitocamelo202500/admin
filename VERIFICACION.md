# ✅ Lista de Verificación - Aplicación Admin

## Antes de Iniciar

### 1. ✅ Base de Datos Configurada
Verifica en Supabase SQL Editor:

```sql
-- Debe devolver 8 tablas
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';

-- Debe devolver 2 usuarios
SELECT username, role, full_name FROM admin_users;

-- Debe devolver 15 armas
SELECT COUNT(*) FROM weapons;
```

**Resultado esperado**:
- 8 tablas
- 2 usuarios: `admin` (administrator) y `logistic` (logistic)
- 15 armas en el catálogo

### 2. ✅ Variables de Entorno
Archivo `.env` debe existir con:
```
VITE_SUPABASE_URL=https://pbzoqfxbgcgrlddehscaq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. ✅ Dependencias Instaladas
```bash
# Debe completarse sin errores
npm install
```

## Verificación de Funcionalidad

### Test 1: Login de Administrador
1. Iniciar aplicación: `npm run dev`
2. Abrir: http://localhost:5174
3. Ingresar:
   - Usuario: `admin`
   - Contraseña: `admin123`
4. **✅ Debe**: Redirigir al dashboard

### Test 2: Login de Logístico
1. Si ya estás logueado, click en "Cerrar Sesión"
2. Ingresar:
   - Usuario: `logistic`
   - Contraseña: `admin123`
3. **✅ Debe**: Redirigir al dashboard

### Test 3: Dashboard Vacío
1. Iniciar sesión
2. **✅ Debe mostrar**:
   - Estadísticas: Total: 0, Pendientes: 0, Validadas: 0
   - Mensaje: "No hay solicitudes para mostrar"
   - Filtros funcionando (Todas, Pendientes, Validadas)

### Test 4: Crear Orden de Prueba

Ejecuta en Supabase SQL Editor:

```sql
-- 1. Crear cliente de prueba
INSERT INTO customers (full_name, dni, email, phone, address)
VALUES ('Juan Pérez', '12345678', 'juan@test.com', '987654321', 'Av. Test 123')
RETURNING id;

-- Copia el ID que devuelve, ejemplo: 'abc-123-def'

-- 2. Crear orden (reemplaza el customer_id con el ID anterior)
INSERT INTO orders (
  customer_id,
  order_number,
  status,
  total_amount,
  documents_validated,
  stock_validated
)
VALUES (
  'abc-123-def',  -- <-- REEMPLAZAR CON ID DEL CLIENTE
  'SUCAMEC-TEST-001',
  'pendiente',
  5500.00,
  false,
  false
)
RETURNING id;

-- Copia el ID de la orden, ejemplo: 'xyz-789-uvw'

-- 3. Agregar items a la orden
INSERT INTO order_items (order_id, weapon_id, quantity, unit_price, subtotal)
SELECT
  'xyz-789-uvw',  -- <-- REEMPLAZAR CON ID DE LA ORDEN
  id,
  1,
  price,
  price
FROM weapons
LIMIT 1;

-- 4. Agregar documento de prueba
INSERT INTO order_documents (order_id, document_type, file_url, file_name)
VALUES (
  'xyz-789-uvw',  -- <-- REEMPLAZAR CON ID DE LA ORDEN
  'DNI',
  'https://example.com/dni.pdf',
  'dni.pdf'
);
```

### Test 5: Ver Orden en Dashboard
1. Recargar la página del dashboard (F5)
2. **✅ Debe mostrar**:
   - Total: 1
   - Pendientes: 1
   - Orden "SUCAMEC-TEST-001" en la lista

### Test 6: Abrir Detalle de Orden
1. Click en la orden "SUCAMEC-TEST-001"
2. **✅ Debe abrir modal** con:
   - 3 tabs: Información General, Documentos, Verificación de Stock
   - Información del cliente: Juan Pérez, DNI 12345678
   - Armas solicitadas visible

### Test 7: Validar Documentos (Admin)
1. Login como `admin`
2. Abrir orden de prueba
3. Ir a tab "Documentos"
4. **✅ Debe mostrar**:
   - Lista de documentos requeridos
   - Documento DNI marcado como "Cargado"
   - Botones: Aprobar / Rechazar
5. Click en "Aprobar"
6. **✅ Debe**:
   - Cerrar modal
   - Actualizar contador de validadas

### Test 8: Verificar Stock (Logístico)
1. Cerrar sesión y login como `logistic`
2. Abrir orden de prueba
3. Ir a tab "Verificación de Stock"
4. **✅ Debe mostrar**:
   - Lista de armas solicitadas
   - Stock disponible vs solicitado
   - Indicador verde si hay stock
   - Botones: Aprobar / Rechazar
5. Click en "Aprobar"
6. **✅ Debe**:
   - Cerrar modal
   - Orden debe pasar a "aprobado"

### Test 9: Verificar Estado Final
Ejecuta en Supabase:
```sql
SELECT
  order_number,
  status,
  documents_validated,
  stock_validated
FROM orders
WHERE order_number = 'SUCAMEC-TEST-001';
```

**✅ Resultado esperado**:
- status: 'aprobado'
- documents_validated: true
- stock_validated: true

### Test 10: Filtros
1. En el dashboard, click en cada filtro
2. **✅ Debe**:
   - "Todas": Mostrar todas las órdenes
   - "Pendientes": Mostrar solo no validadas
   - "Validadas": Mostrar solo validadas

## Verificación de Build

### Test 11: Compilar para Producción
```bash
npm run build
```

**✅ Debe**:
- Completarse sin errores
- Crear carpeta `dist/`
- Generar archivos: index.html, assets/index-*.css, assets/index-*.js

### Test 12: Preview de Producción
```bash
npm run preview
```

**✅ Debe**:
- Iniciar servidor en puerto 4173
- Aplicación funcional idéntica a desarrollo

## Checklist Final

- [ ] Base de datos tiene 8 tablas
- [ ] 2 usuarios admin creados
- [ ] 15 armas en catálogo
- [ ] Variables de entorno configuradas
- [ ] Login funciona para ambos roles
- [ ] Dashboard muestra estadísticas
- [ ] Lista de órdenes se carga
- [ ] Modal de detalles abre correctamente
- [ ] Tab de documentos visible (admin)
- [ ] Tab de stock visible (logístico)
- [ ] Validación de documentos funciona
- [ ] Verificación de stock funciona
- [ ] Estado de orden se actualiza correctamente
- [ ] Filtros funcionan
- [ ] Build de producción exitoso
- [ ] Preview funciona

## Errores Comunes y Soluciones

### ❌ "Failed building the project"
**Causa**: Errores de TypeScript o dependencias
**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### ❌ "Cannot connect to Supabase"
**Causa**: Credenciales incorrectas
**Solución**:
1. Verifica `.env` tenga las credenciales correctas
2. Verifica que el proyecto Supabase esté activo

### ❌ "No se muestran órdenes"
**Causa**: Base de datos vacía
**Solución**:
- Ejecuta los queries de "Test 4" para crear orden de prueba

### ❌ "Usuario no encontrado"
**Causa**: Tabla admin_users vacía
**Solución**:
```sql
INSERT INTO admin_users (username, password_hash, role, full_name)
VALUES
  ('admin', 'admin123', 'administrator', 'Administrador Principal'),
  ('logistic', 'admin123', 'logistic', 'Coordinador Logístico')
ON CONFLICT (username) DO NOTHING;
```

## Logs Útiles

### Ver logs en navegador
1. Abrir DevTools (F12)
2. Ir a tab "Console"
3. Buscar errores en rojo

### Ver logs en Supabase
1. Ir a proyecto en Supabase
2. Click en "Logs" en menú lateral
3. Filtrar por tabla/función

---

**¿Todo funciona?** ✅
Si completaste todos los tests exitosamente, la aplicación está lista para usar.
