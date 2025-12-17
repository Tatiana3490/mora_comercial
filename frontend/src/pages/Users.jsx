import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Edit2, Trash2, Key, ShieldCheck, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Modal Crear/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id_usuario: null, nombre: '', apellidos: '', email: '', rol: 'COMERCIAL', password: '' });

  // Estados para Modal Reset Password
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetData, setResetData] = useState({ id_usuario: null, new_password: '' });

  // 1. CARGAR USUARIOS REALES DESDE TU API
  const fetchUsers = async () => {
    try {
        const token = localStorage.getItem('token');
        // Asegúrate de que la URL coincida con tu backend (/v1/usuarios/)
        const res = await fetch('http://localhost:8000/v1/usuarios/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setUsers(await res.json());
        }
    } catch (e) { 
        console.error(e); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- HANDLERS CREAR / EDITAR ---
  const handleOpenCreate = () => {
    setFormData({ id_usuario: null, nombre: '', apellidos: '', email: '', rol: 'COMERCIAL', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({ 
        id_usuario: user.id_usuario, // Importante: usa el nombre real de tu base de datos
        nombre: user.nombre, 
        apellidos: user.apellidos, 
        email: user.email, 
        rol: user.rol, 
        password: '' // En edición normal no tocamos la contraseña
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
        const token = localStorage.getItem('token');
        const isEditing = !!formData.id_usuario;
        
        const url = isEditing 
            ? `http://localhost:8000/v1/usuarios/${formData.id_usuario}` 
            : 'http://localhost:8000/v1/usuarios/';
        
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            toast.success(isEditing ? "Usuario actualizado" : "Usuario creado");
            setIsModalOpen(false);
            fetchUsers(); // Recargamos la lista
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
      if(resetData.new_password.length < 4) return toast.error("Contraseña muy corta");
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:8000/v1/usuarios/${resetData.id_usuario}/reset-password`, {
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

  // --- HANDLER DELETE ---
  const handleDelete = async (id) => {
      if(!confirm("¿Eliminar usuario? Esta acción es irreversible.")) return;
      
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/v1/usuarios/${id}`, { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (res.ok) {
          fetchUsers();
          toast.success("Usuario eliminado");
      } else {
          toast.error("No se pudo eliminar");
      }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipo</h1>
          <p className="text-gray-500 mt-1">Gestión de usuarios y accesos ({users.length})</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition">
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan="3" className="p-8 text-center text-gray-400">Cargando equipo...</td></tr>
                ) : users.map(u => (
                    <tr key={u.id_usuario} className="hover:bg-gray-50 transition">
                        <td className="p-4">
                            <p className="font-bold text-gray-900">{u.nombre} {u.apellidos}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                        </td>
                        <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.rol === 'ADMIN' ? <ShieldCheck size={14}/> : <Shield size={14}/>}
                                {u.rol}
                            </span>
                        </td>
                        <td className="p-4">
                            <div className="flex justify-center gap-2">
                                <button onClick={() => handleOpenReset(u)} className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition" title="Cambiar Contraseña"><Key size={18}/></button>
                                <button onClick={() => handleOpenEdit(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Editar datos"><Edit2 size={18}/></button>
                                <button onClick={() => handleDelete(u.id_usuario)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Eliminar"><Trash2 size={18}/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* --- MODAL CREAR / EDITAR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
                <h2 className="text-xl font-bold mb-4">{formData.id_usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input placeholder="Nombre" className="border p-2 rounded w-full" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} />
                        <input placeholder="Apellidos" className="border p-2 rounded w-full" value={formData.apellidos} onChange={e=>setFormData({...formData, apellidos: e.target.value})} />
                    </div>
                    <input placeholder="Email" className="border p-2 rounded w-full" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
                    
                    <select className="border p-2 rounded w-full bg-white" value={formData.rol} onChange={e=>setFormData({...formData, rol: e.target.value})}>
                        <option value="COMERCIAL">Rol: Comercial</option>
                        <option value="ADMIN">Rol: Administrador</option>
                    </select>

                    {/* La contraseña solo se pide al crear. Al editar se usa el botón de la llave */}
                    {!formData.id_usuario && (
                        <input type="password" placeholder="Contraseña Inicial" className="border p-2 rounded w-full" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded">Cancelar</button>
                    <button onClick={handleSaveUser} className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800">Guardar</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL RESET PASSWORD --- */}
      {isResetOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
                 <div className="flex items-center gap-2 text-yellow-600 mb-4 font-bold text-lg">
                     <Key className="fill-current" /> Cambiar Contraseña
                 </div>
                 <p className="text-sm text-gray-500 mb-4">Establece una nueva contraseña para este usuario.</p>
                 <input type="password" placeholder="Nueva contraseña" className="border p-2 rounded w-full focus:ring-2 focus:ring-yellow-500 outline-none" autoFocus 
                        value={resetData.new_password} onChange={e => setResetData({...resetData, new_password: e.target.value})} />
                 
                 <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsResetOpen(false)} className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded">Cancelar</button>
                    <button onClick={handleSaveReset} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 font-bold">Cambiar</button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default Users;