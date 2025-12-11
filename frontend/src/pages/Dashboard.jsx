import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [quotesHistory, setQuotesHistory] = useState([]);

  // Cargar el historial al iniciar
  useEffect(() => {
    const history = localStorage.getItem('quotesHistory');
    if (history) {
      setQuotesHistory(JSON.parse(history));
    }
  }, []);

  // Calcular totales para las tarjetas (KPIs)
  const pendingCount = quotesHistory.filter(q => q.status === 'Pendiente').length;
  const totalRevenue = quotesHistory.reduce((acc, q) => acc + q.amount, 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Control</h1>

      {/* --- TARJETAS DE RESUMEN (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta 1: Pendientes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Pendientes de Aprobación</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">{pendingCount}</h2>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Total Presupuestado */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-400">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Total Presupuestado</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-1">€{totalRevenue.toFixed(2)}</h2>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Acceso Directo */}
        <div 
          onClick={() => navigate('/presupuestos')}
          className="bg-orange-600 p-6 rounded-xl shadow-sm cursor-pointer hover:bg-orange-700 transition text-white flex items-center justify-between"
        >
          <div>
            <p className="text-orange-100 text-sm font-medium uppercase">Acción Rápida</p>
            <h2 className="text-2xl font-bold mt-1">Crear Nuevo Presupuesto</h2>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      {/* --- TABLA DE ÚLTIMOS PRESUPUESTOS --- */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Historial de Presupuestos</h3>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotesHistory.length > 0 ? (
              quotesHistory.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.clientName}</div>
                    <div className="text-sm text-gray-500">{quote.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quote.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    €{quote.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${quote.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {quote.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No hay presupuestos guardados todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;