import React, { useEffect, useState } from 'react';
// 1. Importamos useSearchParams
import { useSearchParams } from 'react-router-dom';

const PresupuestosList = () => {
  // 2. Hook para leer la URL
  const [searchParams] = useSearchParams();
  
  // Estado local de los presupuestos y del filtro
  const [presupuestos, setPresupuestos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState(""); // "" significa "Todos"

  useEffect(() => {
    // 3. Al cargar, miramos si hay algo en la URL
    const estadoURL = searchParams.get("estado");
    
    if (estadoURL) {
      console.log("Vengo del Dashboard con filtro:", estadoURL);
      setFiltroEstado(estadoURL);
    }
    
    // Aquí llamarías a tu función de cargar datos
    cargarDatos();
  }, [searchParams]);

  const cargarDatos = async () => {
    // Tu lógica de fetch a la API...
    // const data = await ...
    // setPresupuestos(data);
  };

  // 4. Filtrado visual (Si traes todos los datos y filtras en el cliente)
  const presupuestosFiltrados = presupuestos.filter(p => {
    if (!filtroEstado) return true; // Si no hay filtro, muestra todo
    return p.estado === filtroEstado;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Listado de Presupuestos</h1>

      {/* Botón para limpiar filtro (útil si el usuario quiere ver todos de nuevo) */}
      {filtroEstado && (
        <button 
          onClick={() => setFiltroEstado("")}
          className="mb-4 text-sm text-blue-600 underline"
        >
          Ver todos los presupuestos
        </button>
      )}

      {/* Tu Tabla */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 border-b">ID</th>
            <th className="py-2 border-b">Cliente</th>
            <th className="py-2 border-b">Estado</th>
            {/* ... más columnas ... */}
          </tr>
        </thead>
        <tbody>
          {presupuestosFiltrados.map((presupuesto) => (
            <tr key={presupuesto.id_presupuesto}>
              <td className="py-2 border-b text-center">{presupuesto.numero_presupuesto}</td>
              <td className="py-2 border-b text-center">{presupuesto.id_cliente}</td>
              <td className="py-2 border-b text-center">
                {/* Badge simple para ver el estado */}
                <span className={`px-2 py-1 rounded text-xs font-bold
                  ${presupuesto.estado === 'APROBADO' ? 'bg-green-100 text-green-800' : ''}
                  ${presupuesto.estado === 'DENEGADO' ? 'bg-red-100 text-red-800' : ''}
                  ${presupuesto.estado === 'ENVIADO_ADMIN' ? 'bg-orange-100 text-orange-800' : ''}
                `}>
                  {presupuesto.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {presupuestosFiltrados.length === 0 && (
        <p className="text-gray-500 mt-4">No hay presupuestos con este estado.</p>
      )}
    </div>
  );
};

export default PresupuestosList;