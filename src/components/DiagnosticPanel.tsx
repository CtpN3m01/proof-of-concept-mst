'use client';

import { useState } from 'react';

export default function DiagnosticPanel() {
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);
  async function testConnectivity() {
    setTesting(true);
    setTestResult('🔄 Probando conectividad...');

    try {
      // Test local proxy endpoint
      const response = await fetch('/api/web3-signing/eip712-domain', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        await response.json();
        setTestResult('✅ Conectividad exitosa - API proxy responde correctamente');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setTestResult(`❌ Error HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTestResult(`❌ Error de conectividad: ${errorMessage}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        🔧 Panel de Diagnóstico
      </h3>
      
      <button
        onClick={testConnectivity}
        disabled={testing}
        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded disabled:opacity-50"
      >
        {testing ? 'Probando...' : 'Probar Conectividad API'}
      </button>
      
      {testResult && (
        <div className="mt-2 text-sm text-yellow-700">
          {testResult}
        </div>
      )}
    </div>
  );
}
