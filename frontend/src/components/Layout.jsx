import { useState } from 'react'; // Quitamos useEffect
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, BookOpen, Calculator, Users, LogOut, Bell, User } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- DATOS BÁSICOS DIRECTOS ---
  // No necesitamos estados complejos ni useEffects para esto
  const userEmail = localStorage.getItem('userEmail') || 'usuario@mora.com';
  // Sacamos las dos primeras letras en mayúsculas
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors";
    return location.pathname === path 
      ? `${baseClass} bg-mora-orange text-white` 
      : `${baseClass} text-gray-400 hover:bg-white/10 hover:text-white`;
  };

  const handleLogout = () => {
    // Limpiamos todo al salir
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-mora-light">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-mora-dark text-white flex flex-col fixed h-full z-20">
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
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-left">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <button className="text-gray-500 lg:hidden">☰</button>
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            <Bell className="text-gray-500 cursor-pointer hover:text-gray-700" size={20} />
            
            {/* --- CÍRCULO CON INICIALES --- */}
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="h-10 w-10 rounded-full bg-orange-100 border-2 border-transparent hover:border-mora-orange overflow-hidden transition focus:outline-none flex items-center justify-center"
                >
                   <span className="text-orange-600 font-bold text-sm">
                        {userInitials}
                   </span>
                </button>

                {/* MENÚ DESPLEGABLE */}
                {isMenuOpen && (
                    <>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-gray-100 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-xs text-gray-500 font-bold mb-1">CONECTADO COMO</p>
                                <p className="text-sm font-bold text-gray-900 truncate" title={userEmail}>
                                    {userEmail}
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => { setIsMenuOpen(false); navigate('/perfil'); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <User size={16} /> Mi Perfil
                            </button>
                            
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                        </div>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                    </>
                )}
            </div>
          </div>
        </header>

        <div className="p-8 overflow-auto bg-gray-50 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}