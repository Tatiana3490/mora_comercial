// Service for client API operations

const API_URL = '/api/v1';

export interface Client {
    id_cliente: number;
    nombre: string;
    nif?: string;
    correo?: string;
    provincia?: string;
    direccion?: string;
    id_comercial_propietario: number;
}

export interface ClientCreate {
    nombre: string;
    nif?: string;
    correo?: string;
    provincia?: string;
    direccion?: string;
    id_comercial_propietario: number;
}

export interface ClientUpdate {
    nombre?: string;
    nif?: string;
    correo?: string;
    provincia?: string;
    direccion?: string;
    id_comercial_propietario?: number;
}

export const clientService = {
    /**
     * Get all clients
     */
    async getClients(): Promise<Client[]> {
        const response = await fetch(`${API_URL}/clientes/`);
        if (!response.ok) {
            throw new Error('Error fetching clients');
        }
        return response.json();
    },

    /**
     * Get a single client by ID
     */
    async getClientById(id: number): Promise<Client> {
        const response = await fetch(`${API_URL}/clientes/${id}`);
        if (!response.ok) {
            throw new Error(`Error fetching client ${id}`);
        }
        return response.json();
    },

    /**
     * Create a new client
     */
    async createClient(data: ClientCreate): Promise<Client> {
        const response = await fetch(`${API_URL}/clientes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error creating client');
        }
        return response.json();
    },

    /**
     * Update an existing client
     */
    async updateClient(id: number, data: ClientUpdate): Promise<Client> {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error updating client');
        }
        return response.json();
    },

    /**
     * Delete a client
     */
    async deleteClient(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/clientes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error deleting client');
        }
    },
};
