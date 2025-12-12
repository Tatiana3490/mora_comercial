import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Plus, Edit2, Trash2, Building } from 'lucide-react';

const Clients = () => {
  // --- ESTADOS ---
  const [clients, setClients] = useState([]); // Lista de clientes
  const [isModalOpen, setIsModalOpen] = useState(false); // Abrir/Cerrar formulario
  const [loading, setLoading] = useState(true); // Estado de carga

  // Formulario adaptado a tu Base de Datos (usamos nombres en español como en el backend)
  const [formData, setFormData] = useState({
    id_cliente: null, // Si es null, es un cliente nuevo
    nombre: '',
    nif: '',       
    correo: '',
    telefono: '',
    direccion: '',
    provincia: ''  
  });

  // --- 1. CARGAR CLIENTES (GET) ---
  // Esta función va al servidor y trae la lista real
  const fetchClients = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/v1/clientes/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            setClients(data);
        } else {
            console.error("Error al cargar clientes");
        }
    } catch (error) {
        console.error("Error de conexión", error);
    } finally {
        setLoading(false);
    }
  };

  // Ejecutamos la carga al entrar en la página
  useEffect(() => {
    fetchClients();
  }, []);

  // --- FUNCIONES DEL MODAL ---
  // Limpiar formulario para crear uno nuevo
  const handleOpenCreate = () => {
    setFormData({ id_cliente: null, nombre: '', nif: '', correo: '', telefono: '', direccion: '', provincia: '' });
    setIsModalOpen(true);
  };

  // Cargar datos de un cliente existente para editar
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

  // --- 2. GUARDAR (CREAR O EDITAR) ---
  const handleSaveClient = async () => {
    if (!formData.nombre) return alert("El nombre es obligatorio");

    try {
        const token = localStorage.getItem('token');
        const isEditing = !!formData.id_cliente; // ¿Estamos editando?
        
        // Preparamos los datos para enviarlos a Python
        const payload = {
            nombre: formData.nombre,
            nif: formData.nif,
            correo: formData.correo,
            telefono: formData.telefono,
            direccion: formData.direccion,
            provincia: formData.provincia,
            id_comercial_propietario: 1 // Asignamos al usuario 1 por defecto (Admin)
        };

        // Decidimos si es crear (POST) o editar (PUT)
        let url = 'http://localhost:8000/v1/clientes/';
        let method = 'POST';

        if (isEditing) {
            url = `http://localhost:8000/v1/clientes/${formData.id_cliente}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert(isEditing ? "✅ Cliente actualizado" : "✅ Cliente creado");
            setIsModalOpen(false);
            fetchClients(); // Recargamos la lista para ver los cambios
        } else {
            alert("❌ Error al guardar cliente. Revisa los datos.");
        }

    } catch (error) {
        console.error("Error guardando:", error);
    }
  };

  // --- 3. BORRAR (DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar este cliente?")) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/v1/clientes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            fetchClients(); // Recargamos la lista
        } else {
            alert("❌ No se pudo borrar (puede que tenga presupuestos asociados).");
        }
    } catch (error) {
        console.error("Error borrando:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-500 mt-1">Cartera de clientes ({clients.length})</p>
        </div>
        
        <button 
          onClick={handleOpenCreate}
          className="mt-4 md:mt-0 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition flex items-center gap-2"
        >
          <Plus size={20} /> Añadir Nuevo Cliente
        </button>
      </div>

      {/* LISTA DE CLIENTES */}
      {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando cartera de clientes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
            <div key={client.id_cliente} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
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
                    
                    {/* Botones de Editar y Borrar */}
                    <div className="flex gap-2">
                        <button onClick={() => handleEdit(client)} className="text-gray-400 hover:text-blue-600 p-1 transition"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(client.id_cliente)} className="text-gray-400 hover:text-red-600 p-1 transition"><Trash2 size={18} /></button>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Mail size={16} className="text-orange-400" />
                        <span>{client.correo || 'Sin email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={16} className="text-orange-400" />
                        <span>{client.telefono || 'Sin teléfono'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-orange-400 mt-0.5" />
                        <span className="line-clamp-2">{client.direccion || 'Sin dirección'} {client.provincia ? `(${client.provincia})` : ''}</span>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* MODAL (FORMULARIO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg animate-in fade-in zoom-in duration-200">
            
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Building className="text-orange-500"/>
              {formData.id_cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre / Razón Social *</label>
                <input 
                  type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIF / CIF</label>
                <input 
                  type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.nif} onChange={(e) => setFormData({...formData, nif: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input 
                  type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input 
                  type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                />
              </div>

              <div className="col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                 <input 
                   type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                   value={formData.provincia} onChange={(e) => setFormData({...formData, provincia: e.target.value})}
                 />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
              <button onClick={handleSaveClient} className="px-5 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-md transition">
                {formData.id_cliente ? 'Guardar Cambios' : 'Crear Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;