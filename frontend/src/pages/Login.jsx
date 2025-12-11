import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Aquí iría tu lógica de conexión con FastAPI
    navigate('/dashboard'); 
  };

  return (
    <div className="flex h-screen w-full">
      {/* Lado Izquierdo: Branding Oscuro */}
      <div className="hidden w-1/2 flex-col justify-center bg-mora-dark p-12 text-white lg:flex">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mora-orange text-2xl font-bold">CM</div>
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
              <input type="email" placeholder="tusuari@ceramicasmora.com" className="w-full rounded-lg border border-gray-300 p-3 focus:border-mora-orange focus:outline-none focus:ring-1 focus:ring-mora-orange" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-gray-300 p-3 focus:border-mora-orange focus:outline-none focus:ring-1 focus:ring-mora-orange" />
            </div>

            <button type="submit" className="w-full rounded-lg bg-mora-orange py-3 font-bold text-white hover:bg-orange-600 transition-colors">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}