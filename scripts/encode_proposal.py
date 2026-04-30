import base64, sys

html = """<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>

<h1 style="text-align:center">PROPUESTA COMERCIAL</h1>
<h2 style="text-align:center">Plataforma E-commerce — Prophone Medellín</h2>
<p style="text-align:center"><strong>Preparado por:</strong> EternalGrowth &nbsp;|&nbsp; <strong>Fecha:</strong> 29 de abril de 2026</p>
<hr/>

<p><em>[IMAGEN: Pantalla de inicio de la tienda — homepage con hero y catálogo destacado]</em></p>

<h2>1. RESUMEN EJECUTIVO</h2>
<p>Se desarrolló una plataforma e-commerce completa para <strong>Prophone Medellín</strong>, tienda especializada en smartphones y accesorios tecnológicos. La plataforma integra una tienda web pública, un panel de administración completo y un portal interno para el equipo de ventas.</p>
<p>El proyecto está listo para demostración. Para pasar a producción total se requiere únicamente:</p>
<ul>
  <li>Adquirir un dominio propio</li>
  <li>Activar la pasarela de pagos Wompi en modo producción (cambio de llaves API, proceso de 1 a 3 días hábiles)</li>
</ul>

<hr/>
<h2>2. TIENDA PÚBLICA</h2>

<h3>2.1 Catálogo de Productos</h3>
<p><em>[IMAGEN: Página /catalogo con tarjetas de producto y filtros laterales]</em></p>
<ul>
  <li>Listado completo con filtros por categoría y búsqueda por modelo</li>
  <li>Galería de imágenes por producto con soporte de imagen por color de variante</li>
  <li>Variantes completas: almacenamiento, RAM, color, condición (nuevo / usado)</li>
  <li>Stock en tiempo real por variante — badge "Agotado" automático</li>
  <li>Badges configurables: Nuevo, Oferta</li>
  <li>URL amigable por producto (/productos/[slug]) para SEO</li>
</ul>

<h3>2.2 Página de Producto</h3>
<p><em>[IMAGEN: Página de detalle de producto con selector de variante y botón de compra]</em></p>
<ul>
  <li>Selector interactivo de variante con actualización de precio y stock</li>
  <li>Botón Agregar al carrito con validación de stock</li>
  <li>Botón Agregar a lista de deseos</li>
  <li>Descripción, características y especificaciones técnicas</li>
  <li>Metadatos OG para compartir en redes sociales</li>
</ul>

<h3>2.3 Carrito y Checkout</h3>
<p><em>[IMAGEN: Pantalla de checkout con formulario y resumen de pedido]</em></p>
<ul>
  <li>Carrito con contador de ítems en la barra de navegación</li>
  <li>Checkout disponible sin registro (modo invitado)</li>
  <li>Checkout con autocompletado para usuarios registrados</li>
  <li>Validación de formulario: teléfono colombiano, email, dirección mínima</li>
  <li>Validación de stock en tiempo real antes de confirmar</li>
  <li>Campo de notas del cliente</li>
  <li>Resumen de pedido con subtotal, envío y total</li>
</ul>

<h3>2.4 Pasarela de Pagos — Wompi</h3>
<p><em>[IMAGEN: Pantalla de pago Wompi con opciones tarjeta, PSE, Efecty]</em></p>
<ul>
  <li>Integración completa con Wompi (pasarela líder en Colombia)</li>
  <li>Actualmente en modo sandbox (pruebas sin cargos reales)</li>
  <li>Un solo cambio de llaves API activa producción — sin redesarrollo</li>
  <li>Medios de pago: tarjeta crédito/débito, PSE, Bancolombia, Efecty, Baloto</li>
  <li>Webhook con validación de firma criptográfica — seguro contra fraude</li>
  <li>Estado del pedido se actualiza automáticamente al confirmar el pago</li>
  <li>Página de resultado con número de pedido y estado de la transacción</li>
</ul>

<h3>2.5 Cuentas de Usuario</h3>
<p><em>[IMAGEN: Pantalla /cuenta con historial de pedidos e imágenes de productos]</em></p>
<ul>
  <li>Registro e inicio de sesión con email</li>
  <li>Historial de pedidos con imágenes, variante, estado y fecha</li>
  <li>Múltiples direcciones guardadas con etiqueta personalizable</li>
  <li>Dirección predeterminada para checkout rápido</li>
  <li>Lista de deseos persistente entre sesiones</li>
</ul>

<h3>2.6 Seguimiento Público de Pedidos</h3>
<p><em>[IMAGEN: Página /seguimiento con formulario y resultado de consulta]</em></p>
<ul>
  <li>Accesible sin iniciar sesión — ideal para clientes invitados</li>
  <li>Búsqueda por número de pedido + teléfono de contacto</li>
  <li>Muestra estado, productos con imágenes, subtotal, envío y total</li>
  <li>Ciudad y departamento de destino</li>
  <li>Seguro: solo quien tenga el número de pedido Y el teléfono puede consultar</li>
</ul>

<h3>2.7 SEO y Páginas Legales</h3>
<ul>
  <li>Sitemap.xml generado automáticamente con todos los productos</li>
  <li>robots.txt configurado correctamente</li>
  <li>Metadatos dinámicos por página: título, descripción, Open Graph, Twitter Card</li>
  <li>Páginas legales: Términos y Condiciones, Política de Privacidad</li>
  <li>Preguntas Frecuentes (FAQs)</li>
  <li>Página 404 personalizada con links de recuperación</li>
</ul>

<hr/>
<h2>3. PANEL DE ADMINISTRACIÓN</h2>

<h3>3.1 Dashboard de Métricas</h3>
<p><em>[IMAGEN: Dashboard con KPIs, gráfica de ingresos y top productos]</em></p>
<ul>
  <li>KPIs en tiempo real: ingresos web totales, ticket promedio, pedidos pendientes, entregados</li>
  <li>Comparativo mes actual vs mes anterior con porcentaje de variación</li>
  <li>Gráfica de barras: ingresos de los últimos 14 días con tooltip por día</li>
  <li>Distribución de pedidos por estado (barras de progreso)</li>
  <li>Top 5 productos más vendidos (por unidades y por ingresos)</li>
  <li>Top 5 mejores clientes web (por gasto acumulado)</li>
  <li>Estado del inventario: SKUs en stock vs agotados con enlace de acción</li>
  <li>Métodos de pago utilizados con porcentajes</li>
  <li>Ventas por vendedor (ventas físicas separadas de las web)</li>
</ul>

<h3>3.2 Gestión de Productos</h3>
<p><em>[IMAGEN: Admin productos con lista y editor de variantes]</em></p>
<ul>
  <li>Crear, editar y eliminar productos</li>
  <li>Subida de múltiples imágenes con reordenamiento</li>
  <li>Vinculación de imágenes a colores específicos de variante</li>
  <li>Gestión completa de variantes: precio, SKU, stock, condición, notas</li>
  <li>Control de stock numérico con actualización manual o automática</li>
  <li>Marcar productos como Destacado o Nuevo desde el admin</li>
</ul>

<h3>3.3 Gestión de Pedidos</h3>
<p><em>[IMAGEN: Admin pedidos con acordeón de detalle y botón WhatsApp]</em></p>
<ul>
  <li>Listado completo de pedidos — invitados y registrados</li>
  <li>Búsqueda por número de pedido, nombre, teléfono o email</li>
  <li>Filtros rápidos por estado</li>
  <li>Acordeón de detalle: datos del cliente, dirección, ítems, totales, pago Wompi</li>
  <li>Cambio de estado con un clic (Pendiente → Confirmado → En camino → Entregado)</li>
  <li>Cancelación con restauración automática del stock</li>
  <li>Botón de WhatsApp directo al número del cliente con mensaje pre-cargado</li>
  <li>Exportación a CSV de los pedidos visibles (respeta filtros activos)</li>
</ul>

<h3>3.4 Gestión de Clientes</h3>
<ul>
  <li>Listado de clientes registrados con nombre y contacto</li>
  <li>Vista de todos los pedidos de un cliente específico con un clic</li>
</ul>

<h3>3.5 Gestión de Usuarios y Roles</h3>
<p><em>[IMAGEN: Admin usuarios con formulario de creación y lista del equipo]</em></p>
<ul>
  <li>Cuatro roles: Admin, Gestor de Inventario, Vendedor, Cliente</li>
  <li>Crear usuarios con email y contraseña directamente (sin magic link)</li>
  <li>Credenciales del usuario creado visibles hasta que el admin las cierre explícitamente</li>
  <li>Reset de contraseña desde el panel (sin necesidad del email del empleado)</li>
  <li>Cambio de rol en tiempo real</li>
  <li>Cada rol ve solo las secciones del panel que le corresponden</li>
  <li>Protección de rutas: redirección automática si el rol no tiene acceso</li>
</ul>

<h3>3.6 Promociones, Sedes y Configuración</h3>
<ul>
  <li>Banner de anuncios superior: activar/desactivar, personalizar mensajes</li>
  <li>Gestión de sedes/locales con nombre, zona y detalle</li>
  <li>Configuración general: WhatsApp, Instagram, horarios de atención (semana y fin de semana)</li>
</ul>

<hr/>
<h2>4. PORTAL DE VENDEDOR</h2>
<p><em>[IMAGEN: Portal /vendedor con buscador de producto y registro de venta]</em></p>

<h3>4.1 Registro de Ventas Físicas</h3>
<ul>
  <li>Acceso exclusivo para usuarios con rol Vendedor</li>
  <li>Búsqueda de producto por nombre, modelo o SKU</li>
  <li>Vista de stock disponible antes de registrar la venta</li>
  <li>Registro de venta: descuenta el stock automáticamente via trigger de base de datos</li>
  <li>Soporte para múltiples unidades en una sola transacción</li>
  <li>Función Deshacer para corregir errores — restaura el stock</li>
  <li>Historial de ventas de la sesión actual</li>
</ul>

<h3>4.2 Historial del Vendedor y Vista Admin</h3>
<ul>
  <li>El vendedor tiene su propia sección "Mis ventas" con estadísticas personales</li>
  <li>El administrador puede ver el historial completo de cualquier vendedor</li>
  <li>Estadísticas por vendedor: total vendido, número de transacciones, cancelaciones</li>
</ul>

<hr/>
<h2>5. ARQUITECTURA TÉCNICA</h2>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%">
  <tr><td><strong>Frontend</strong></td><td>Next.js 16 (App Router) + TypeScript</td></tr>
  <tr><td><strong>Estilos</strong></td><td>Tailwind CSS — diseño responsivo mobile-first</td></tr>
  <tr><td><strong>Base de datos</strong></td><td>Supabase (PostgreSQL) con Row Level Security en todas las tablas</td></tr>
  <tr><td><strong>Autenticación</strong></td><td>Supabase Auth — JWT + cookies seguras (sin localStorage)</td></tr>
  <tr><td><strong>Almacenamiento</strong></td><td>Supabase Storage — imágenes de productos</td></tr>
  <tr><td><strong>Pasarela de pagos</strong></td><td>Wompi — líder en Colombia, sandox activo, producción en 1 cambio</td></tr>
  <tr><td><strong>Despliegue recomendado</strong></td><td>Vercel (plan gratuito disponible para empezar)</td></tr>
  <tr><td><strong>Control de versión</strong></td><td>Git / GitHub (repositorio privado entregado al cliente)</td></tr>
</table>
<br/>
<p><strong>Seguridad implementada:</strong></p>
<ul>
  <li>Row Level Security (RLS) en todas las tablas</li>
  <li>Funciones SECURITY DEFINER para acceso controlado desde clientes no autenticados</li>
  <li>Validación de firma criptográfica en webhooks de Wompi</li>
  <li>Roles de usuario con permisos diferenciados a nivel de base de datos y frontend</li>
  <li>Sin credenciales ni datos sensibles expuestos en el código fuente</li>
</ul>

<hr/>
<h2>6. PARA PASAR A PRODUCCIÓN</h2>
<p>Lo siguiente <strong>no está incluido en el precio de desarrollo</strong> pero es necesario para operar:</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%">
  <tr>
    <th style="background:#f0f0f0">Ítem</th>
    <th style="background:#f0f0f0">Costo estimado</th>
    <th style="background:#f0f0f0">Notas</th>
  </tr>
  <tr>
    <td>Dominio (.com o .com.co)</td>
    <td>$50.000 – $150.000 COP/año</td>
    <td>GoDaddy, Namecheap, o NIC.co</td>
  </tr>
  <tr>
    <td>Wompi producción</td>
    <td>~2,9% + tarifa fija por transacción</td>
    <td>Sin costo fijo mensual; solo comisión por venta exitosa</td>
  </tr>
  <tr>
    <td>Hosting Vercel</td>
    <td>Gratis o ~$20 USD/mes (Pro)</td>
    <td>El plan gratuito funciona para bajo tráfico inicial</td>
  </tr>
  <tr>
    <td>Supabase (base de datos)</td>
    <td>Gratis o ~$25 USD/mes</td>
    <td>Plan gratuito con 500 MB y 2 GB de almacenamiento</td>
  </tr>
  <tr>
    <td>Email transaccional (futuro)</td>
    <td>~$20 USD/mes (Resend)</td>
    <td>Requiere dominio propio; confirmaciones automáticas de pedido</td>
  </tr>
</table>

<hr/>
<h2>7. INVERSIÓN</h2>

<p><strong>DESARROLLO — Pago único</strong></p>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%">
  <tr><td>Tienda pública completa (catálogo, carrito, checkout, cuentas de usuario)</td><td>Incluido</td></tr>
  <tr><td>Panel de administración completo (dashboard, productos, pedidos, usuarios)</td><td>Incluido</td></tr>
  <tr><td>Portal de vendedor y trazabilidad de ventas físicas</td><td>Incluido</td></tr>
  <tr><td>Integración Wompi sandbox + listo para producción</td><td>Incluido</td></tr>
  <tr><td>SEO técnico completo, páginas legales, sitemap</td><td>Incluido</td></tr>
  <tr><td>Roles, permisos y gestión de equipo</td><td>Incluido</td></tr>
  <tr style="background:#f9f9f9"><td><strong>VALOR TOTAL DESARROLLO</strong></td><td><strong>$8.500.000 COP</strong></td></tr>
</table>
<br/>

<p><strong>MANTENIMIENTO MENSUAL — Opcional, mes a mes</strong></p>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%">
  <tr><td>Soporte técnico prioritario</td><td>Incluido</td></tr>
  <tr><td>Actualizaciones de seguridad de la plataforma</td><td>Incluido</td></tr>
  <tr><td>Hasta 4 horas de ajustes o cambios menores por mes</td><td>Incluido</td></tr>
  <tr style="background:#f9f9f9"><td><strong>VALOR MENSUAL</strong></td><td><strong>$650.000 COP/mes</strong></td></tr>
</table>
<br/>

<p><strong>ACTIVACIÓN DE PRODUCCIÓN — Una sola vez, cuando se adquiera el dominio</strong></p>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%">
  <tr><td>Configuración de dominio y certificado SSL</td><td>Incluido</td></tr>
  <tr><td>Activación de Wompi producción y pruebas end-to-end</td><td>Incluido</td></tr>
  <tr><td>Configuración de email transaccional con Resend</td><td>Incluido</td></tr>
  <tr style="background:#f9f9f9"><td><strong>VALOR</strong></td><td><strong>$400.000 COP</strong></td></tr>
</table>
<br/>
<p><em>Hora adicional fuera del plan de mantenimiento: $80.000 COP/hora.</em></p>

<hr/>
<h2>8. CONDICIONES</h2>
<ul>
  <li>El código fuente queda en propiedad del cliente al completar el pago total.</li>
  <li>El repositorio en GitHub se transfiere o se agrega al cliente como propietario.</li>
  <li>Los cambios mayores (nuevas funcionalidades no incluidas) se cotizan por separado.</li>
  <li>El plan de mantenimiento se puede contratar o cancelar mes a mes sin penalidad.</li>
  <li>Validez de esta propuesta: <strong>30 días calendario</strong> desde la fecha de emisión.</li>
</ul>

<hr/>
<p style="text-align:center">
  <strong>EternalGrowth — Desarrollo de Software</strong><br/>
  Medellín, Colombia &nbsp;|&nbsp; Abril 2026
</p>

</body>
</html>"""

print(base64.b64encode(html.encode('utf-8')).decode('utf-8'))
