import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { clientService, type Client } from '@/services/clientService';
import { quoteService, type Presupuesto, type PresupuestoCreate } from '@/services/quoteService';
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  Users,
  Search,
  Plus,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Filter,
  FileText,
  TrendingUp,
  Package,
// UI components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/* =========================
  Trash2,
  Menu,
  X,
  Loader2,
  Box,
  Mail,
  Phone,
  MapPin,
  ClipboardList
} from 'lucide-react';

/* =========================
   CONSTANTES Y HELPERS
   ========================= */

// ID de usuario hardcoded para desarrollo (en producción vendría de autenticación)
const CURRENT_USER_ID = 1;

// Mapear cliente del backend al formato UI
const mapClientToUI = (client: Client) => ({
  id: client.id_cliente,
  name: client.nombre,
  company: client.nombre, // Backend no tiene campo company separado
  email: client.correo || '',
  phone: '', // Backend no tiene teléfono
  street: client.direccion || '',
  city: client.provincia || '',
  zip: '',
  note: '',
  last_note: ''
});

// Mapear presupuesto del backend al formato UI
const mapQuoteToUI = (quote: Presupuesto, clients: Client[]) => {
  const client = clients.find(c => c.id_cliente === quote.id_cliente);
  return {
    id: `QT-${quote.id_presupuesto}`,
    client_name: client?.nombre || 'Cliente desconocido',
    client_id: quote.id_cliente,
    amount: quote.total_neto,
    date: new Date(quote.fecha_presupuesto).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: quote.estado === 'APROBADO' ? 'Aprobado' : quote.estado === 'ENVIADO_ADMIN' ? 'Pendiente' : 'Borrador'
  };
};

/* =========================
   COMPONENTES PEQUEÑOS
   ========================= */

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth group
      ${active
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
  >
    <Icon size={20} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
    {!collapsed && <span className="font-medium text-sm tracking-wide">{label}</span>}
    {!collapsed && active && <ChevronRight size={16} className="ml-auto opacity-60" />}
  </button>
);

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white gradient-card p-6 rounded-2xl border border-slate-100 shadow-elegant hover:shadow-lg transition-smooth">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}
      >
        {trend >= 0 ? '+' : ''}
        {trend}%
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const ProductCard = ({ product, onAdd }: any) => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-smooth group flex flex-col h-full">
    {/* Parte superior: imagen o textura */}
    <div className="h-40 relative overflow-hidden bg-slate-50">
      {/* Si hay imagen, mostrarla */}
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <>
          {/* Fondo: color o gradiente (fallback si no hay imagen) */}
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
            style={{
              backgroundColor: product.color?.includes('gradient') ? undefined : product.color || '#f4f4f5',
              backgroundImage: product.color?.includes('gradient') ? product.color : undefined
            }}
          />
          {/* Texturas sencillas para imitar el diseño */}
          {product.texture === 'dots' && (
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}
            />
          )}
          {product.texture === 'lines' && (
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, rgba(15,23,42,0.10) 0, rgba(15,23,42,0.10) 1px, transparent 0, transparent 8px)'
              }}
            />
          )}
        </>
      )}

      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[11px] font-semibold text-slate-700 shadow-sm">
        {product.category}
      </div>
    </div>

    {/* Parte inferior: info producto */}
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="font-bold text-base text-slate-900 mb-1 group-hover:text-orange-600 transition-smooth">
        {product.name}
      </h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{product.description}</p>

      <div className="flex items-center gap-2 mb-4 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-2 rounded-lg w-fit">
        <Box size={14} className="text-slate-400" />
        Stock: {product.stock?.toLocaleString('es-ES') ?? 0} uds
      </div>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <span className="text-2xl font-bold text-slate-900">
            €{product.price?.toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 ml-1">/ud</span>
        </div>
        <button
          onClick={() => onAdd(product)}
          className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-orange-500 transition-smooth shadow-lg shadow-slate-900/10 hover:shadow-orange-500/30"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  </div>
);

