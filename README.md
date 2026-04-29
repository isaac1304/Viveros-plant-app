# Verdor

App móvil multi-tenant (Expo + React Native + TypeScript) para viveros.
Producto de Techbox — un solo bundle que cualquier vivero puede contratar.

Identificación de plantas vía:
- **Foto + IA** (Claude Vision) — reconoce la especie y devuelve cuidados, plagas y enfermedades.
- **QR físico** pegado en cada planta vendida — abre la ficha en segundos.

Cada cliente final pertenece a un **vivero (tenant)**. Al crear cuenta el
cliente escribe el código de su vivero (ej. `ZAMORANO`); a partir de ahí el
nombre, dirección, WhatsApp y club que ve dentro de la app son los de ese vivero.

Roles: `customer` (jardinero), `staff_vivero`, `tenant_admin`, `super_admin` (Techbox).

---

## Demo rápido (5 min)

```bash
# 1. Clonar e instalar
cd verdor-app
npm install --legacy-peer-deps

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env y pegar:
#   - ANTHROPIC_API_KEY  (https://console.anthropic.com)
#   - EXPO_PUBLIC_FIREBASE_*  (config web del proyecto Firebase)

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
  _layout.tsx              # Root stack + route guard (Expo Router)
  index.tsx                # Splash → redirige según auth state
  onboarding.tsx           # 3 slides intro → sign-up
  (auth)/                  # Stack público — sign-in / sign-up
  home.tsx                 # Feed con saludos, recordatorios, club
  garden.tsx               # Mi jardín (plantas guardadas)
  club.tsx                 # Club de Plantas {tenant.name}
  camera.tsx               # Cámara + Claude Vision
  qr.tsx                   # Scanner de QR
  result.tsx               # Resultado de identificación AI
  plant/[id].tsx           # Detalle de planta con tabs
  api/identify+api.ts      # Endpoint server-side (Claude API)

src/
  components/              # Button, PlantCard, AlertCard, TabBar, Logo, TextField, ...
  data/plants.ts           # Catálogo seed (migra a tenants/{tid}/plants en Fase 2)
  lib/firebase.ts          # Init Firebase (auth + Firestore con persistencia RN)
  lib/auth.ts              # signUp/signIn/signOut, valida tenantCode antes de crear user
  lib/tenants.ts           # Tipo Tenant + fetchTenant / validateTenantCode
  lib/identify.ts          # Cliente del endpoint /api/identify
  state/UserContext.tsx    # AuthProvider + useAuth + useUser + useTenant
  state/AppContext.tsx     # Estado de jardín / riego / historial (AsyncStorage)
  theme/                   # Tokens de diseño + tipografía

firestore.rules            # Multi-tenant rules — tenants/, users/, default deny
eas.json                   # Build profiles: development / preview / production
app.config.ts              # Variant logic (bundle id + nombre por entorno)
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
| `ANTHROPIC_API_KEY` | Sí (server) | Llamadas a Claude Vision desde `/api/identify` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Sí | Firebase Auth + Firestore |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Sí | Firebase Auth dominio |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Sí | Firebase project id |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Sí | Firebase Storage (futuro) |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sí | FCM (push, futuro) |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Sí | Firebase web app id |
| `APP_VARIANT` | No (default `development`) | `development` ↔ `production` — controla bundle id y nombre |

Modelo de IA usado: `claude-haiku-4-5-20251001` (más barato, suficiente para identificación).
Para producción podríamos cambiar a `claude-sonnet-4-6` si necesitamos más precisión.

> Las claves `EXPO_PUBLIC_FIREBASE_*` se incluyen en el bundle del cliente — no son secretas.
> La protección de datos se hace con **Firestore Security Rules** (ver `firestore.rules`).

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

## Setup Firebase (auth + base de datos)

Verdor usa **Firebase Auth + Firestore** para usuarios, tenants (viveros), roles y persistencia.
Recomendado un proyecto por entorno: `vivero-dev` y `vivero-prod`.

1. Crear el proyecto en [Firebase Console](https://console.firebase.google.com).
2. **Authentication → Sign-in method →** habilitar **Email/Password**.
   (Google y Apple se agregan después; requieren config nativa de SHA-1 / Service IDs.)
3. **Firestore Database →** crear base de datos en modo *production*. Región sugerida: `us-central1` (latencia ok desde CR).
4. **Project settings → General → Your apps →** Web app (ícono `</>`) → copiar la config a `.env` (claves `EXPO_PUBLIC_FIREBASE_*`).
5. Desplegar reglas de seguridad:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # elegir el proyecto vivero-dev
   firebase deploy --only firestore:rules
   ```
