// app/components/DashboardStats.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// IMPORTANTE: Ajusta esta ruta según dónde guardes este archivo.
// Si este archivo está en app/components y el servicio en app/services, subimos un nivel (..)
import { getDashboardStats } from '../services/dashboardService';

const DashboardStats = () => {
  const navigate = useNavigate();
  
  // Estado inicial
  const [stats, setStats] = useState({
    total_clientes: 0,
    presupuestos_pendientes: 0,
    presupuestos_aprobados: 0,
    presupuestos_denegados: 0,
    presupuestos_borrador: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      const data = await getDashboardStats();
      if (data) {
        setStats(data);
      }
      setLoading(false);
    };
    fetchDatos();
  }, []);

  // Función para navegar al listado con filtro
  const irAListado = (estado) => {
    navigate(`/presupuestos?estado=${estado}`);
  };

  const irAClientes = () => {
    navigate('/clientes');
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando estadísticas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      {/* 1. Clientes */}
      <StatCard 
        titulo="Clientes" 
        valor={stats.total_clientes} 
        color="blue" 
        icon="👥"
        onClick={irAClientes}
      />

      {/* 2. Pendientes (Prioridad Alta) */}
      <StatCard 
        titulo="Pendientes" 
        valor={stats.presupuestos_pendientes} 
        color="orange" 
        icon="⏳"
        onClick={() => irAListado('ENVIADO_ADMIN')}
      />

      {/* 3. Aprobados */}
      <StatCard 
        titulo="Aprobados" 
        valor={stats.presupuestos_aprobados} 
        color="green" 
        icon="✅"
        onClick={() => irAListado('APROBADO')}
      />

      {/* 4. Denegados */}
      <StatCard 
        titulo="Denegados" 
        valor={stats.presupuestos_denegados} 
        color="red" 
        icon="❌"
        onClick={() => irAListado('DENEGADO')}
      />
    </div>
  );
};

// Sub-componente de Tarjeta (Para no repetir código)
const StatCard = ({ titulo, valor, color, icon, onClick }) => {
  // Mapas de colores para Tailwind CSS
  const colors = {
    blue:   "border-blue-500 text-blue-600 bg-blue-50",
    orange: "border-orange-500 text-orange-600 bg-orange-50",
    green:  "border-green-500 text-green-600 bg-green-50",
    red:    "border-red-500 text-red-600 bg-red-50",
  };

  const theme = colors[color] || colors.blue;

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-all border-l-4 ${theme.split(' ')[0]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase">{titulo}</p>
          <p className="text-2xl font-bold text-gray-800">{valor}</p>
        </div>
        <div className={`p-3 rounded-full text-xl ${theme.split(' ').slice(1).join(' ')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;