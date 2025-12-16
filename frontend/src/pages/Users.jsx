import React from 'react';
import { Shield, Key, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  // Lista simulada (esto vendría de tu API: GET /users)
  const users = [
    { id: 1, email: 'adminmora@gmail.com', role: 'admin' },
    { id: 2, email: 'pepe@ceramicasmora.com', role: 'comercial' },
    { id: 3, email: 'luis@ceramicasmora.com', role: 'comercial' },
  ];

  const handleResetPassword = (email) => {
    // Aquí podrías abrir un modal para escribir la nueva contraseña
    // O generar una aleatoria. Simulamos que se resetea a "123456":
    
    const confirm = window.confirm(`¿Seguro que quieres resetear la clave de ${email} a '123456'?`);
    if (confirm) {
        // Fetch API call: POST /auth/reset-password { email: email }
        toast.success(`Clave de ${email} reseteada correctamente.`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Usuarios</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4 font-bold text-gray-600">Usuario</th>
                    <th className="p-4 font-bold text-gray-600">Rol</th>
                    <th className="p-4 font-bold text-gray-600 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium">{user.email}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                            <button 
                                onClick={() => handleResetPassword(user.email)}
                                className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded hover:bg-orange-200 text-sm font-bold transition"
                            >
                                <Key size={14} /> Resetear Clave
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;