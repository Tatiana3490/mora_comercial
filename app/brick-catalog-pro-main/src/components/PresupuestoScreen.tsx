import { useState } from 'react';
import { Plus, Trash, FileDown } from 'lucide-react';
import { Product, Client } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BudgetItem extends Product {
  cantidad: number;
}

interface PresupuestoScreenProps {
  budgetItems: BudgetItem[];
  setBudgetItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  clients: Client[];
  products: Product[];
  setMessage: (msg: { text: string; type: 'success' | 'error' }) => void;
}

export const PresupuestoScreen = ({ 
  budgetItems, 
  setBudgetItems, 
  clients, 
  products, 
  setMessage 
}: PresupuestoScreenProps) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const qty = parseInt(newQuantity.toString(), 10);
    if (qty > 0) {
      setBudgetItems(budgetItems.map(item => item.id === id ? { ...item, cantidad: qty } : item));
    }
  };

  const handleRemoveItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };
  
  const handleAddProduct = (product: Product) => {
    setBudgetItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, cantidad: 1 }];
      }
    });
    setShowAddProduct(false);
  };

  const total = budgetItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const handleGeneratePDF = () => {
    if (budgetItems.length === 0) {
      setMessage({ text: 'Añade productos al presupuesto antes de generar el PDF.', type: 'error' });
      return;
    }

    const doc = new jsPDF();
    const selectedClient = clients.find(c => c.id === selectedClientId);
    const pageWidth = doc.internal.pageSize.getWidth();

    // ========== HEADER - Cerámicas Mora ==========
    // Línea superior decorativa
    doc.setDrawColor(183, 71, 42);
    doc.setLineWidth(2);
    doc.line(14, 15, pageWidth - 14, 15);

    // Título principal
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(183, 71, 42);
    doc.text("CERÁMICAS MORA", pageWidth / 2, 25, { align: 'center' });

    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text("Presupuesto de Materiales", pageWidth / 2, 32, { align: 'center' });

    // Fecha y número de presupuesto
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const today = new Date();
    const fechaFormateada = today.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const numeroPpto = `PPTO-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    doc.text(`Fecha: ${fechaFormateada}`, 14, 42);
    doc.text(`Nº: ${numeroPpto}`, pageWidth - 14, 42, { align: 'right' });

    // ========== INFORMACIÓN DEL CLIENTE ==========
    let currentY = 52;
    
    if (selectedClient) {
      // Rectángulo de fondo para cliente
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(38, 38, 38);
      doc.text("DATOS DEL CLIENTE", 18, currentY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Cliente: ${selectedClient.nombre}`, 18, currentY + 13);
      doc.text(`Email: ${selectedClient.email}`, 18, currentY + 19);
      doc.text(`Teléfono: ${selectedClient.telefono}`, 18, currentY + 25);
      
      currentY += 35;
    } else {
      currentY += 5;
    }

    // ========== TABLA DE PRODUCTOS ==========
    const tableColumn = ["Producto", "Categoría", "P. Unit.", "Cant.", "Subtotal"];
    const tableRows = budgetItems.map(item => [
      item.nombre,
      item.categoria,
      `${item.precio.toFixed(2)}€`,
      item.cantidad.toString(),
      `${(item.precio * item.cantidad).toFixed(2)}€`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [tableColumn],
      body: tableRows,
      headStyles: { 
        fillColor: [183, 71, 42],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [40, 40, 40]
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: {
        0: { cellWidth: 70, halign: 'left' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      },
      theme: 'grid',
      margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || currentY;

    // ========== RESUMEN Y TOTAL ==========
    const summaryY = finalY + 10;
    const summaryX = pageWidth - 75;
    const valueX = pageWidth - 14;
    
    // Base Imponible (Subtotal)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text("Base Imponible:", summaryX, summaryY);
    doc.text(`${total.toFixed(2)}€`, valueX, summaryY, { align: 'right' });

    // IVA (21%)
    const iva = total * 0.21;
    doc.text("IVA (21%):", summaryX, summaryY + 6);
    doc.text(`${iva.toFixed(2)}€`, valueX, summaryY + 6, { align: 'right' });

    // IRPF (15% - retención)
    const irpf = total * 0.15;
    doc.text("IRPF (15%):", summaryX, summaryY + 12);
    doc.text(`-${irpf.toFixed(2)}€`, valueX, summaryY + 12, { align: 'right' });

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(summaryX - 5, summaryY + 16, valueX, summaryY + 16);

    // TOTAL A PAGAR - con fondo destacado
    const totalFinal = total + iva - irpf;
    const totalBoxY = summaryY + 20;
    
    // Rectángulo de fondo para el total
    doc.setFillColor(183, 71, 42);
    doc.roundedRect(summaryX - 5, totalBoxY - 5, 80, 10, 1, 1, 'F');
    
    // Texto del total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL A PAGAR:", summaryX, totalBoxY + 2);
    doc.text(`${totalFinal.toFixed(2)}€`, valueX - 2, totalBoxY + 2, { align: 'right' });

    // ========== FOOTER ==========
    const footerY = doc.internal.pageSize.getHeight() - 25;
    
    // Línea decorativa
    doc.setDrawColor(183, 71, 42);
    doc.setLineWidth(0.5);
    doc.line(14, footerY, pageWidth - 14, footerY);

    // Información de contacto
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text("Cerámicas Mora | Tel: +34 XXX XXX XXX | Email: info@ceramicasmora.es", pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text("www.ceramicasmora.es | Fabricantes de ladrillos y plaquetas de alta calidad", pageWidth / 2, footerY + 10, { align: 'center' });

    // Notas legales
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("Presupuesto válido por 30 días. Precios sujetos a disponibilidad de stock.", pageWidth / 2, footerY + 16, { align: 'center' });

    // ========== GUARDAR PDF ==========
    const nombreArchivo = `presupuesto_${selectedClient ? selectedClient.nombre.replace(/\s/g, '_').toLowerCase() : 'general'}_${today.toISOString().split('T')[0]}.pdf`;
    doc.save(nombreArchivo);
    
    setMessage({ text: '✓ PDF generado correctamente', type: 'success' });
  };

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in">
      <h2 className="text-4xl font-extrabold text-foreground mb-6">Crear Presupuesto</h2>

      {/* Header */}
      <div className="bg-card p-6 rounded-xl shadow-lg border border-border mb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Cliente</label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="-- Seleccionar un Cliente --" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            onClick={handleGeneratePDF}
            disabled={budgetItems.length === 0}
            size="lg"
            className="md:self-end"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Generar PDF
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-grow overflow-y-auto bg-card p-6 rounded-xl shadow-lg border border-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-foreground">Líneas de Presupuesto</h3>
          <Button onClick={() => setShowAddProduct(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Añadir Producto
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-semibold text-foreground">Producto</th>
                <th className="text-left p-3 font-semibold text-foreground">Categoría</th>
                <th className="text-left p-3 font-semibold text-foreground">Precio Unit.</th>
                <th className="text-left p-3 font-semibold text-foreground w-32">Cantidad</th>
                <th className="text-left p-3 font-semibold text-foreground">Subtotal</th>
                <th className="text-right p-3 font-semibold text-foreground w-20">Acción</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.length > 0 ? budgetItems.map(item => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3 font-medium text-foreground">{item.nombre}</td>
                  <td className="p-3 text-muted-foreground">{item.categoria}</td>
                  <td className="p-3 text-foreground">€{item.precio.toFixed(2)}</td>
                  <td className="p-3">
                    <Input 
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-24"
                      min="1"
                    />
                  </td>
                  <td className="p-3 font-semibold text-foreground">€{(item.precio * item.cantidad).toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <Button 
                      onClick={() => handleRemoveItem(item.id)} 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-muted-foreground">
                    No hay productos en el presupuesto. Añada productos para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {budgetItems.length > 0 && (
          <div className="flex justify-end mt-8 pt-6 border-t border-border">
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-2">Total del Presupuesto</p>
              <h3 className="text-4xl font-bold text-primary">€{total.toFixed(2)}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seleccionar Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {products.map(product => (
              <div key={product.id} className="flex justify-between items-center p-4 border border-border rounded-lg hover:bg-muted/50">
                <div>
                  <p className="font-semibold text-foreground">{product.nombre}</p>
                  <p className="text-sm text-muted-foreground">{product.categoria} • €{product.precio.toFixed(2)}</p>
                </div>
                <Button onClick={() => handleAddProduct(product)} size="sm">
                  Añadir
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
