import { useState, useEffect } from 'react'; 
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, BookOpen, Calculator, Users, LogOut, Bell, User, CheckCircle, XCircle, Menu } from 'lucide-react'; 



export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate(); 
  
  // --- ESTADOS DE LA UI ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);       
  const [isNotifOpen, setIsNotifOpen] = useState(false);     
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const [notifications, setNotifications] = useState([]);

  // Datos usuario
  const userEmail = localStorage.getItem('userEmail') || 'usuario@mora.com';
  const userInitials = userEmail.substring(0, 2).toUpperCase();
  // Leemos el rol y lo pasamos a minúsculas para comparar seguro
  const userRole = (localStorage.getItem('userRole') || '').toLowerCase();

  const formatoMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cantidad);
  };

  // --- CARGA DE NOTIFICACIONES ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [resPresupuestos, resClientes] = await Promise.all([
            fetch('http://localhost:8000/v1/presupuestos/', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('http://localhost:8000/v1/clientes/', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (resPresupuestos.ok && resClientes.ok) {
            const presupuestos = await resPresupuestos.json();
            const clientes = await resClientes.json();
            
            const misNotificaciones = presupuestos
                .filter(p => (p.estado === 'ACEPTADO' || p.estado === 'RECHAZADO'))
                .map(p => {
                    const clienteEncontrado = clientes.find(c => c.id_cliente === p.id_cliente);
                    return {
                        id: p.id, 
                        tipo: p.estado, 
                        clienteNombre: clienteEncontrado ? clienteEncontrado.nombre : 'Cliente Desconocido',
                        total: p.total,
                        fecha: p.fecha_validez
                    };
                })
                .slice(0, 5); 

            setNotifications(misNotificaciones);
        } else {
             // Demo fallback
             setNotifications([
                { id: 101, tipo: 'ACEPTADO', clienteNombre: 'Reformas Pepe S.L.', total: 4500 },
                { id: 102, tipo: 'RECHAZADO', clienteNombre: 'Construcciones Levante', total: 12000 }
            ]);
        }
      } catch (error) {
        console.log("Error offline", error);
      }
    };
    fetchNotifications();
  }, []);

  const getLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors cursor-pointer relative z-50"; 
    return location.pathname === path 
      ? `${baseClass} bg-mora-orange text-white` 
      : `${baseClass} text-gray-400 hover:bg-white/10 hover:text-white`;
  };

  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-mora-light overflow-hidden">
      
      {/* --- OVERLAY MÓVIL --- */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-mora-dark text-white flex flex-col h-full shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          {/* LOGO DE LA EMPRESA */}
          <div className="flex items-center justify-center w-full">
              <img 
                  src="/logo-mora4.png" 
                  alt="Cerámicas Mora" 
                  className="h-12 w-auto object-contain rounded-md" // Ajusta h-12 (altura) según necesites
              />
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <XCircle size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 relative z-50">
          {/* 1. INICIO (Visible para todos) */}
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/dashboard')}>
            <LayoutGrid size={20} /> Inicio
          </Link>

          {/* 2. CATÁLOGO (Solo si NO es admin) */}
          {userRole !== 'admin' && (
              <Link to="/catalogo" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/catalogo')}>
                <BookOpen size={20} /> Catálogo
              </Link>
          )}

          {/* 3. PRESUPUESTOS (Solo si NO es admin) */}
          {userRole !== 'admin' && (
              <Link to="/presupuestos" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/presupuestos')}>
                <Calculator size={20} /> Presupuestos
              </Link>
          )}

          {/* 4. CLIENTES (Visible para todos) */}
          <Link to="/clientes" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/clientes')}>
            <Users size={20} /> Clientes
          </Link>

          {/* 5. EQUIPO/USUARIOS (Solo visible para ADMIN) */}
          {userRole === 'admin' && (
            <Link to="/usuarios" onClick={() => setIsSidebarOpen(false)} className={getLinkClass('/usuarios')}>
              <Users size={20} /> Equipo
            </Link>
          )}
        </nav>

        {/* --- BOTÓN DE SALIDA --- */}
        <div className="p-4 border-t border-gray-700 relative z-50">
          <button 
            type="button"
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
            style={{ position: 'relative', zIndex: 100 }} 
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL --- */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden w-full relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 lg:hidden p-2 hover:bg-gray-100 rounded-lg transition">
            <Menu size={24} />
          </button>

          <div className="flex-1"></div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            
            {/* NOTIFICACIONES */}
            <div className="relative">
                <button 
                    onClick={() => { setIsNotifOpen(!isNotifOpen); setIsMenuOpen(false); }}
                    className="relative p-2 text-gray-500 hover:text-gray-700 transition focus:outline-none"
                >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>

                {isNotifOpen && (
                    <>
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-700">Notificaciones</h3>
                                <span className="text-xs text-gray-400">{notifications.length} nuevas</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-400">Sin novedades</div>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <div key={idx} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition flex gap-3 items-start cursor-pointer" onClick={() => {setIsNotifOpen(false); navigate('/presupuestos');}}>
                                            <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${notif.tipo === 'ACEPTADO' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                                                {notif.tipo === 'ACEPTADO' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900 mb-0.5">{notif.clienteNombre}</p>
                                                <p className="text-xs text-gray-600 leading-snug">
                                                    Presupuesto <span className="font-mono bg-gray-100 px-1 rounded">#{notif.id}</span>
                                                    <span className={notif.tipo === 'ACEPTADO' ? ' text-green-600 font-bold' : ' text-red-600 font-bold'}>
                                                        {notif.tipo === 'ACEPTADO' ? ' APROBADO' : ' RECHAZADO'}
                                                    </span>.
                                                </p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{formatoMoneda(notif.total)}</span>
                                                    <span className="text-[10px] text-gray-400">Hace un momento</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-2 border-t border-gray-50 bg-gray-50 text-center">
                                <button onClick={() => setNotifications([])} className="text-xs text-mora-orange font-bold hover:underline">Limpiar todo</button>
                            </div>
                        </div>
                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                    </>
                )}
            </div>
            
            {/* PERFIL */}
            <div className="relative">
                <button onClick={() => { setIsMenuOpen(!isMenuOpen); setIsNotifOpen(false); }} className="h-10 w-10 rounded-full bg-orange-100 border-2 border-transparent hover:border-mora-orange overflow-hidden transition focus:outline-none flex items-center justify-center">
                   <span className="text-orange-600 font-bold text-sm">{userInitials}</span>
                </button>
                {isMenuOpen && (
                    <>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 border border-gray-100 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-xs text-gray-500 font-bold mb-1">CONECTADO COMO</p>
                                <p className="text-sm font-bold text-gray-900 truncate" title={userEmail}>{userEmail}</p>
                            </div>
                            <button onClick={() => { setIsMenuOpen(false); navigate('/perfil'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <User size={16} /> Mi Perfil
                            </button>
                            
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer z-50 relative">
                                <LogOut size={16} /> Cerrar Sesión
                            </button>
                        </div>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                    </>
                )}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 overflow-auto flex-1 bg-gray-50 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}