import Link from "next/link";
import SignerFlow from "@/components/SignerFlow";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Web3 Document Signing
          </h1>
          <div className="flex space-x-4">
            <Link 
              href="/test"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Generar URL Externa
            </Link>
            <Link 
              href="/verify"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Verificar Documento
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <SignerFlow />
      </main>
    </div>
  );
}
