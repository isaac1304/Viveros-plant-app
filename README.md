# Zamorano Plant App

App móvil (Expo + React Native + TypeScript) para Vivero El Zamorano.

Identificación de plantas vía:
- **Foto + IA** (Claude Vision) — reconoce la especie y devuelve cuidados, plagas y enfermedades.
- **QR físico** pegado en cada planta vendida en el vivero — abre la ficha en segundos.

Pensada como gancho para la propuesta comercial de Techbox: prototipo funcional → piloto → app completa.

---

## Demo rápido (5 min)

```bash
# 1. Clonar e instalar
cd zamorano-plant-app
npm install --legacy-peer-deps

# 2. Configurar la API key de Claude
cp .env.example .env
# Editar .env y pegar tu ANTHROPIC_API_KEY

# 3. Arrancar
npm start
```

Luego:
- En tu celular, instalá **Expo Go** (App Store / Play Store).
- Escaneá el QR que sale en la terminal.
- La app se abre en tu teléfono — funciona como app nativa real.

> Para que la identificación con IA funcione, el celular debe estar en la **misma red Wi-Fi** que la computadora donde corre `npm start`. La app llama a un endpoint local servido por Expo Router.

---

## Estructura

```
app/
  _layout.tsx              # Root stack (Expo Router)
  index.tsx                # Splash
  onboarding.tsx           # 3 slides intro
  home.tsx                 # Feed con saludos, recordatorios, club
  garden.tsx               # Mi jardín (plantas guardadas)
  club.tsx                 # Club de Plantas Zamorano
  camera.tsx               # Cámara + Claude Vision
  qr.tsx                   # Scanner de QR
  result.tsx               # Resultado de identificación AI
  plant/[id].tsx           # Detalle de planta con tabs
  api/identify+api.ts      # Endpoint server-side (Claude API)

src/
  components/              # Button, PlantCard, AlertCard, TabBar, Logo, ...
  data/plants.ts           # Catálogo de plantas mock
  lib/identify.ts          # Cliente del endpoint /api/identify
  state/AppContext.tsx     # Estado global (plantas guardadas)
  theme/                   # Tokens de diseño + tipografía
```

---

## Flujo demo para el pitch

Para mostrar a Vivero El Zamorano en la reunión:

1. **Splash + Onboarding** (10s) — establecé el tono visual.
2. **Home** — mostrales el dashboard que ven los clientes.
3. **Tap en el FAB de la cámara** — explicá: *"esto es lo que pasa cuando un cliente tiene una planta en casa y no sabe qué le pasa"*.
4. **Tomá foto a una planta cualquiera** — Claude la identifica en ~3 segundos.
5. **Tap en QR (chip de la cámara)** — *"y este es el momento de la compra: cada planta del vivero trae un QR pegado"*.
6. **Botón "Simular escaneo"** (visible en pantalla QR durante el demo) → abre directo el detalle de la Monstera.
7. **Detalle de la planta** — tabs de cuidados, plagas, enfermedades. Cierre: *"En Zamorano · Reservar por WhatsApp"* — ahí está el ROI inmediato.
8. **Mi Jardín / Club** — engagement post-venta, integración con su Club existente de 1.2K miembros.

---

## Variables de entorno

| Variable | Requerida | Para qué |
|----------|-----------|----------|
| `ANTHROPIC_API_KEY` | Sí (para AI real) | Llamadas a Claude Vision desde `/api/identify` |

Modelo usado: `claude-haiku-4-5-20251001` (más barato, suficiente para identificación).
Para producción podríamos cambiar a `claude-sonnet-4-6` si necesitamos más precisión.

### Estimación de costos por identificación

- Imagen JPEG ~100KB → ~1500 tokens de input visual
- Respuesta JSON ~150 tokens output
- Haiku 4.5 a fecha actual: ~$0.001-0.002 por identificación

Para 1 000 identificaciones/mes (vivero mediano-grande): **~$1-2 USD/mes**. Despreciable.

---

## Comandos útiles

```bash
npm start             # Arranca el dev server (escaneás QR con Expo Go)
npm run ios           # Abre en simulador iOS (requiere Xcode)
npm run android       # Abre en emulador Android (requiere Android Studio)
npm run web           # Web preview (limitado: cámara con permisos del browser)
npm run typecheck     # tsc --noEmit
```

---

## Próximos pasos (Fase 1 → 2)

- [ ] Persistencia local de Mi Jardín (AsyncStorage o SQLite)
- [ ] Sistema de recordatorios push reales (expo-notifications)
- [ ] Backend real con catálogo dinámico de plantas (Supabase / Convex)
- [ ] Generación de QRs únicos por planta vendida (con tracking)
- [ ] Integración con el Club de Plantas existente
- [ ] Build EAS + publicación en App Store / Play Store

---

## Tech stack

- Expo SDK 54 + React Native 0.81 + React 19
- Expo Router 6 (file-based routing + API routes)
- TypeScript strict
- React Native Reanimated, Gesture Handler
- Expo Camera (foto + barcode scanner)
- Anthropic SDK (Claude Vision API)
- Lucide / Ionicons (iconografía)
- React Native SVG (logo)
