import React, { useState, useEffect } from 'react';
import { Mail, Shield, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const [userData, setUserData] = useState({ email: '', rol: '', iniciales: '' });
  
  // Estado solo para el Admin (para cambiar SU propia contraseña)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'comercial';
    const email = localStorage.getItem('userEmail') || 'usuario@mora.com';
    setUserData({
      email: email,
      rol: role,
      iniciales: email.substring(0, 2).toUpperCase()
    });
  }, []);

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error("No coinciden");
    toast.success("Tu contraseña de Administrador ha sido actualizada");
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const isAdmin = userData.rol === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
      <p className="text-gray-500 mb-8">Información de tu cuenta de usuario.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TARJETA DE INFO (VISIBLE PARA TODOS) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-3xl font-bold border-4 border-orange-50 mb-4">
                {userData.iniciales}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{userData.email}</h2>
            <span className={`px-3 py-1 text-xs font-bold rounded-full mt-2 uppercase ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {userData.rol}
            </span>
            <div className="w-full mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="email" value={userData.email} disabled className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"/>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA DE SEGURIDAD (CONDICIONAL) */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="text-orange-500" /> Seguridad
            </h3>
            
            {/* SI ES ADMIN: Ve el formulario */}
            {isAdmin ? (
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                    <p className="text-sm text-gray-600 mb-4">Como administrador, puedes cambiar tu contraseña aquí.</p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" value={passwords.new} onChange={e=>setPasswords({...passwords, new:e.target.value})} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-orange-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input type="password" value={passwords.confirm} onChange={e=>setPasswords({...passwords, confirm:e.target.value})} className="w-full pl-10 p-2.5 border rounded-lg focus:ring-orange-500"/>
                        </div>
                    </div>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800">Actualizar Mi Clave</button>
                </form>
            ) : (
                /* SI ES COMERCIAL: Ve el aviso de bloqueo */
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                        <Shield size={48} className="text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold text-blue-900 mb-2">Gestión de contraseñas centralizada</h4>
                    <p className="text-blue-700 mb-4 max-w-md mx-auto">
                        Por motivos de seguridad, los perfiles comerciales no pueden modificar su contraseña manualmente.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-800 font-medium bg-blue-100 py-2 px-4 rounded-full inline-flex">
                        <AlertCircle size={16} />
                        Si has olvidado tu clave, contacta con el Administrador.
                    </div>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;