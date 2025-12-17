import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // 🔔 IMPORTANTE: Importamos el Toaster

import Layout from './components/Layout';

// IMPORTAMOS LAS PÁGINAS
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog'; 
import Clients from './pages/Clients';
import Quotes from './pages/Quotes';
import Profile from './pages/Profile';
import Users from './pages/Users';

// 1. COMPONENTE DE PROTECCIÓN (El Portero)
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      {/* 2. CONFIGURACIÓN DE LAS NOTIFICACIONES (TOASTER) */}
      {/* Esto permite que los mensajes salgan encima de todo */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/login" element={<Login />} />

        {/* RUTAS PROTEGIDAS */}
        <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/catalogo" element={<Catalog />} /> 
                <Route path="/presupuestos" element={<Quotes />} />
                <Route path="/clientes" element={<Clients />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="usuarios" element={<Users />} />
                <Route path="/presupuestos/editar/:id" element={<Quotes />} />
            </Route>
        </Route>

        {/* CUALQUIER OTRA RUTA */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;