import { useState } from 'react';
import { UserPlus, Edit, Trash2, Mail, Phone, Building2, FileText, MapPin, Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Client, Note } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ClientesScreenProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

export const ClientesScreen = ({ clients, setClients }: ClientesScreenProps) => {
  const [formData, setFormData] = useState<Client>({ 
    id: '', 
    nombre: '', 
    email: '', 
    telefono: '', 
    empresa: '', 
    cif: '', 
    direccion: '', 
    ciudad: '', 
    codigoPostal: '', 
    notas: [] 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setClients(clients.map(client => client.id === formData.id ? formData : client));
    } else {
      setClients([...clients, { ...formData, id: `c${Date.now()}` }]);
    }
    setFormData({ id: '', nombre: '', email: '', telefono: '', empresa: '', cif: '', direccion: '', ciudad: '', codigoPostal: '', notas: [] });
    setIsEditing(false);
    setNewNote('');
    setIsFormOpen(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n${Date.now()}`,
      texto: newNote,
      fecha: new Date().toISOString()
    };
    setFormData(prev => ({ ...prev, notas: [note, ...prev.notas] }));
    setNewNote('');
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setIsEditing(true);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };

  const handleCancel = () => {
    setFormData({ id: '', nombre: '', email: '', telefono: '', empresa: '', cif: '', direccion: '', ciudad: '', codigoPostal: '', notas: [] });
    setIsEditing(false);
    setNewNote('');
    setIsFormOpen(false);
  };

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-foreground">Gestión de Clientes</h2>
        {!isFormOpen && (
          <Button onClick={() => setIsFormOpen(true)} size="lg">
            <UserPlus className="w-5 h-5 mr-2" />
            Añadir Nuevo Cliente
          </Button>
        )}
      </div>
      
      {/* Form Collapsible */}
      <Collapsible open={isFormOpen} onOpenChange={setIsFormOpen} className="mb-8">
        <CollapsibleContent>
          <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl shadow-lg border border-border animate-accordion-down">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              {isEditing ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
            </h3>
        
        {/* Datos personales */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Datos del Contacto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Contacto *</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="600 123 456"
                value={formData.telefono}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Datos de la empresa */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Datos de la Empresa
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empresa">Nombre de la Empresa *</Label>
              <Input
                id="empresa"
                name="empresa"
                placeholder="Nombre de la empresa"
                value={formData.empresa}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cif">CIF/NIF</Label>
              <Input
                id="cif"
                name="cif"
                placeholder="B12345678"
                value={formData.cif}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                placeholder="Calle, número, piso..."
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                name="ciudad"
                placeholder="Ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigoPostal">Código Postal</Label>
              <Input
                id="codigoPostal"
                name="codigoPostal"
                placeholder="28001"
                value={formData.codigoPostal}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Sección de notas */}
        {isEditing && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notas del Cliente
            </h4>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Añadir una nueva nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
                <Button type="button" onClick={handleAddNote} size="sm" className="self-start">
                  <Plus className="w-4 h-4 mr-1" />
                  Añadir
                </Button>
              </div>
              {formData.notas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Histórico de Notas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-3">
                        {formData.notas.map(note => (
                          <div key={note.id} className="border-l-2 border-primary pl-3 py-2">
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(note.fecha).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-sm text-foreground">{note.texto}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

            <div className="flex gap-4">
              <Button type="submit">
                {isEditing ? (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Añadir Cliente
                  </>
                )}
              </Button>
              <Button type="button" onClick={handleCancel} variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CollapsibleContent>
      </Collapsible>

      {/* List */}
      <div className="flex-grow overflow-y-auto bg-card p-6 rounded-xl shadow-lg border border-border">
        <h3 className="text-2xl font-bold text-foreground mb-6">
          Todos los Clientes ({clients.length})
        </h3>
        <div className="space-y-4">
          {clients.length > 0 ? clients.map(client => (
            <Card key={client.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="font-bold text-lg text-foreground">{client.nombre}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {client.empresa}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.telefono}
                      </span>
                      {client.direccion && (
                        <span className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="w-4 h-4" />
                          {client.direccion}, {client.ciudad} {client.codigoPostal}
                        </span>
                      )}
                    </div>

                    {client.notas.length > 0 && (
                      <Collapsible 
                        open={expandedClientId === client.id}
                        onOpenChange={(isOpen) => setExpandedClientId(isOpen ? client.id : null)}
                        className="mt-3"
                      >
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                <FileText className="w-3 h-3" />
                                Última nota ({new Date(client.notas[0].fecha).toLocaleDateString('es-ES')})
                              </p>
                              <p className="text-sm text-foreground">{client.notas[0].texto}</p>
                            </div>
                            {client.notas.length > 1 && (
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="ml-2">
                                  {expandedClientId === client.id ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            )}
                          </div>
                          
                          {client.notas.length > 1 && (
                            <CollapsibleContent className="mt-3">
                              <div className="border-t border-border pt-3 space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  Histórico de notas ({client.notas.length})
                                </p>
                                <ScrollArea className="h-[150px]">
                                  <div className="space-y-2 pr-4">
                                    {client.notas.slice(1).map(note => (
                                      <div key={note.id} className="border-l-2 border-primary/50 pl-3 py-1">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                          <Calendar className="w-3 h-3" />
                                          {new Date(note.fecha).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </p>
                                        <p className="text-xs text-foreground">{note.texto}</p>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            </CollapsibleContent>
                          )}
                        </div>
                      </Collapsible>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(client)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(client.id)} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <p className="text-center text-muted-foreground py-12">
              No hay clientes registrados. Añada uno para empezar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
