import React, { useState, useEffect } from 'react';

const Clients = () => {
  // --- ESTADOS ---

  // 1. Lista de Clientes
  const [clients, setClients] = useState(() => {
    const savedClients = localStorage.getItem('clientsData');
    if (savedClients) return JSON.parse(savedClients);
    return [
      {
        id: 1,
        name: 'Juan García López',
        company: 'Constructora del Sol S.L.',
        email: 'compras@constructoradelsol.es',
        phone: '950 123 456',
        address: 'Calle Principal 123, Almería 04001',
        note: { date: '15/1/2024', text: 'Cliente preferente con descuento del 10%' }
      }
    ];
  });

  // 2. Modal abierto/cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. Formulario (Ahora incluye 'id' para saber si editamos)
  const [formData, setFormData] = useState({
    id: null, // Si es null, es nuevo. Si tiene número, es edición.
    name: '',
    company: '',
    email: '',
    phone: '',
    address: ''
  });

  // --- EFECTOS ---
  useEffect(() => {
    localStorage.setItem('clientsData', JSON.stringify(clients));
  }, [clients]);

  // --- FUNCIONES ---

  // ABRIR MODAL PARA CREAR (Limpio)
  const handleOpenCreate = () => {
    setFormData({ id: null, name: '', company: '', email: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  // ABRIR MODAL PARA EDITAR (Carga datos)
  const handleEdit = (client) => {
    setFormData({
      id: client.id,
      name: client.name,
      company: client.company || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || ''
    });
    setIsModalOpen(true);
  };

  // GUARDAR (Detecta si es Crear o Editar)
  const handleSaveClient = () => {
    if (!formData.name) return alert("El nombre es obligatorio");

    if (formData.id) {
      // --- MODO EDICIÓN ---
      const updatedClients = clients.map((client) => 
        client.id === formData.id 
          ? { ...client, ...formData } // Mantenemos notas u otros campos, actualizamos el resto
          : client
      );
      setClients(updatedClients);
    } else {
      // --- MODO CREACIÓN ---
      const newClient = {
        ...formData,
        id: Date.now(), // ID nuevo
        note: null
      };
      setClients([...clients, newClient]);
    }

    setIsModalOpen(false); // Cerrar
  };

  // BORRAR
  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres borrar este cliente?")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans relative">
      
      {/* --- CABECERA --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Todos los Clientes ({clients.length})</p>
        </div>
        
        {/* BOTÓN AÑADIR */}
        <button 
          onClick={handleOpenCreate} // Usamos la función de limpiar y abrir
          className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow transition flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Añadir Nuevo Cliente
        </button>
      </div>

      {/* --- LISTA DE CLIENTES --- */}
      <div className="space-y-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
                <p className="text-gray-600 font-medium">{client.company}</p>
              </div>
              
              {/* --- BOTONES DE ACCIÓN --- */}
              <div className="flex space-x-3">
                
                {/* BOTÓN EDITAR (ICONO LÁPIZ) */}
                <button 
                  onClick={() => handleEdit(client)} // <--- CONECTADO AQUÍ
                  className="text-gray-400 hover:text-blue-600 p-1 transition"
                  title="Editar Cliente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* BOTÓN ELIMINAR (ICONO BASURA) */}
                <button 
                  onClick={() => handleDelete(client.id)} 
                  className="text-gray-400 hover:text-red-600 p-1 transition"
                  title="Eliminar Cliente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Resto de datos de la tarjeta... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {client.email || 'Sin email'}
              </div>
              <div className="flex items-center text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {client.phone || 'Sin teléfono'}
              </div>
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{client.address || 'Sin dirección'}</span>
            </div>
            {client.note && (
              <div className="mt-4 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-semibold text-blue-800">Última nota ({client.note.date}):</p>
                  <p className="text-blue-700 text-sm mt-1">{client.note.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {clients.length === 0 && (
          <div className="text-center p-8 text-gray-500 bg-white rounded-xl shadow-sm">
            No hay clientes registrados.
          </div>
        )}
      </div>

      {/* --- MODAL (CREAR / EDITAR) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
            
            {/* Título dinámico */}
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {formData.id ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Ana López"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Empresa</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <textarea 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveClient}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition"
              >
                {formData.id ? 'Actualizar Cliente' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;