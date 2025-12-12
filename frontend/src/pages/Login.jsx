import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // 1. Estados para capturar lo que escribe el usuario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Para mostrar mensaje si falla

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      console.log("🚀 1. Enviando credenciales...");
      
      const response = await fetch('http://localhost:8000/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      console.log("📡 2. Respuesta del servidor:", response.status);

      if (!response.ok) {
        throw new Error('Error de credenciales o servidor');
      }

      const data = await response.json();
      console.log("📦 3. Datos recibidos (TOKEN):", data);

      // --- AQUÍ ESTÁ LA CLAVE ---
      if (data.access_token) {
          // 1. Guardamos el token
          localStorage.setItem('token', data.access_token);
          console.log("🔑 4. Token guardado en LocalStorage.");

          // 2. FORZAMOS la recarga de la página para ir al inicio
          console.log("🚀 5. Redirigiendo a la fuerza...");
          window.location.href = '/'; 
      } else {
          setError('El servidor respondió OK pero no envió el token.');
      }
      
    } catch (err) {
      console.error("❌ Error:", err);
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Lado Izquierdo: Branding Oscuro (INTACTO) */}
      <div className="hidden w-1/2 flex-col justify-center bg-gray-900 p-12 text-white lg:flex">
        <div className="mb-8 flex items-center gap-4">
          {/* He puesto bg-orange-500 simulando tu bg-mora-orange si no lo tienes definido */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold">CM</div>
          <div>
            <h1 className="text-3xl font-bold">Cerámicas Mora</h1>
            <p className="text-gray-400">Panel comercial interno</p>
          </div>
        </div>
        <h2 className="mb-6 text-2xl font-semibold">Un único punto para la gestión comercial diaria.</h2>
        <ul className="space-y-2 text-gray-300">
          <li>• Catálogo de productos centralizado.</li>
          <li>• Clientes y condiciones por mercado.</li>
          <li>• Presupuestos y tarifas actualizadas.</li>
        </ul>
        <p className="mt-auto text-sm text-gray-500">© 2025 Cerámicas Mora · Entorno seguro</p>
      </div>

      {/* Lado Derecho: Formulario */}
      <div className="flex w-full flex-col justify-center bg-white p-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Cerámicas Mora</h2>
          <p className="mb-8 text-gray-600">Inicia sesión con tu usuario corporativo.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Usuario (email)</label>
              <input 
                type="email" 
                placeholder="usuario@ceramicasmora.com" 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                // Conectamos el input con el estado
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                // Conectamos el input con el estado
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Mensaje de Error (solo sale si falla) */}
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center border border-red-200">
                {error}
              </div>
            )}

            <button type="submit" className="w-full rounded-lg bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 transition-colors">
              Iniciar Sesión
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Credenciales de prueba:</p>
            <p>User: adminmora@gmail.com | Pass: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}