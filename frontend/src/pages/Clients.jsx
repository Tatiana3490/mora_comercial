import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Plus, Edit2, Trash2, Building, FileText, ChevronUp, ChevronDown, Search } from 'lucide-react';
import PrivateNotes from '../components/PrivateNotes'; 

const Clients = () => {
  // --- SEGURIDAD ---
  const userId = parseInt(localStorage.getItem('userId') || '1');
  const userRole = localStorage.getItem('userRole') || 'admin';

  // --- ESTADOS ---
  const [clients, setClients] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [loading, setLoading] = useState(true); 
  
  // ESTADO PARA EL BUSCADOR
  const [searchTerm, setSearchTerm] = useState('');

  // ESTADO PARA NOTAS DESPLEGABLES
  const [expandedClientId, setExpandedClientId] = useState(null);

  // Formulario
  const [formData, setFormData] = useState({
    id_cliente: null,
    nombre: '', nif: '', correo: '', telefono: '', direccion: '', provincia: ''  
  });

  // --- 1. CARGAR CLIENTES ---
  const fetchClients = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('${import.meta.env.VITE_API_URL}/v1/clientes/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            let data = await response.json();
            // Descomentar si quieres filtrar por comercial
            /* if (userRole !== 'admin') {
                data = data.filter(c => c.id_comercial_propietario === userId);
            } */
            setClients(data);
        }
    } catch (error) {
        console.error("Error", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []); 

  // --- 3. LÓGICA DEL FILTRO ---
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase();
    const match = (field) => (field || '').toString().toLowerCase().includes(term);

    return (
        match(client.nombre) || 
        match(client.nombre_completo) || 
        match(client.nif) || 
        match(client.correo) || match(client.email) ||
        match(client.telefono) || 
        match(client.direccion) || 
        match(client.provincia)
    );
  });

  // --- LÓGICA DEL ACORDEÓN ---
  const toggleNotes = (clientId) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  // --- LÓGICA DEL MODAL ---
  const handleOpenCreate = () => {
    setFormData({ id_cliente: null, nombre: '', nif: '', correo: '', telefono: '', direccion: '', provincia: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (client) => {
    setFormData({
      id_cliente: client.id_cliente,
      nombre: client.nombre || client.nombre_completo, 
      nif: client.nif || '',
      correo: client.correo || client.email || '',
      telefono: client.telefono || '',
      direccion: client.direccion || '',
      provincia: client.provincia || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveClient = async () => {
    if (!formData.nombre) return alert("Nombre obligatorio");
    try {
        const token = localStorage.getItem('token');
        const isEditing = !!formData.id_cliente; 
        const url = isEditing ? `${import.meta.env.VITE_API_URL}/v1/clientes/${formData.id_cliente}` : '${import.meta.env.VITE_API_URL}/v1/clientes/';
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ...formData, id_comercial_propietario: userId })
        });

        if (response.ok) {
            setIsModalOpen(false);
            fetchClients();
        }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
     if (!confirm("¿Borrar cliente?")) return;
     const token = localStorage.getItem('token');
     await fetch(`v/v1/clientes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
     fetchClients();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* CABECERA CON BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-500 mt-1">Listado de clientes ({clients.length})</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition shadow-sm"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button onClick={handleOpenCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition justify-center">
             <Plus size={20} /> Nuevo
            </button>
        </div>
      </div>

      {/* --- VISTA DE LISTA --- */}
      {loading ? <div className="text-center py-10">Cargando...</div> : (
        <div className="space-y-3"> {/* Contenedor vertical para la lista */}
            
            {/* Encabezados de la lista (Opcional, para que parezca tabla) */}
            <div className="hidden md:flex px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="w-1/3">Cliente / Empresa</div>
                <div className="w-1/3">Contacto</div>
                <div className="w-1/3 text-right">Acciones</div>
            </div>

            {filteredClients.length === 0 ? (
                 <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed">
                    No hay resultados para "{searchTerm}"
                 </div>
            ) : filteredClients.map((client) => {
                const isExpanded = expandedClientId === client.id_cliente;
                
                return (
                <div key={client.id_cliente} className={`bg-white rounded-lg border transition-all duration-200 overflow-hidden ${isExpanded ? 'ring-2 ring-orange-100 border-orange-300 shadow-md' : 'border-gray-200 hover:border-orange-200'}`}>
                    
                    {/* FILA PRINCIPAL (Siempre visible) */}
                    <div className="p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
                        
                        {/* 1. Datos del Cliente (Izquierda) */}
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-600 font-bold">
                                {client.nombre ? client.nombre.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">{client.nombre || client.nombre_completo}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{client.nif || 'Sin NIF'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Datos de Contacto (Centro - Oculto en móviles muy pequeños si quieres) */}
                        <div className="w-full md:w-1/3 flex flex-col gap-1 text-sm text-gray-600">
                             <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <span className="truncate">{client.correo || client.email || 'Sin email'}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span>{client.telefono || 'Sin teléfono'}</span>
                             </div>
                        </div>

                        {/* 3. Botones de Acción (Derecha) */}
                        <div className="w-full md:w-1/3 flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 mt-3 md:mt-0">
                            {/* Botón Principal: Ver Detalles/Notas */}
                            <button 
                                onClick={() => toggleNotes(client.id_cliente)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${isExpanded ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                <FileText size={16} />
                                {isExpanded ? 'Cerrar' : 'Detalles'}
                                {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                            </button>

                            <div className="h-6 w-px bg-gray-200 mx-1"></div>

                            <button onClick={() => handleEdit(client)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Editar">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(client.id_cliente)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Eliminar">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ZONA DESPLEGABLE: DATOS EXTRA + NOTAS */}
                    {isExpanded && (
                        <div className="bg-gray-50 border-t border-gray-200 p-6 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Columna Izquierda: Datos completos */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos de Ubicación</h4>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <MapPin size={20} className="text-orange-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {client.direccion || 'Dirección no registrada'}
                                                </p>
                                                {client.provincia && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Provincia: <span className="font-semibold text-gray-700">{client.provincia}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha: Componente de Notas */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notas Privadas</h4>
                                    <PrivateNotes clientId={client.id_cliente} />
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            )})}
        </div>
      )}

      {/* MODAL CREAR/EDITAR (Sin cambios) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
             <h2 className="text-2xl font-bold mb-4 flex gap-2"><Building className="text-orange-500"/> {formData.id_cliente ? 'Editar' : 'Nuevo'}</h2>
             
             <div className="space-y-3">
                <input placeholder="Nombre *" className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} />
                <input placeholder="NIF" className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" value={formData.nif} onChange={e=>setFormData({...formData, nif: e.target.value})} />
                <input placeholder="Email" className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} />
                <input placeholder="Teléfono" className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} />
                <input placeholder="Dirección" className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} />
                <input placeholder="Provincia" className="w-full border p-2 rounded focus:ring-2 focus:ring-orange-500 outline-none" value={formData.provincia} onChange={e=>setFormData({...formData, provincia: e.target.value})} />
             </div>

             <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded">Cancelar</button>
                <button onClick={handleSaveClient} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 shadow-md">Guardar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;