import React, { useState, useEffect } from 'react';
import { LayoutGrid, Users, FileText, TrendingUp, DollarSign, Calendar, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Estados para almacenar los datos reales de la BD
  const [stats, setStats] = useState({
    totalIngresos: 0,
    clientesCount: 0,
    presupuestosPendientes: 0
  });
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [clientsMap, setClientsMap] = useState({}); // Para buscar nombres de clientes rápido

  // --- 💶 FUNCIÓN DE FORMATO ESPAÑOL (Igual que en Quotes) ---
  const formatoMoneda = (numero) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(numero);
  };

  // --- BORRAR PRESUPUESTO ---
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este presupuesto?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/v1/presupuestos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("✅ Presupuesto eliminado");
        // Recargamos los datos para actualizar tabla y contadores
        // (Asegúrate de que la función loadDashboardData está definida fuera del useEffect o usa window.location.reload() si es más fácil ahora)
        window.location.reload(); 
      } else {
        alert("❌ Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  /// --- EDITAR (Navegar) ---
  const handleEdit = (id) => {
    // 🔥 LIMPIEZA: Al entrar desde el dashboard, queremos cargar datos frescos de la BD.
    // Borramos cualquier "memoria" que hubiera quedado de sesiones anteriores.
    localStorage.removeItem('quoteItems');
    localStorage.removeItem('quoteClient');

    navigate(`/presupuestos/editar/${id}`);
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Cargar Clientes (Para contar y para saber los nombres)
        const resClients = await fetch('http://localhost:8000/v1/clientes/', { headers });
        const clientsData = resClients.ok ? await resClients.json() : [];

        // Creamos un "diccionario" para buscar nombres rápido por ID
        // Ejemplo: { 1: "Construcciones Pepe", 2: "Reformas Ana" }
        const clientsDictionary = {};
        clientsData.forEach(c => {
            clientsDictionary[c.id_cliente] = c.nombre; // Usamos 'nombre' como corregimos antes
        });
        setClientsMap(clientsDictionary);

        // 2. Cargar Presupuestos
        const resQuotes = await fetch('http://localhost:8000/v1/presupuestos/', { headers });
        const quotesData = resQuotes.ok ? await resQuotes.json() : [];

        // --- CÁLCULOS ESTADÍSTICOS REALES ---
        
        // A. Suma total de dinero (Volumen de negocio)
        const totalDinero = quotesData.reduce((acc, q) => acc + (q.total_neto || 0), 0);
        
        // B. Contar pendientes
        const pendientes = quotesData.filter(q => q.estado === 'PENDIENTE').length;

        // Guardamos estadísticas
        setStats({
          totalIngresos: totalDinero,
          clientesCount: clientsData.length,
          presupuestosPendientes: pendientes
        });

        // C. Últimos 5 presupuestos (Invertimos array para ver los nuevos primero)
        const ultimos = [...quotesData].reverse().slice(0, 5);
        setRecentQuotes(ultimos);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Cargando datos de la empresa...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* CABECERA CON FECHA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
           <p className="text-gray-500">Visión general del negocio</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-600 flex items-center gap-2">
            <Calendar size={16} className="text-orange-500"/> 
            {/* Fecha en formato español largo */}
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- TARJETAS DE ESTADÍSTICAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Tarjeta 1: VOLUMEN TOTAL (Con formato español) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Volumen Presupuestado</p>
                {/* AQUI SE APLICA EL FORMATO 1.234,56 € */}
                <h2 className="text-3xl font-bold text-gray-900">{formatoMoneda(stats.totalIngresos)}</h2>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <DollarSign size={24} />
            </div>
        </div>

        {/* Tarjeta 2: CLIENTES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Clientes Activos</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.clientesCount}</h2>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Users size={24} />
            </div>
        </div>

        {/* Tarjeta 3: PENDIENTES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pendientes de Aprobación</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.presupuestosPendientes}</h2>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <FileText size={24} />
            </div>
        </div>
      </div>

      {/* --- TABLA DE ÚLTIMOS MOVIMIENTOS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-gray-400"/> Últimos Presupuestos
            </h3>
            <button onClick={() => navigate('/presupuestos')} className="text-sm text-orange-600 font-medium hover:underline">Ver todos</button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                        <th className="px-6 py-3 font-semibold">Cliente</th>
                        <th className="px-6 py-3 font-semibold">Fecha</th>
                        <th className="px-6 py-3 font-semibold">Estado</th>
                        <th className="px-6 py-3 font-semibold text-right">Importe Total</th>
                        <th className="px-6 py-3 font-semibold text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {recentQuotes.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                No hay actividad reciente.
                            </td>
                        </tr>
                    ) : (
                        recentQuotes.map((quote) => (
                            <tr key={quote.id_presupuesto} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {/* Buscamos el nombre en el diccionario que creamos arriba */}
                                    {clientsMap[quote.id_cliente] || `Cliente ID: ${quote.id_cliente}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {/* Fecha en formato español corto dd/mm/aaaa */}
                                    {new Date(quote.fecha_creacion || Date.now()).toLocaleDateString('es-ES')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${quote.estado === 'ACEPTADO' ? 'bg-green-100 text-green-700' : 
                                          quote.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' : 
                                          'bg-yellow-100 text-yellow-700'}`}>
                                        {quote.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-700">
                                    {/* Formato moneda español también en la tabla */}
                                    {formatoMoneda(quote.total_neto)}
                                </td>

                                <td className="px-6 py-4 text-center flex justify-center gap-2">
                                    {/* BOTÓN VER (Nuevo) */}
                                    <button 
                                        onClick={() => handleEdit(quote.id_presupuesto || quote.id)} 
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        title="Ver detalles"
                                    >
                                        <Eye size={18} />
                                    </button>

                                    {/* BOTÓN EDITAR */}
                                    <button 
                                        onClick={() => handleEdit(quote.id_presupuesto || quote.id)} 
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Editar"
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    {/* BOTÓN ELIMINAR */}
                                    <button 
                                        onClick={() => handleDelete(quote.id_presupuesto || quote.id)} 
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;