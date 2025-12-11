import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

// IMPORTAMOS LAS PÁGINAS REALES
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog'; 
import Clients from './pages/Clients';
import Quotes from './pages/Quotes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalogo" element={<Catalog />} /> 
          <Route path="/presupuestos" element={<Quotes />} />
          <Route path="/clientes" element={<Clients />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;