// Archivo para verificar variables de entorno en desarrollo
export function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  // En el cliente, solo verificamos Thirdweb ya que AutoPen ahora usa proxy
  const clientVars = {
    NEXT_PUBLIC_TW_CLIENT_ID: process.env.NEXT_PUBLIC_TW_CLIENT_ID,
  };

  console.log('Client Environment Variables Status:');
  Object.entries(clientVars).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${value}`);
    } else {
      console.warn(`⚠️ ${key}: NOT SET - using demo client`);
    }
  });

  // La verificación de AutoPen ahora se hace en el servidor
  console.log('ℹ️ AutoPen API variables are now handled server-side via proxy');
  console.log('✅ Client configuration check complete!');

  return true; // Siempre retorna true ya que Thirdweb funciona con demo client
}

// Auto-check in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  checkEnvironmentVariables();
}
