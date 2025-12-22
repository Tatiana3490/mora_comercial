import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // --- 🔥 FUNCIÓN AUXILIAR PARA LEER EL TOKEN (JWT) ---
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 1. Guardamos el token
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userEmail', email);
        
        // 2. Analizamos el token
        const decodedToken = parseJwt(data.access_token);
        console.log("Datos dentro del token:", decodedToken); 

        // --- 🔥 LÓGICA DE ROLES CORREGIDA ---
        let userRole = decodedToken.role; // Intentamos leer el rol si existe

        if (!userRole) {
            // SI NO HAY ROL: Miramos el ID (sub). 
            // Asumimos que el ID "1" es el Super Admin.
            if (decodedToken.sub === "1" || decodedToken.id === 1) {
                userRole = 'admin';
            } else {
                userRole = 'comercial';
            }
        }
        
        // Usamos el 'sub' como ID de usuario
        const userId = decodedToken.sub || decodedToken.id || '0'; 

        localStorage.setItem('userRole', userRole); 
        localStorage.setItem('userId', userId);

        toast.success(`¡Bienvenido ${userRole.toUpperCase()}!`);
        
        // Redirigimos
        window.location.href = '/dashboard'; 
      } else {
        // --- ESTO ES LO QUE FALTABA ---
        toast.error("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  }; // <--- FALTABA CERRAR LA FUNCIÓN AQUÍ

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-orange-600 rounded flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            CM
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Cerámicas Mora</h2>
        <p className="text-center text-gray-500 mb-8">Accede a tu panel de gestión</p>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="email" 
                required
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                placeholder="usuario@mora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                required
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-slate-800 transition flex justify-center items-center disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Problemas para entrar? Contacta con el Administrador.
        </p>
      </div>
    </div>
  );
};

export default Login;