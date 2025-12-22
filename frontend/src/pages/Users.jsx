import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit2, Trash2, Key, ShieldCheck, Shield, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

// ---  REGLAS DE SEGURIDAD (Deben coincidir con Backend) ---
const REGLAS_PASSWORD = [
  { label: '8+ caracteres', test: (p) => p.length >= 8 },
  { label: 'Mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Número', test: (p) => /[0-9]/.test(p) },
  { label: 'Especial (@#$!)', test: (p) => /[!@#$%^&*]/.test(p) },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id_usuario: null, nombre: '', apellidos: '', email: '', rol: 'COMERCIAL', password: '' });
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetData, setResetData] = useState({ id_usuario: null, new_password: '' });

  // 1. CARGAR USUARIOS
  const fetchUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        // ✅ CORRECCIÓN 1: Comillas invertidas ` `
        const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/usuarios/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- HANDLERS CREAR / EDITAR ---
  const handleOpenCreate = () => {
    setFormData({ id_usuario: null, nombre: '', apellidos: '', email: '', rol: 'COMERCIAL', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({ id_usuario: user.id_usuario, nombre: user.nombre, apellidos: user.apellidos, email: user.email, rol: user.rol, password: '' });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    //  Validación de seguridad antes de enviar (Solo en creación)
    if (!formData.id_usuario) {
       const esFuerte = REGLAS_PASSWORD.every(r => r.test(formData.password));
       if (!esFuerte) return toast.error("La contraseña no cumple los requisitos de seguridad");
    }

    try {
        const token = localStorage.getItem('token');
        const isEditing = !!formData.id_usuario;
        
      
        const url = isEditing 
            ? `${import.meta.env.VITE_API_URL}/v1/usuarios/${formData.id_usuario}` 
            : `${import.meta.env.VITE_API_URL}/v1/usuarios/`;
            
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            toast.success(isEditing ? "Usuario actualizado" : "Usuario creado");
            setIsModalOpen(false);
            fetchUsers();
        } else {
            const err = await res.json();
            toast.error(err.detail || "Error al guardar");
        }
    } catch (e) { toast.error("Error de conexión"); }
  };

  // --- HANDLERS RESET PASSWORD ---
  const handleOpenReset = (user) => {
      setResetData({ id_usuario: user.id_usuario, new_password: '' });
      setIsResetOpen(true);
  };

  const handleSaveReset = async () => {
      //  Validación de seguridad en el reset
      const esFuerte = REGLAS_PASSWORD.every(r => r.test(resetData.new_password));
      if (!esFuerte) return toast.error("La nueva contraseña es demasiado débil");

      try {
          const token = localStorage.getItem('token');
          // ✅ (Esto ya estaba bien, pero ojo con las comillas siempre)
          const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/usuarios/${resetData.id_usuario}/reset-password`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ new_password: resetData.new_password })
          });
          if (res.ok) {
              toast.success("Contraseña restablecida");
              setIsResetOpen(false);
          } else {
              toast.error("Error al resetear");
          }
      } catch (e) { toast.error("Error de conexión"); }
  };

  const handleDelete = async (id) => {
      if(!confirm("¿Eliminar usuario?")) return;
      const token = localStorage.getItem('token');
     
      const res = await fetch(`${import.meta.env.VITE_API_URL}/v1/usuarios/${id}`, { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) { fetchUsers(); toast.success("Usuario eliminado"); }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipo</h1>
          <p className="text-gray-500 mt-1">Gestión de usuarios ({users.length})</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-slate-900 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan="3" className="p-8 text-center">Cargando...</td></tr>
                ) : users.map(u => (
                    <tr key={u.id_usuario} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-900">{u.nombre} {u.apellidos}</td>
                        <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.rol}
                            </span>
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => handleOpenReset(u)} className="p-2 text-gray-400 hover:text-yellow-600 transition"><Key size={18}/></button>
                            <button onClick={() => handleOpenEdit(u)} className="p-2 text-gray-400 hover:text-blue-600 transition"><Edit2 size={18}/></button>
                            <button onClick={() => handleDelete(u.id_usuario)} className="p-2 text-gray-400 hover:text-red-600 transition"><Trash2 size={18}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL CREAR / EDITAR CON VALIDACIÓN VISUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md animate-in zoom-in-95">
                <h2 className="text-xl font-bold mb-4">{formData.id_usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="Nombre" className="border p-2 rounded w-full" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} />
                        <input placeholder="Apellidos" className="border p-2 rounded w-full" value={formData.apellidos} onChange={e=>setFormData({...formData, apellidos: e.target.value})} />
                    </div>
                    <input placeholder="Email" className="border p-2 rounded w-full" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                    <select className="border p-2 rounded w-full bg-white" value={formData.rol} onChange={e=>setFormData({...formData, rol: e.target.value})}>
                        <option value="COMERCIAL">Comercial</option>
                        <option value="ADMIN">Administrador</option>
                    </select>

                    {!formData.id_usuario && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <input type="password" placeholder="Contraseña Inicial" className="border p-2 rounded w-full" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
                        {/* 🔒 Cuadrícula de requisitos */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {REGLAS_PASSWORD.map((regla, i) => {
                            const cumplida = regla.test(formData.password || '');
                            return (
                              <div key={i} className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${cumplida ? 'text-green-600' : 'text-gray-300'}`}>
                                {cumplida ? <Check size={10} /> : <X size={10} />} {regla.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2">Cancelar</button>
                    <button onClick={handleSaveUser} className="bg-slate-900 text-white px-4 py-2 rounded">Guardar</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL RESET PASSWORD CON VALIDACIÓN VISUAL */}
      {isResetOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm animate-in zoom-in-95">
                  <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-600"><Key /> Cambiar Contraseña</h2>
                  <input type="password" placeholder="Nueva contraseña" className="border p-2 rounded w-full" autoFocus 
                        value={resetData.new_password} onChange={e => setResetData({...resetData, new_password: e.target.value})} />
                  
                  {/* 🔒 Cuadrícula de requisitos */}
                  <div className="grid grid-cols-2 gap-2 mt-4 bg-gray-50 p-2 rounded-lg">
                    {REGLAS_PASSWORD.map((regla, i) => {
                      const cumplida = regla.test(resetData.new_password || '');
                      return (
                        <div key={i} className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${cumplida ? 'text-green-600' : 'text-gray-300'}`}>
                          {cumplida ? <Check size={10} /> : <X size={10} />} {regla.label}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsResetOpen(false)} className="px-4 py-2">Cancelar</button>
                    <button onClick={handleSaveReset} className="bg-yellow-600 text-white px-4 py-2 rounded font-bold">Cambiar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Users;