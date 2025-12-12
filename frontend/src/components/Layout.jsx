import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, BookOpen, Calculator, Users, LogOut, Bell } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  // Función para saber si el enlace está activo y ponerlo naranja
  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors";
    return location.pathname === path 
      ? `${baseClass} bg-mora-orange text-white` 
      : `${baseClass} text-gray-400 hover:bg-white/10 hover:text-white`;
  };

  // --- 1. AÑADE ESTA FUNCIÓN AQUÍ (Antes del return) ---
  const handleLogout = () => {
    // Borramos la llave
    localStorage.removeItem('token');
    // Forzamos la salida al login
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-mora-light">
      
      {/* SIDEBAR OSCURO */}
      <aside className="w-64 bg-mora-dark text-white flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-mora-orange flex items-center justify-center font-bold">CM</div>
          <div>
            <h1 className="font-bold leading-none">Cerámicas</h1>
            <span className="text-mora-orange font-bold">Mora</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            <LayoutGrid size={20} /> Inicio
          </Link>
          <Link to="/catalogo" className={getLinkClass('/catalogo')}>
            <BookOpen size={20} /> Catálogo
          </Link>
          <Link to="/presupuestos" className={getLinkClass('/presupuestos')}>
            <Calculator size={20} /> Presupuestos
          </Link>
          <Link to="/clientes" className={getLinkClass('/clientes')}>
            <Users size={20} /> Clientes
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          {/* --- 2. CAMBIAMOS EL LINK POR UN BOTÓN --- */}
          <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-left"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* HEADER BLANCO SUPERIOR */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <button className="text-gray-500">☰</button>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-500" size={20} />
            <div className="h-8 w-8 rounded-full bg-gray-200 border border-mora-orange overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Alex&background=random" alt="User" />
            </div>
          </div>
        </header>

        {/* CONTENIDO DE LA PÁGINA */}
        <div className="p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}