6. **Crear el primer tenant manualmente** — antes de poder crear cuentas hay que tener al menos un vivero en la colección `tenants`. Ver sección siguiente.

Las reglas viven en [`firestore.rules`](./firestore.rules). Hoy el `role` se lee del doc del
usuario (un read extra por evaluación) — aceptable mientras el tráfico es bajo. En la Fase 3
migramos role a *custom claims* vía Cloud Function y eliminamos esos reads.

---

## Crear un tenant (vivero) en Firestore

El sign-up del cliente final exige un código de vivero válido (`ZAMORANO`, `ROBLEDAL`, …)
que mapea al doc id de la colección `tenants`. Mientras no tengamos panel super-admin,
los tenants se crean a mano desde la consola de Firestore.

**Console → Firestore → Iniciar colección → ID de colección: `tenants`** → agregar documento:

| Campo | Tipo | Valor (ejemplo Zamorano) |
|---|---|---|
| Document ID | — | `zamorano` *(¡en minúscula! es el slug del código)* |
| `slug` | string | `zamorano` |
| `name` | string | `Vivero El Zamorano` |
| `city` | string | `Cartago, Costa Rica` |
| `address` | string | `Vivero El Zamorano · Cartago` |
| `hours` | string | `Lun-Sáb 7:30am-5:00pm · Dom 9:30am-5:00pm` |
| `whatsapp` | string | `50622688257` *(E.164 sin `+`)* |
| `primaryColor` | string | `#3DA35D` |
| `subscriptionTier` | string | `enterprise` |
| `createdAt` | timestamp | *(usar el ícono de reloj para `serverTimestamp`)* |

Cuando un cliente escriba `ZAMORANO` (o `zamorano`, mayúsculas no importan) en el sign-up,
el sistema buscará `tenants/zamorano` y le asignará ese tenantId. Toda la copia de la app
(saludos, Club, "Reservar por WhatsApp") leerá de este doc.

Para crear más viveros: repetí el proceso con otro slug (ej. `robledal`).

---

## Builds nativos (EAS)

```bash
npm install -g eas-cli
eas login
eas init                                # vincula el proyecto

# dev client (instalable en simulador / dispositivo, recarga JS):
eas build --profile development --platform ios

# build interna previa (TestFlight / APK interno):
eas build --profile preview --platform all

# producción (sube versión, listo para submit):
eas build --profile production --platform all
eas submit --profile production --platform ios
```

Los profiles están en [`eas.json`](./eas.json). El bundle id se cambia automáticamente
según `APP_VARIANT` (ver `app.config.ts`): development → `cr.zamorano.app.dev`,
production → `cr.zamorano.app`. Eso permite tener ambas apps instaladas en paralelo.

> **Secrets en EAS**: nunca commitear `.env` con valores reales. Usá `eas secret:create`
> para `ANTHROPIC_API_KEY` y los `EXPO_PUBLIC_FIREBASE_*` por entorno.

---

## Próximos pasos

**Fase 2 — Catálogo per-tenant** (lo que hoy vive en `src/data/plants.ts` o AsyncStorage)
- [ ] Catálogo: subcolección `tenants/{tid}/plants/{id}` editable por staff
- [ ] Mi jardín: subcolección `users/{uid}/garden/{plantId}` con `tenantId` en cada doc
- [ ] Historial de identificaciones: `users/{uid}/identifications/{id}`
- [ ] Telemetría de QR scans: `tenants/{tid}/qr_scans/{id}`
- [ ] Seed CLI script para subir el catálogo `plants.ts` actual al tenant `zamorano`

**Fase 3 — Roles y panel staff**
- [ ] Cloud Function `setRole` (super-admin-only) → mover role a custom claims
- [ ] Vistas `app/(staff)/*` para CRUD del catálogo y métricas de QR del propio vivero
- [ ] Invitación de staff por código (`tenants/{tid}/staff_invites`)
- [ ] QR-first onboarding: el QR codifica `{tenantId, plantId}` y pre-rellena el sign-up

**Fase 4 — White-label y producción**
- [ ] Override de logo + `primaryColor` por tenant
- [ ] Portal super-admin (web) para Techbox: alta de viveros, métricas globales, billing
- [ ] Migrar `/api/identify` a Cloud Function con Secret Manager + App Check (rate limiting)
- [ ] Sentry + Cloud Logging con `tenantId` para atribución de costos
- [ ] Backups programados de Firestore (export por tenant)
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
