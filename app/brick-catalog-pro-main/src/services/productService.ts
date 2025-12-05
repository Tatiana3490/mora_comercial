import { Product } from "@/data/products";
import { getApiUrl } from "@/config/apiConfig";

const API_BASE_URL = getApiUrl("/articulos");

export const productService = {
    async getProducts(): Promise<Product[]> {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        // Map backend data to frontend Product interface if necessary
        // Backend returns 'id' (str), frontend expects 'id' (str).
        // Backend returns 'imagenes' (list[str]), frontend expects 'imagenes' (string[]).
        // Backend returns 'datos_tecnicos' (dict), frontend expects 'datosTecnicos' (object).

        return data.map((item: any) => ({
            ...item,
            datosTecnicos: item.datos_tecnicos, // Map snake_case to camelCase
        }));
    },

    async getProductById(id: string): Promise<Product> {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const item = await response.json();
        return {
            ...item,
            datosTecnicos: item.datos_tecnicos,
        };
    }
};
