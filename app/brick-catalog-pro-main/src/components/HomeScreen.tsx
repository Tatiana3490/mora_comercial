import { BookOpen, Calculator, Users } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (page: string) => void;
}

interface HomeCardProps {
  icon: typeof BookOpen;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}

const HomeCard = ({ icon: Icon, title, description, onClick, color }: HomeCardProps) => (
  <button
    onClick={onClick}
    className="p-8 bg-card rounded-xl shadow-elegant border border-border hover:shadow-xl hover:scale-105 transition-smooth flex flex-col items-center text-center group"
  >
    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-smooth ${color}`}>
      <Icon className="w-10 h-10 text-white" />
    </div>
    <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </button>
);

export const HomeScreen = ({ onNavigate }: HomeScreenProps) => (
  <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
    <div className="text-center mb-12">
      <h1 className="text-5xl font-extrabold mb-4 text-foreground">Gestor de Catálogo</h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        Bienvenido al sistema de gestión de productos Cerámicas Mora. 
        Más de 4 generaciones de experiencia en la fabricación de ladrillos cerámicos.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
      <HomeCard
        icon={BookOpen}
        title="Catálogo"
        description="Ver y gestionar productos Clinker y Plaquetas"
        onClick={() => onNavigate('catalogo')}
        color="bg-primary group-hover:bg-primary/90"
      />
      <HomeCard
        icon={Calculator}
        title="Presupuestos"
        description="Crear y exportar presupuestos en PDF"
        onClick={() => onNavigate('presupuesto')}
        color="bg-accent group-hover:bg-accent/90"
      />
      <HomeCard
        icon={Users}
        title="Clientes"
        description="Gestionar lista de clientes y contactos"
        onClick={() => onNavigate('clientes')}
        color="bg-secondary group-hover:bg-secondary/90"
      />
    </div>
  </div>
);
