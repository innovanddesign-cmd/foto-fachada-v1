# 🚀 Guía Completa de Despliegue - Foto Fachada

## ⚠️ Por qué no ves los cambios

Los componentes que creamos (AccountSettings, HelpCenter, ToastContainer, etc.) **existen en el código pero no están conectados a las rutas de la aplicación**. Para verlos, necesitas:

1. **Añadirlos al sistema de navegación** (AppView)
2. **Crear rutas en el Router**
3. **Integrar en el Header/Sidebar**

---

## 📋 PASO 1: Integración de Componentes Nuevos

### 1.1 Añadir imports en App.tsx

Añade estos imports al inicio de `src/App.tsx`:

```tsx
// Nuevos componentes Block 14-15
import { AccountSettings } from './components/features/AccountSettings';
import { HelpCenter } from './components/features/HelpCenter';
import { LandingPreviewModal } from './components/features/LandingPreviewModal';
import { RequestChangesModal } from './components/features/RequestChangesModal';
import { Sidebar } from './components/layout/Sidebar';
import { SupportWidget } from './components/support/SupportWidget';

// Toast
import { toast } from './store/toastStore';
import { activity } from './services/activityLogService';
```

### 1.2 Añadir nuevas vistas

Modifica el tipo `AppView` (línea ~30):

```tsx
type AppView = 'home' | 'dashboard' | 'project' | 'create-landing' | 'pricing' 
  | 'campaigns' | 'landings' | 'strategies' | 'posters' 
  | 'settings' | 'help';  // ← AÑADIR ESTOS
```

### 1.3 Añadir renderizado condicional

Dentro de `AppContent`, añade casos para las nuevas vistas:

```tsx
{appView === 'settings' && <AccountSettings />}
{appView === 'help' && <HelpCenter />}
```

### 1.4 Actualizar Header para navegar a settings/help

En el menú de usuario del Header, conectar:
- "Configuración" → `onNavigate('settings')`
- "Ayuda" → `onNavigate('help')`

---

## 📋 PASO 2: Variables de Entorno

### 2.1 Crear archivo `.env` en la raíz

```env
# API Gemini
VITE_GEMINI_API_KEY=tu_api_key_de_gemini

# Supabase
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

# URLs
VITE_API_URL=http://localhost:3001
VITE_LANDING_BASE_URL=https://land.fotofachada.com
```

### 2.2 Crear `.env` en `/server`

```env
# Server
PORT=3001
NODE_ENV=production

# API Keys
GEMINI_API_KEY=tu_api_key_de_gemini

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PLUS=price_xxx
STRIPE_PRICE_PRO=price_xxx

# Database (opcional para métricas)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📋 PASO 3: Build de Producción

### 3.1 Instalar dependencias

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 3.2 Build del frontend

```bash
npm run build
```

Esto genera la carpeta `dist/` con los archivos estáticos.

### 3.3 Verificar build local

```bash
npm run preview
```

Abre http://localhost:4173 para verificar.

---

## 📋 PASO 4: Opciones de Despliegue

### OPCIÓN A: Vercel (Recomendado para Frontend)

1. Conecta tu repositorio a [vercel.com](https://vercel.com)
2. Configura variables de entorno en el dashboard
3. Build command: `npm run build`
4. Output directory: `dist`

### OPCIÓN B: Render (Frontend + Backend)

**Frontend:**
1. New Static Site → Connect repo
2. Build: `npm run build`
3. Publish: `dist`

**Backend:**
1. New Web Service → Connect repo
2. Root: `server`
3. Build: `npm install`
4. Start: `node index.js`

### OPCIÓN C: VPS con PM2 (Control Total)

```bash
# 1. Subir código al servidor
scp -r . user@servidor:/var/www/fotofachada

# 2. Instalar PM2
npm install -g pm2

# 3. Iniciar con ecosystem
cd /var/www/fotofachada
pm2 start ecosystem.config.js

# 4. Configurar Nginx (ver deploy/nginx.conf)
sudo cp deploy/nginx.conf /etc/nginx/sites-available/fotofachada
sudo ln -s /etc/nginx/sites-available/fotofachada /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. SSL con Certbot
sudo certbot --nginx -d fotofachada.com -d www.fotofachada.com
```

---

## 📋 PASO 5: Verificación Post-Despliegue

### Checklist

- [ ] Frontend carga sin errores en consola
- [ ] API responde en `/api/health`
- [ ] Toasts aparecen al realizar acciones
- [ ] Login con Supabase funciona
- [ ] Generación de landings funciona
- [ ] Stripe checkout funciona
- [ ] QR se genera correctamente
- [ ] PDF se descarga

### Monitoreo

```bash
# Ver logs en tiempo real
pm2 logs

# Estado de servicios
pm2 status

# Métricas
pm2 monit
```

---

## 🔧 Troubleshooting

### "Los componentes no aparecen"
→ Verifica que están importados en App.tsx y tienen ruta

### "Toast no funciona"
→ Verifica que `<ToastContainer />` está en main.tsx

### "API 404"
→ Verifica `VITE_API_URL` y que el backend está corriendo

### "Stripe no procesa"
→ Verifica webhook secret y que el endpoint está expuesto

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa logs del servidor (`pm2 logs`)
3. Contacta soporte vía WhatsApp (botón en la app)