const ClientListItem = ({ client }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-elegant hover:shadow-lg transition-smooth mb-4 flex justify-between items-start">
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-orange-500 rounded-lg transition-smooth">
            <Settings size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-smooth">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-600 font-medium mb-3">{client.company}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-orange-500" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-orange-500" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-start gap-2 col-span-full">
          <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
          <span>
            {client.street}, {client.city} {client.zip}
          </span>
        </div>
      </div>

      {client.note && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg text-sm text-blue-800">
          <div className="font-semibold flex items-center gap-2">
            <ClipboardList size={16} /> Última nota ({client.last_note}):
          </div>
          <p className="mt-1">{client.note}</p>
        </div>
      )}
    </div>
  </div>
);

/* =========================
   COMPONENTE PRINCIPAL
   ========================= */

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalogo' | 'presupuestos' | 'clientes'>('dashboard');
  const [cart, setCart] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  // Modal para confirmar precio al añadir producto
  const [productToConfirm, setProductToConfirm] = useState<any | null>(null);
  const [confirmPrice, setConfirmPrice] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  // Productos desde la API
  const { data: backendProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getProducts
  });

  // Clientes desde la API
  const { data: backendClients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getClients
  });

  // Presupuestos desde la API
  const { data: backendQuotes = [], isLoading: isLoadingQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quoteService.getQuotes()
  });

  // Mapeo de productos de backend -> UI
  const products = backendProducts.map((p: any) => ({
    id: p.id,
    name: p.nombre,
    category: p.categoria,
    price: p.precio,
    stock: p.stock,
    color: p.color || '#f4f4f5',
    texture: 'dots',
    description: p.descripcion,
    image: p.imagenes && p.imagenes.length > 0 ? p.imagenes[0] : null,
    imagenes: p.imagenes || [],
    rating: p.rating || 4.5
  }));

  // Mapeo de clientes de backend -> UI
  const clients = backendClients.map(mapClientToUI);

  // Mapeo de presupuestos de backend -> UI
  const quotes = backendQuotes.map(q => mapQuoteToUI(q, backendClients));

  // Mutations para crear clientes y presupuestos
  const createClientMutation = useMutation({
    mutationFn: clientService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowClientModal(false);
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: quoteService.createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setCart([]);
      setSelectedClientId(null);
      setActiveTab('dashboard');
    },
  });

  // Responsivo (sidebar colapsable)
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Producto destacado (dashboard)
  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      setIsLoadingFeatured(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        if (products.length > 0) {
          const randomFeatured = products[Math.floor(Math.random() * products.length)];
          setFeaturedProduct(randomFeatured);
        }
      } catch (error) {
        console.error('Error cargando producto destacado:', error);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    if (activeTab === 'dashboard' && products.length > 0) {
      fetchFeaturedProduct();
    }
  }, [activeTab, products.length]);

  /* ===== Carrito / Presupuesto ===== */

  // Al añadir producto desde catálogo, abrimos modal para confirmar precio
  const addToCart = (product: any) => {
    setProductToConfirm(product);
    setConfirmPrice(product.price ?? 0);
    setIsConfirmOpen(true);
  };

  const confirmAddToCart = (product: any, price: number) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => (p.id === product.id ? { ...p, quantity: p.quantity + 100, price } : p));
      }
      return [...prev, { ...product, quantity: 100, price }];
    });
    // Cerrar modal
    setIsConfirmOpen(false);
    setProductToConfirm(null);
  };

  const updateCartQuantity = (id: any, quantity: any) => {
    const newQuantity = Math.max(0, parseInt(quantity) || 0);
    setCart(prev => {
      if (newQuantity === 0) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(p => (p.id === id ? { ...p, quantity: newQuantity } : p));
    });
  };

  const removeFromCart = (id: any) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

    const updateCartPrice = (id: any, newPrice: any) => {
      const price = Math.max(0, parseFloat(newPrice) || 0);
      setCart(prev => prev.map(p => (p.id === id ? { ...p, price } : p)));
    };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartIVA = cartTotal * 0.21;
  const cartTotalFinal = cartTotal + cartIVA;

  /* ===== Handlers para botones ===== */

  const handleSaveQuote = async () => {
    if (!selectedClientId) {
      alert('Por favor selecciona un cliente');
      return;
    }
    if (cart.length === 0) {
      alert('Por favor añade productos al presupuesto');
      return;
    }

    try {
      const quoteData: PresupuestoCreate = {
        id_cliente: selectedClientId,
        id_comercial_creador: CURRENT_USER_ID,
        estado: 'BORRADOR',
        precio_palet: 0,
        lineas: cart.map(item => ({
          articulo_id: item.id,
          cantidad_m2: item.quantity, // Convertir unidades a m2 (simplificado)
          precio_m2: item.price,
          descuento_pct: 0,
          descripcion_articulo: item.name
        }))
      };

      await createQuoteMutation.mutateAsync(quoteData);
      alert('Presupuesto guardado exitosamente');
    } catch (error) {
      console.error('Error guardando presupuesto:', error);
      alert('Error al guardar el presupuesto');
    }
  };

  const handleGeneratePDF = () => {
    // TODO: Implementar generación de PDF
    alert('Funcionalidad de PDF en desarrollo');
  };

  const handleAddClient = () => {
    setShowClientModal(true);
  };

  /* =========================
     VISTAS
     ========================= */

  const DashboardView = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Buenos días, Alex</h2>
          <p className="text-slate-500 mt-1">Aquí tienes el resumen de hoy en Cerámicas Mora.</p>
        </div>
        <button
          onClick={() => setActiveTab('presupuestos')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/40 transition-smooth flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Ventas Mensuales" value="€24,500" trend={12} icon={TrendingUp} color="bg-emerald-600" />
        <StatCard title="Presupuestos Activos" value="18" trend={5} icon={FileText} color="bg-blue-600" />
        <StatCard title="Nuevos Clientes" value="4" trend={-2} icon={Users} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Presupuestos recientes */}
        <div className="bg-white rounded-2xl p-6 shadow-elegant border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900">Presupuestos Recientes</h3>
            <button className="text-orange-500 text-sm font-medium hover:underline">Ver todos</button>
          </div>
          <div className="space-y-4">
            {isLoadingQuotes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : quotes.length > 0 ? (
              quotes.slice(0, 3).map(quote => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 text-slate-400 font-bold">
                      {quote.client_name.substring(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{quote.client_name}</h4>
                      <p className="text-xs text-slate-500">
                        {quote.id} • {quote.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      €
                      {quote.amount.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${quote.status === 'Aprobado'
                        ? 'bg-emerald-100 text-emerald-700'
                        : quote.status === 'Pendiente'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">No hay presupuestos recientes</p>
            )}
          </div>
        </div>

        {/* Producto destacado */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden min-h-[260px] flex flex-col justify-center shadow-xl shadow-slate-900/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full blur-3xl -mr-20 -mt-20" />
          <h3 className="font-bold text-lg mb-4 relative z-10">Producto Destacado / Novedad</h3>

          {isLoadingFeatured ? (
            <div className="flex flex-col items-center justify-center h-full relative z-10 text-slate-400 gap-3">
              <Loader2 className="animate-spin text-orange-400" size={32} />
              <span className="text-sm">Analizando catálogo...</span>
            </div>
          ) : featuredProduct ? (
            <div className="flex gap-6 relative z-10 animate-fade-in">
              <div className="w-1/3 bg-slate-800 rounded-xl h-32 overflow-hidden relative shadow-lg">
                <div
                  className="absolute inset-0 opacity-90"
                  style={{
                    backgroundColor: featuredProduct.color?.includes('gradient') ? undefined : featuredProduct.color,
                    backgroundImage: featuredProduct.color?.includes('gradient') ? featuredProduct.color : undefined
                  }}
                />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '10px 10px' }}
                />
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  RECOMENDADO
                </div>
              </div>
              <div className="w-2/3 flex flex-col justify-center">
                <h4 className="text-xl font-bold mb-1 uppercase">{featuredProduct.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-800 text-slate-100 text-xs px-2 py-0.5 rounded-md">
                    {featuredProduct.category}
                  </span>
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Box size={12} /> Stock: {featuredProduct.stock} uds
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {featuredProduct.description?.split('.')[0]}.
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <span className="text-2xl font-bold text-orange-400">
                    €{featuredProduct.price?.toFixed(2)}
                    <span className="text-sm text-slate-400 font-normal ml-1">/ud</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('catalogo')}
                    className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-200 transition-smooth"
                  >
                    Ver Stock
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 relative z-10">No hay recomendaciones disponibles hoy.</div>
          )}
        </div>
      </div>
    </div >
  );

  const CatalogView = () => {
    const categories = ['Todos', ...new Set(products.map((p: any) => p.category))];
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    const filteredProducts =
      selectedCategory === 'Todos' ? products : products.filter((p: any) => p.category === selectedCategory);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Catálogo de Productos</h2>
            <p className="text-slate-500 mt-1">{products.length} artículos disponibles.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-orange-500 hover:border-orange-500 transition-smooth">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-smooth
                ${selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoadingProducts ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const QuotesView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full lg:h-[calc(100vh-140px)] animate-fade-in">
      {/* Columna izquierda: crear presupuesto */}
      <div className="lg:col-span-2 flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-elegant overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Crear Presupuesto</h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select
                value={selectedClientId || ''}
                onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-white border border-slate-300 rounded-lg text-sm py-2.5 px-4 text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">-- Seleccionar un Cliente --</option>
                {isLoadingClients ? (
                  <option disabled>Cargando clientes...</option>
                ) : (
                  clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company && `(${c.company})`}
                    </option>
                  ))
                )}
              </select>
            </div>
            <button
              onClick={handleGeneratePDF}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-orange-500/40 transition-smooth"
            >
              Generar PDF
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Líneas de Presupuesto ({cart.length})</h3>

          <div className="flex justify-end mb-4">
            <button
              onClick={() => setActiveTab('catalogo')}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-orange-500 transition-smooth"
            >
              <Plus size={18} /> Añadir Producto
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-100 rounded-lg">
                <tr>
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase">Producto</th>
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase">Categoría</th>
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">Precio Unit.</th>
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center w-24">Cantidad</th>
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">Subtotal</th>
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center w-16">Acción</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                      No hay productos en el Presupuesto. Añada productos para comenzar.
                    </td>
                  </tr>
                ) : (
                  cart.map(item => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-smooth text-sm"
                    >
                      <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-3 text-slate-600">{item.category}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">€</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price.toFixed(2)}
                              onChange={e => updateCartPrice(item.id, e.target.value)}
                              className="w-24 text-right border border-slate-300 rounded-md py-1 px-2 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            />
                          </div>
                        </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={e => updateCartQuantity(item.id, e.target.value)}
                          className="w-full max-w-[80px] text-center border border-slate-300 rounded-md py-1 text-sm focus:ring-1 focus:ring-orange-500"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        €{(item.price * item.quantity).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-full transition-smooth"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Columna derecha: totales */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 flex flex-col shadow-2xl shadow-slate-900/40">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <ClipboardList size={20} className="text-orange-400" />
          Resumen de Totales
        </h3>

        <div className="flex-1 space-y-3 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>Base Imponible</span>
            <span>€{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>IVA (21%)</span>
            <span>€{cartIVA.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Gastos de Envío (Mock)</span>
            <span>€50.00</span>
          </div>
          <div className="flex justify-between text-xl font-extrabold text-white pt-4 border-t border-slate-700 mt-2">
            <span>TOTAL PRESUPUESTO</span>
            <span>€{(cartTotalFinal + 50).toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleSaveQuote}
          disabled={createQuoteMutation.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl mt-8 shadow-lg shadow-orange-500/40 transition-smooth active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createQuoteMutation.isPending ? 'Guardando...' : 'Guardar y Enviar'}
        </button>
      </div>
    </div>
  );

  const ClientsView = () => (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Gestión de Clientes</h2>
          <p className="text-slate-500 mt-1">Todos los Clientes ({clients.length})</p>
        </div>
        <button
          onClick={handleAddClient}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-orange-600 transition-smooth shadow-lg shadow-orange-500/30"
        >
          <Plus size={18} /> Añadir Nuevo Cliente
        </button>
      </div>

      <div className="space-y-4">
        {isLoadingClients ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={48} />
          </div>
        ) : clients.length > 0 ? (
          clients.map(client => (
            <ClientListItem key={client.id} client={client} />
          ))
        ) : (
          <p className="text-center text-slate-500 py-12">No hay clientes registrados</p>
        )}
      </div>
    </div>
  );

  /* =========================
     LAYOUT GENERAL
     ========================= */

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Overlay móvil */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-slate-950 text-white flex flex-col z-50 transition-smooth
          ${isMobile ? 'fixed inset-y-0 left-0 w-64' : 'relative'}
          ${!isMobile && !isSidebarOpen ? 'w-20' : 'w-72'}
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/60">
            <Package size={22} className="text-white" />
          </div>
          {(!isMobile && !isSidebarOpen) ? null : (
            <div>
              <h1 className="font-bold text-lg leading-tight">Cerámicas</h1>
              <span className="text-orange-400 font-bold text-lg leading-tight">Mora</span>
            </div>
          )}
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} className="ml-auto text-slate-400">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menú */}
        <nav className="flex-1 px-3 space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            label="Inicio"
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            collapsed={!isMobile && !isSidebarOpen}
          />
          <SidebarItem
            icon={BookOpen}
            label="Catálogo"
            active={activeTab === 'catalogo'}
            onClick={() => setActiveTab('catalogo')}
            collapsed={!isMobile && !isSidebarOpen}
          />
          <SidebarItem
            icon={Calculator}
            label="Presupuestos"
            active={activeTab === 'presupuestos'}
            onClick={() => setActiveTab('presupuestos')}
            collapsed={!isMobile && !isSidebarOpen}
          />
          <SidebarItem
            icon={Users}
            label="Clientes"
            active={activeTab === 'clientes'}
            onClick={() => setActiveTab('clientes')}
            collapsed={!isMobile && !isSidebarOpen}
          />
        </nav>

        {/* Cerrar sesión */}
        <div className="p-4 border-t border-slate-800">
          <button
            className={`flex items-center gap-3 text-slate-400 hover:text-white transition-smooth w-full ${!isMobile && !isSidebarOpen ? 'justify-center' : ''
              }`}
          >
            <LogOut size={20} />
            {(!isMobile && !isSidebarOpen) ? null : <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-smooth"
            >
              <Menu size={20} />
            </button>
            {isMobile && <span className="font-bold text-slate-900">Cerámicas Mora</span>}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 relative text-slate-400 hover:text-slate-600 transition-smooth">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white" />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" />
            </div>
          </div>
        </header>

        {/* Área de contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'catalogo' && <CatalogView />}
            {activeTab === 'presupuestos' && <QuotesView />}
            {activeTab === 'clientes' && <ClientsView />}
          </div>

          {/* Dialog: Confirmar precio al añadir producto desde catálogo */}
          <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar precio</DialogTitle>
                <DialogDescription>Revisa el precio antes de añadir el producto al presupuesto.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex gap-4">
                {productToConfirm?.image ? (
                  <img src={productToConfirm.image} alt={productToConfirm.name} className="w-28 h-28 object-cover rounded-md" />
                ) : (
                  <div className="w-28 h-28 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">No image</div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{productToConfirm?.name}</h3>
                  <p className="text-sm text-slate-600 my-2">{productToConfirm?.description}</p>

                  <label className="text-xs text-slate-500">Precio por unidad (€)</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={confirmPrice}
                      onChange={(e) => setConfirmPrice(parseFloat(e.target.value || '0'))}
                      className="w-32 text-right border border-slate-300 rounded-md py-1 px-2 text-sm focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <div className="flex gap-2 ml-auto">
                  <Button variant="ghost" onClick={() => { setIsConfirmOpen(false); setProductToConfirm(null); }}>Cancelar</Button>
                  <Button onClick={() => confirmAddToCart(productToConfirm, confirmPrice)}>Confirmar y añadir</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default Index;

