// Service for quote (presupuesto) API operations

const API_URL = '/api/v1';

export interface PresupuestoLinea {
    id_linea?: number;
    id_presupuesto?: number;
    articulo_id: string;
    cantidad_m2: number;
    precio_m2: number;
    descuento_pct: number;
    descripcion_articulo?: string;
}

export interface PresupuestoLineaCreate {
    articulo_id: string;
    cantidad_m2: number;
    precio_m2: number;
    descuento_pct: number;
    descripcion_articulo?: string;
}

export interface Presupuesto {
    id_presupuesto: number;
    numero_presupuesto?: string;
    fecha_presupuesto: string;
    lugar_suministro?: string;
    persona_contacto?: string;
    estado: string;
    fecha_revision?: string;
    motivo_denegacion?: string;
    forma_pago?: string;
    validez_dias?: number;
    precio_palet: number;
    condiciones_camion?: string;
    condiciones_descarga?: string;
    condiciones_impuestos?: string;
    observaciones?: string;
    id_cliente: number;
    id_comercial_creador: number;
    id_admin_revisor?: number;
    lineas: PresupuestoLinea[];
    total_bruto: number;
    total_descuento: number;
    total_neto: number;
}

export interface PresupuestoCreate {
    numero_presupuesto?: string;
    fecha_presupuesto?: string;
    lugar_suministro?: string;
    persona_contacto?: string;
    estado?: string;
    forma_pago?: string;
    validez_dias?: number;
    precio_palet?: number;
    condiciones_camion?: string;
    condiciones_descarga?: string;
    condiciones_impuestos?: string;
    observaciones?: string;
    id_cliente: number;
    id_comercial_creador: number;
    lineas: PresupuestoLineaCreate[];
}

export interface PresupuestoUpdate {
    numero_presupuesto?: string;
    fecha_presupuesto?: string;
    lugar_suministro?: string;
    persona_contacto?: string;
    estado?: string;
    fecha_revision?: string;
    motivo_denegacion?: string;
    forma_pago?: string;
    validez_dias?: number;
    precio_palet?: number;
    condiciones_camion?: string;
    condiciones_descarga?: string;
    condiciones_impuestos?: string;
    observaciones?: string;
    id_cliente?: number;
    id_comercial_creador?: number;
    id_admin_revisor?: number;
}

export const quoteService = {
    /**
     * Get all quotes (presupuestos)
     */
    async getQuotes(skip = 0, limit = 100): Promise<Presupuesto[]> {
        const response = await fetch(`${API_URL}/presupuestos/?skip=${skip}&limit=${limit}`);
        if (!response.ok) {
            throw new Error('Error fetching quotes');
        }
        return response.json();
    },

    /**
     * Get a single quote by ID
     */
    async getQuoteById(id: number): Promise<Presupuesto> {
        const response = await fetch(`${API_URL}/presupuestos/${id}`);
        if (!response.ok) {
            throw new Error(`Error fetching quote ${id}`);
        }
        return response.json();
    },

    /**
     * Get all quotes for a specific client
     */
    async getQuotesByClient(clientId: number): Promise<Presupuesto[]> {
        const response = await fetch(`${API_URL}/presupuestos/cliente/${clientId}`);
        if (!response.ok) {
            throw new Error(`Error fetching quotes for client ${clientId}`);
        }
        return response.json();
    },

    /**
     * Create a new quote with lines
     */
    async createQuote(data: PresupuestoCreate): Promise<Presupuesto> {
        const response = await fetch(`${API_URL}/presupuestos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error creating quote');
        }
        return response.json();
    },

    /**
     * Update an existing quote (header only)
     */
    async updateQuote(id: number, data: PresupuestoUpdate): Promise<Presupuesto> {
        const response = await fetch(`${API_URL}/presupuestos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error updating quote');
        }
        return response.json();
    },

    /**
     * Delete a quote
     */
    async deleteQuote(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/presupuestos/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error deleting quote');
        }
    },
};
