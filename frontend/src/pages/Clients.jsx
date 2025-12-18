import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Plus, Edit2, Trash2, Building, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import PrivateNotes from '../components/PrivateNotes'; // Asegúrate de que la ruta es correcta

const Clients = () => {
  // --- SEGURIDAD ---
  const userId = parseInt(localStorage.getItem('userId') || '1');
  const userRole = localStorage.getItem('userRole') || 'admin';

  // --- ESTADOS ---
  const [clients, setClients] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [loading, setLoading] = useState(true); 

  // --- ESTADO PARA NOTAS DESPLEGABLES ---
  // Guardamos el ID del cliente que tiene las notas abiertas (solo uno a la vez)
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
            if (userRole !== 'admin') {
                data = data.filter(c => c.id_comercial_propietario === userId);
            }
            setClients(data);
        }
    } catch (error) {
        console.error("Error", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []); 

  // --- 2. LÓGICA DEL ACORDEÓN (ABRIR/CERRAR NOTAS) ---
  const toggleNotes = (clientId) => {
    if (expandedClientId === clientId) {
        setExpandedClientId(null); // Si ya está abierto, lo cerramos
    } else {
        setExpandedClientId(clientId); // Si no, lo abrimos
    }
  };

  // --- LÓGICA DEL MODAL DE CLIENTES (CREAR/EDITAR) ---
  const handleOpenCreate = () => {
    setFormData({ id_cliente: null, nombre: '', nif: '', correo: '', telefono: '', direccion: '', provincia: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (client) => {
    setFormData({
      id_cliente: client.id_cliente,
      nombre: client.nombre || client.nombre_completo, 
      nif: client.nif || '',
      correo: client.correo || '',
      telefono: client.telefono || '',
      direccion: client.direccion || '',
      provincia: client.provincia || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveClient = async () => {
    // ... (Tu lógica de guardado sigue igual, la resumo para no ocupar espacio) ...
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
     // ... (Tu lógica de borrar sigue igual) ...
     if (!confirm("¿Borrar cliente?")) return;
     const token = localStorage.getItem('token');
     await fetch(`v/v1/clientes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
     fetchClients();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-500 mt-1">Cartera activa ({clients.length})</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition">
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {/* LISTA DE TARJETAS */}
      {loading ? <div className="text-center py-10">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => {
                const isNotesOpen = expandedClientId === client.id_cliente;
                
                return (
                <div key={client.id_cliente} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${isNotesOpen ? 'ring-2 ring-orange-100 border-orange-200' : 'border-gray-100 hover:shadow-md'}`}>
                    
                    {/* PARTE SUPERIOR DE LA TARJETA (SIEMPRE VISIBLE) */}
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                    {client.nombre ? client.nombre.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{client.nombre || client.nombre_completo}</h2>
                                    <span className="text-xs text-gray-400 font-mono">{client.nif || 'Sin NIF'}</span>
                                </div>
                            </div>
                            
                            {/* BOTONES DE ACCIÓN */}
                            <div className="flex gap-1">
                                {/* 🔥 BOTÓN ACORDEÓN DE NOTAS */}
                                <button 
                                    onClick={() => toggleNotes(client.id_cliente)}
                                    className={`p-1.5 rounded transition flex items-center gap-1 ${isNotesOpen ? 'bg-orange-100 text-orange-700' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                                    title={isNotesOpen ? "Cerrar notas" : "Ver notas privadas"}
                                >
                                    <FileText size={18} />
                                    {isNotesOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                </button>

                                <button onClick={() => handleEdit(client)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition"><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(client.id_cliente)} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition"><Trash2 size={18} /></button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail size={16} className="text-orange-400" /><span>{client.correo || 'Sin email'}</span></div>
                            <div className="flex items-center gap-2"><Phone size={16} className="text-orange-400" /><span>{client.telefono || 'Sin teléfono'}</span></div>
                            <div className="flex items-start gap-2"><MapPin size={16} className="text-orange-400 mt-0.5" /><span className="line-clamp-2">{client.direccion || 'Sin dirección'}</span></div>
                        </div>
                    </div>

                    {/* 🔥 ZONA DESPLEGABLE: AQUÍ VAN LAS NOTAS */}
                    {isNotesOpen && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-4 rounded-b-xl animate-in slide-in-from-top-2 duration-200">
                            {/* Insertamos tu componente de notas aquí dentro */}
                            <PrivateNotes clientId={client.id_cliente} />
                        </div>
                    )}

                </div>
            )})}
        </div>
      )}

      {/* MODAL CREAR/EDITAR (Solo mantenemos este modal flotante) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
             {/* ... (Tu formulario del modal, igual que antes) ... */}
             <h2 className="text-2xl font-bold mb-4 flex gap-2"><Building className="text-orange-500"/> {formData.id_cliente ? 'Editar' : 'Nuevo'}</h2>
             
             <div className="space-y-3">
                <input placeholder="Nombre *" className="w-full border p-2 rounded" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} />
                <input placeholder="NIF" className="w-full border p-2 rounded" value={formData.nif} onChange={e=>setFormData({...formData, nif: e.target.value})} />
                <input placeholder="Email" className="w-full border p-2 rounded" value={formData.correo} onChange={e=>setFormData({...formData, correo: e.target.value})} />
                <input placeholder="Teléfono" className="w-full border p-2 rounded" value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} />
                <input placeholder="Dirección" className="w-full border p-2 rounded" value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} />
             </div>

             <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">Cancelar</button>
                <button onClick={handleSaveClient} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">Guardar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;