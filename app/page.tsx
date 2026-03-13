import Calculator from '@/components/Calculator';
import CalculationHistory from '@/components/CalculationHistory';
import { fetchCalculations } from '@/lib/api';

export default async function Home() {
  // Fetch initial calculations on the server
  const initialCalculations = await fetchCalculations();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Calculator CRUD Application
          </h1>
          <p className="text-gray-600">
            A full-stack calculator with calculation history management
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Calculator */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Calculator
            </h2>
            <Calculator />
          </div>

          {/* Right Column: History */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Calculation History
            </h2>
            <CalculationHistory initialCalculations={initialCalculations} />
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Full-stack Calculator Application • Built with Next.js 14</p>
        </footer>
      </div>
    </main>
  );
}