# Funcionalidad de Firma Externa

Esta funcionalidad permite que sitios externos redirijan usuarios a tu aplicación para firmar documentos PDF usando wallets generadas automáticamente.

## Cómo funciona

1. **Generación de Wallet**: Se crea una wallet determinística basada en el `userID` proporcionado
2. **Descarga de PDF**: Se descarga automáticamente el PDF desde la URL proporcionada
3. **Creación de Sesión**: Se establece una sesión temporal para el proceso de firma
4. **Interfaz Simplificada**: El usuario ve una tarjeta con toda la información y un botón para firmar
5. **Firma Digital**: Se genera una firma EIP-712 del documento
6. **Verificación**: Se crea una sesión en Autopen y se proporciona un enlace para verificar la firma

## Uso desde sitio externo

### URL de acceso
```
https://tu-dominio.com/external-sign?userID={ID_USUARIO}&pdfUrl={URL_DEL_PDF}
```

### Parámetros requeridos
- `userID`: Identificador único del usuario (se usa para generar la wallet)
- `pdfUrl`: URL directa al archivo PDF (debe ser accesible públicamente)

### Ejemplo de integración

```javascript
// JavaScript básico
const userID = "usuario123";
const pdfUrl = "https://mi-sitio.com/documento.pdf";
const signUrl = `https://tu-dominio.com/external-sign?userID=${userID}&pdfUrl=${encodeURIComponent(pdfUrl)}`;

// Redirigir al usuario
window.location.href = signUrl;
```

```html
<!-- HTML directo -->
<a href="https://tu-dominio.com/external-sign?userID=usuario123&pdfUrl=https%3A//mi-sitio.com/documento.pdf">
  Firmar Documento
</a>
```

## Características

### Seguridad
- ✅ Wallet determinística basada en userID
- ✅ Firma digital EIP-712
- ✅ Hash criptográfico del documento
- ✅ Verificación en blockchain

### Experiencia de Usuario
- ✅ Un solo clic para firmar
- ✅ Vista previa del PDF
- ✅ Información clara de wallet y usuario
- ✅ Descarga automática del PDF firmado
- ✅ Enlace directo a verificación en Autopen

### Funcionalidad
- ✅ Descarga automática de PDFs externos
- ✅ Validación de tipos de archivo
- ✅ Manejo de errores
- ✅ Estados de carga
- ✅ Sesión temporal

## Páginas disponibles

### `/external-sign`
Página principal para firma externa. Acepta parámetros `userID` y `pdfUrl`.

### `/test`
Generador de URLs para testing. Permite crear fácilmente URLs de prueba con diferentes userIDs y PDFs.

## Flujo completo

1. **Sitio externo** → Genera URL con userID y pdfUrl
2. **Usuario** → Hace clic en enlace/botón en sitio externo  
3. **Aplicación** → Recibe parámetros y valida
4. **Sistema** → Crea wallet + sesión + descarga PDF
5. **Usuario** → Ve interfaz con información y botón "Firmar"
6. **Usuario** → Hace clic en "Firmar Documento"
7. **Sistema** → Genera firma digital del PDF y crea sesión en Autopen
8. **Usuario** → Descarga PDF firmado y puede verificar en Autopen

## Archivos creados

- `src/lib/external-wallet-manager.ts` - Gestión de wallets y sesiones
- `src/lib/pdf-signing.ts` - Lógica de firma de PDFs
- `src/components/PDFPreview.tsx` - Componente para vista previa de PDF
- `src/components/SigningCard.tsx` - Tarjeta principal de firma
- `src/app/external-sign/page.tsx` - Página principal de firma externa
- `src/app/test/page.tsx` - Generador de URLs de prueba

## Dependencias añadidas

- `pdf-lib` - Manipulación de PDFs
- `file-saver` - Descarga de archivos
- `react-pdf` - Vista previa de PDFs
- `pdfjs-dist` - Motor de renderizado PDF

## Configuración requerida

### Variables de entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
NEXT_PUBLIC_AUTOPEN_BASE_URL=https://api.autopen.com
NEXT_PUBLIC_AUTOPEN_API_KEY=tu_api_key_de_autopen
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Estas variables son necesarias para que el sistema pueda crear sesiones en Autopen y obtener los enlaces de verificación.
