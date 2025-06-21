# Web3 Document Signing App - Proof Of Concept

Una aplicación Next.js moderna que permite firmar documentos PDF usando wallets de criptomonedas a través de firmas EIP-712 seguras.

## ✨ Características

- 🔗 **Conexión Universal de Wallet**: Integración con Thirdweb para conectar cualquier wallet
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
# Thirdweb (obtén tu client ID en https://thirdweb.com/dashboard)
NEXT_PUBLIC_TW_CLIENT_ID=tu_thirdweb_client_id

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

1. **🔗 Conectar Wallet**: Conecta cualquier wallet compatible (MetaMask, WalletConnect, etc.)
2. **📄 Subir PDF**: Arrastra y suelta o selecciona tu documento PDF (máx. 10MB)
3. **🖊️ Firmar**: Autoriza la firma EIP-712 en tu wallet
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
    ├── client.ts                  # Cliente Thirdweb
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
- Detecta automáticamente el chainId de la wallet conectada
- Adapta el dominio EIP-712 dinámicamente
- Sin configuración manual necesaria

### Cambio de Red
1. Cambia de red en tu wallet
2. La app detecta automáticamente el nuevo chainId
3. Firma documentos sin configuración adicional

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
🔗 Using chainId: 137
📝 Signing with domain: {chainId: 137, name: "DocumentSigningService", ...}
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
**Causa**: Usuario canceló la firma en la wallet
**Solución**: Intenta firmar nuevamente y acepta en tu wallet

### 🔍 Herramientas de Diagnóstico

1. **Panel de Diagnóstico**: Aparece automáticamente si hay problemas
2. **Consola del navegador**: Logs detallados (F12 → Console)
3. **Test de conectividad**: Botón "Probar Conectividad API"

### Test Manual
1. Conecta una wallet de prueba
2. Sube un PDF
3. Firma el documento
4. Verifica la descarga
5. Usa el enlace de verificación

## 🛠️ Tecnologías

- **Next.js 15** - Framework React con App Router
- **Thirdweb** - SDK Web3 para conectividad de wallets
- **TypeScript** - Tipado estático para mejor DX
- **Tailwind CSS** - Framework de estilos utility-first
- **Axios** - Cliente HTTP con interceptores
- **AutoPen API** - Servicio de firma de documentos empresarial

## 🔐 Seguridad

- ✅ Firmas EIP-712 criptográficamente seguras
- ✅ Certificados P12 únicos por wallet
- ✅ Verificación pública sin autenticación
- ✅ Integridad de documentos garantizada
