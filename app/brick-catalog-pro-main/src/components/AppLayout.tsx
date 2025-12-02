import { ReactNode } from 'react';
import { Home, BookOpen, Calculator, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  activePage: string;
  setPage: (page: string) => void;
  children: ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'catalogo', label: 'Catálogo', icon: BookOpen },
  { id: 'presupuesto', label: 'Presupuestos', icon: Calculator },
  { id: 'clientes', label: 'Clientes', icon: Users },
];

export const AppLayout = ({ activePage, setPage, children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen w-full font-sans bg-background">
      {/* Sidebar */}
      <nav className="w-64 h-full flex-shrink-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center justify-center h-20 border-b border-sidebar-border">
          <FileText className="w-8 h-8 text-sidebar-foreground" />
          <span className="ml-3 text-xl font-bold text-sidebar-foreground">Cerámicas Mora</span>
        </div>
        <ul className="py-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id} className="px-4">
                <button
                  onClick={() => setPage(item.id)}
                  className={cn(
                    "w-full flex items-center p-3 my-1 rounded-lg transition-smooth",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="ml-4 font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
