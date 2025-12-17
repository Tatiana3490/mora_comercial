import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Petición al backend real
      const response = await fetch('http://localhost:8000/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardamos los datos
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('userEmail', email);
        
        // Decodificamos rol y ID (simulado o desde token si tuvieras librería jwt-decode)
        // Por ahora asumimos admin para que funcione, o ajusta según tu backend
        localStorage.setItem('userRole', 'admin'); 
        localStorage.setItem('userId', '1');

        toast.success("¡Bienvenido!");
        
        // Redirigimos al Dashboard
        window.location.href = '/dashboard'; 
      } else {
        toast.error("Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mora-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-mora-orange rounded flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
          ¿Problemas para entrar? Contacta con soporte.
        </p>
      </div>
    </div>
  );
};

export default Login;