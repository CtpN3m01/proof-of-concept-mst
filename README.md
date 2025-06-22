# Web3 Document Signing App - Proof Of Concept

Una aplicación Next.js moderna que permite firmar documentos PDF usando wallets generadas automáticamente basadas en UserID a través de firmas EIP-712 seguras.

## ✨ Características

- � **Generación Automática de Wallet**: Crea wallets determinísticas basadas en UserID usando ethers.js
- 📄 **Subida Segura de PDF**: Drag & drop con validación de archivos
- 🖊️ **Firma EIP-712**: Firmas criptográficas usando estándares Web3
- 🌐 **Multi-Chain**: Compatible con cualquier blockchain automáticamente  
- 📥 **Descarga Certificada**: Documentos firmados con certificados P12
- 🔍 **Verificación Pública**: Enlaces de verificación sin autenticación
- 🛡️ **Arquitectura Proxy**: Evita problemas de CORS usando API routes
- 🔧 **Diagnóstico Integrado**: Panel de debugging y conectividad

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
.env.local
```

Configura las variables en `.env.local`:
```env
# AutoPen API  
NEXT_PUBLIC_AUTOPEN_BASE_URL=https://autopen.lucerolabs.xyz
NEXT_PUBLIC_AUTOPEN_API_KEY=tu_autopen_api_key
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Abrir en el navegador
Visita [http://localhost:3000](http://localhost:3000)

## 💫 Flujo de Uso

1. **� Ingresar UserID**: Ingresa cualquier UserID (ej: 1234, user123) para generar una wallet automáticamente
2. **📄 Subir PDF**: Arrastra y suelta o selecciona tu documento PDF (máx. 10MB)
3. **🖊️ Firmar**: La wallet generada firma automáticamente el documento usando EIP-712
4. **📥 Descargar**: Obtén el PDF firmado con certificado digital P12
5. **🔍 Verificar**: Comparte el enlace público para verificar autenticidad

## 🏗️ Arquitectura

### Estructura del Proyecto
```
src/
├── app/
│   ├── page.tsx                   # Página principal
│   ├── verify/page.tsx            # Página de verificación
│   └── api/web3-signing/          # API Proxy Routes
│       ├── sessions/route.ts      # Crear sesiones
│       ├── sign/route.ts          # Enviar firmas
│       ├── eip712-domain/route.ts # Obtener dominio EIP-712
│       └── sessions/[sessionId]/  # Rutas dinámicas
├── components/
│   ├── SignerFlow.tsx             # Flujo principal de firma
│   └── DiagnosticPanel.tsx        # Panel de diagnóstico
└── lib/
    ├── client.ts                  # Configuración de la aplicación
    ├── wallet-manager.ts          # Gestión de wallets con ethers.js
    ├── web3-signing-client.ts     # Cliente AutoPen API
    └── env-check.ts               # Verificación de variables
```

### Arquitectura Proxy
La aplicación usa **Next.js API Routes** como proxy para evitar problemas de CORS:

```
Frontend → Next.js API Routes → AutoPen API
```

## 🌐 Compatibilidad Multi-Chain

La aplicación es **compatible con cualquier blockchain** que soporte EIP-712:

### ✅ Auto-detección de Red
- Usa Ethereum mainnet por defecto (chainId: 1)
- Adapta el dominio EIP-712 dinámicamente
- Sin configuración manual necesaria

### Cambio de Red
1. La aplicación usa chainId: 1 por defecto
2. Firma documentos con configuración estándar
3. Compatible con la mayoría de blockchains EIP-712

## 🛠️ Diagnóstico y Debugging

### Panel de Diagnóstico Integrado
- 🔍 **Verificación automática** de variables de entorno
- 🌐 **Prueba de conectividad** con un clic
- 📊 **Información de red** en tiempo real
- ❌ **Mensajes de error específicos** con soluciones

### Logs Detallados
La consola del navegador muestra:
```
🔧 Web3SigningClient constructor: Using proxy baseURL: http://localhost:3000
� Usuario logeado - UserID: 1234, Wallet: 0x742d35Cc6639C0532fBb5933b8FCa64fa12a5f5
�🔗 Using chainId: 1
📝 Signing with domain: {chainId: 1, name: "DocumentSigningService", ...}
✅ API Response: {status: 200, url: "/api/web3-signing/sessions"}
```

## 🔧 Solución de Problemas

### ❌ Error: "Network Error"
**Causa**: Problema de conectividad o configuración del servidor
**Solución**:
1. Verifica que las variables de entorno estén configuradas en `.env.local`
2. Reinicia el servidor: `Ctrl+C` y luego `pnpm dev`
3. Usa el Panel de Diagnóstico para probar conectividad

### ❌ Error: "401 Unauthorized" 
**Causa**: API Key de AutoPen inválida
**Solución**:
1. Verifica que `NEXT_PUBLIC_AUTOPEN_API_KEY` sea correcta
2. Sin espacios extra o caracteres especiales
3. Contacta al proveedor si persiste

### ❌ Error: ChainId Mismatch
**Causa**: La app detectó este problema y lo resuelve automáticamente
**Solución**: ✅ **Auto-resuelto** - la app adapta el chainId dinámicamente

### ❌ Error: "User rejected the request"
**Causa**: Error interno al generar la firma
**Solución**: Intenta firmar nuevamente, la wallet se genera automáticamente

### 🔍 Herramientas de Diagnóstico

1. **Panel de Diagnóstico**: Aparece automáticamente si hay problemas
2. **Consola del navegador**: Logs detallados (F12 → Console)
3. **Test de conectividad**: Botón "Probar Conectividad API"

### Test Manual
1. Ingresa un UserID (ej: 1234)
2. Sube un PDF
3. Firma el documento automáticamente
4. Verifica la descarga
5. Usa el enlace de verificación

## 🛠️ Tecnologías

- **Next.js 15** - Framework React con App Router
- **ethers.js** - Biblioteca Web3 para generación y gestión de wallets
- **TypeScript** - Tipado estático para mejor DX
- **Tailwind CSS** - Framework de estilos utility-first
- **Axios** - Cliente HTTP con interceptores
- **AutoPen API** - Servicio de firma de documentos empresarial

## 🔐 Seguridad

- ✅ Firmas EIP-712 criptográficamente seguras
- ✅ Wallets determinísticas generadas con ethers.js
- ✅ Certificados P12 únicos por wallet
- ✅ Verificación pública sin autenticación
- ✅ Integridad de documentos garantizada
