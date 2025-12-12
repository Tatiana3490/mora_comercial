import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';

// IMPORTAMOS LAS PÁGINAS
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog'; 
import Clients from './pages/Clients';
import Quotes from './pages/Quotes';

// 1. COMPONENTE DE PROTECCIÓN (El Portero)
// Este componente verifica si tienes la llave antes de dejarte pasar
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // Si no hay token, te manda a la sala de espera (/login)
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Si hay token, te deja pasar a las rutas hijas (Outlet)
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: El Login ahora vive en /login */}
        <Route path="/login" element={<Login />} />

        {/* RUTAS PROTEGIDAS: Todo lo que esté aquí dentro requiere Token */}
        <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
                {/* Si entras a la raíz /, te mandamos al dashboard automáticamente */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/catalogo" element={<Catalog />} /> 
                <Route path="/presupuestos" element={<Quotes />} />
                <Route path="/clientes" element={<Clients />} />
            </Route>
        </Route>

        {/* CUALQUIER OTRA RUTA: Te manda al Dashboard (o al login si no hay token) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;