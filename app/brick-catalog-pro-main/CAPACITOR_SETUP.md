# Configuración de Capacitor para Cerámicas Mora App

Esta aplicación está preparada para funcionar como aplicación móvil multiplataforma usando Capacitor.

## Pasos para ejecutar la aplicación en dispositivos móviles:

### 1. Exportar el proyecto a GitHub
- Click en "Export to Github" en Lovable
- Clona el proyecto desde tu repositorio GitHub

### 2. Instalar dependencias
```bash
npm install
```

### 3. Añadir plataformas
Para iOS:
```bash
npx cap add ios
```

Para Android:
```bash
npx cap add android
```

### 4. Construir el proyecto
```bash
npm run build
```

### 5. Sincronizar con Capacitor
```bash
npx cap sync
```

### 6. Ejecutar en dispositivo

Para iOS (requiere Mac con Xcode):
```bash
npx cap run ios
```

Para Android (requiere Android Studio):
```bash
npx cap run android
```

## Características de la Aplicación

### ✅ Funcionalidades Implementadas:
- **Catálogo de Productos**: Navegación completa de productos Clinker y Plaquetas
- **Vista Detallada**: Galería de imágenes para cada producto
- **Gestión de Presupuestos**: Sistema completo de creación y exportación PDF
- **Gestión de Clientes**: CRUD completo de clientes
- **Diseño Responsive**: Optimizado para móvil, tablet y escritorio
- **Categorización Clara**: Distinción visual entre Clinker y Plaquetas

### 📱 Optimizaciones Móviles:
- Hot-reload habilitado para desarrollo rápido
- Diseño adaptativo para todas las pantallas
- Navegación intuitiva con sidebar
- Transiciones suaves y animaciones

### 🎨 Diseño Cerámicas Mora:
- Colores corporativos: Terracota, Beige, Dorado
- Tipografía profesional
- Sistema de diseño consistente
- Tema claro y oscuro

## Notas Técnicas

- **App ID**: `app.lovable.b1dd4c7e90fa41dda7d43ea26988d26d`
- **App Name**: Cerámicas Mora
- **Hot Reload URL**: Configurado para desarrollo rápido

## Después de hacer cambios

Cada vez que hagas cambios en el código:
1. `git pull` - Obtener los últimos cambios
2. `npm run build` - Construir el proyecto
3. `npx cap sync` - Sincronizar con las plataformas nativas

## Recursos Adicionales

- [Documentación de Capacitor](https://capacitorjs.com/)
- [Lovable Docs](https://docs.lovable.dev/)
