# BlümSens — MVP

App móvil (React Native + Expo) para conectar macetas inteligentes IoT: muestra la humedad del suelo, la temperatura y la luz de cada planta en tiempo real, analiza fotos de las hojas y genera alertas de cuidado.

Es un **proyecto escolar**: no hay backend ni hardware real. Los módulos ESP32, las lecturas, el reconocimiento de especie y el análisis de hojas son **simulados** con datos sintéticos predefinidos, pero la app funciona de punta a punta para una presentación.

Diseño base: el archivo de Figma "BlümSens" (10 pantallas).

---

## Cómo correrla en tu celular (Expo Go)

1. Instala **Expo Go** en tu celular (App Store / Google Play). Necesitas la versión compatible con **Expo SDK 58**.
2. En la computadora, dentro de esta carpeta:

   ```bash
   npm install
   npx expo start
   ```

3. Escanea el código QR que aparece en la terminal:
   - **Android:** desde la app Expo Go.
   - **iPhone:** con la cámara del teléfono.

   La computadora y el celular deben estar en la **misma red Wi-Fi**. Si la red de la escuela bloquea la conexión, usa `npx expo start --tunnel`.

También funciona en el navegador con `npx expo start --web`, aunque la cámara es más limitada ahí.

**Cuenta de demostración:** el login ya viene relleno (`hola@blumsens.mx` / `planta123`). Cualquier correo válido con una contraseña de 6 caracteres o más funciona.

---

## Guion sugerido para la presentación (≈3 min)

1. **Bienvenida → Iniciar sesión → Entrar.**
2. **Mis plantas:** 3 macetas con lecturas en vivo (cambian cada 3 s). La Menta pide riego y la Sansevieria no tiene señal.
3. Toca **Menta de Cocina** → detalle con humedad, temperatura y luz, más el diagnóstico foliar.
   - Pulsa **Registrar riego · 150 ml**: la humedad sube de 22 % a ~46 % y la alerta de riego se resuelve sola.
   - **Historial:** gráficas de 24 h / 7 días / 30 días, fotos de la hoja y registro de riegos.
   - **Monitoreo:** el tablero de la pantalla 3.1 con barra de luz y estado del módulo.
4. **Alertas:** filtra por tipo y marca alertas como atendidas.
5. **Módulos:** pulsa **Simular desconexión** en un módulo → aparece una alerta "Módulo sin señal" → **Reconectar** (tarda unos 2 s, como un handshake real).
6. **+ Maceta** (en Mis plantas) → toma la foto de una hoja → "Analizando…" → se detecta la especie → ponle nombre → **Guardar y vincular** → toca el QR para simular el escaneo del módulo, o escribe `BLM-ESP32-004` → **Finalizar vinculación**. La nueva planta aparece con lecturas en vivo.
7. En la planta nueva, **Escanear hoja** hace un análisis nuevo y lo agrega a "Tu hoja en el tiempo".

Para volver al estado inicial: **Módulos → Restablecer datos**.

> **QR de los módulos:** en *Vincular módulo* la cámara se abre sola y lee el QR. El QR contiene solo el **número de serie** en texto plano (por ejemplo `BLM-ESP32-004`), que puede tener letras, números, `-`, `_` o `.`, entre 3 y 40 caracteres. Hay QR de prueba listos para imprimir en `../qr-modulos/`. Si no hay cámara, puedes usar **Simular escaneo** o escribir el número de serie a mano.

---

## Qué está simulado y cómo

| Elemento real | Simulación en el MVP |
| --- | --- |
| Módulo ESP32 enviando datos por Wi-Fi | `useSimulator` genera una lectura cada 3 s por módulo en línea (`src/hooks/useSimulator.ts`, `tick()` en el store). |
| Humedad del suelo | Baja poco a poco; sube unos 24 puntos con cada riego de 150 ml. |
| Temperatura / luz | Oscilan alrededor del "clima" de cada habitación. |
| Alertas push | Se crean al cruzar umbrales (humedad < mínimo ideal), al perder conexión o tras un diagnóstico foliar con problemas. |
| Visión por computadora (especie + salud de la hoja) | Catálogo predefinido (`src/data/species.ts`); el diagnóstico es coherente con las lecturas: si falta agua → "Estrés hídrico leve". |
| Historial en la nube | Series sintéticas con semilla (`src/lib/history.ts`); el último punto siempre es la lectura actual y los riegos aparecen como subidas. |
| Backend / autenticación | Sesión local; todo se guarda en el dispositivo con AsyncStorage. |

---

## Estructura

```
src/
  app/                    Rutas (Expo Router)
    welcome.tsx           01 · Bienvenida
    login.tsx             02 · Iniciar sesión / crear cuenta
    (tabs)/plants.tsx     03 · Mis plantas
    (tabs)/alerts.tsx     09 · Centro de alertas
    (tabs)/modules.tsx    Módulos IoT + modo presentación (pantalla nueva)
    scan.tsx              04 · Escaneo foliar (cámara / galería)
    plant/[id]/index.tsx  05 · Detalle de planta
    plant/[id]/monitor.tsx 3.1 · Monitoreo de mi planta
    plant/[id]/history.tsx 08 · Historial y evolución
    setup.tsx             06 · Configurar planta
    link.tsx              07 · Vincular módulo (QR o ID manual)
  components/             UI reutilizable (botones, tarjetas, gráfica, tab bar…)
  data/                   Tipos, catálogo de especies y jardín semilla
  lib/                    Formatos, reglas de estado/recomendación, historial sintético
  store/                  Estado global (zustand + AsyncStorage) y selectores
  theme/                  Colores y tipografía extraídos de Figma
  assets.ts               Íconos e imágenes exportados de Figma (assets/figma)
```

**Stack:** Expo SDK 58 · React Native 0.88 · Expo Router · TypeScript · zustand · react-native-svg (+ svg-transformer) · expo-camera · expo-image-picker · expo-image · fuente Inter.

## Scripts

```bash
npx expo start      # servidor de desarrollo (QR para Expo Go)
npm run typecheck   # TypeScript
npx eslint src      # lint
```

## Pendientes

- Ícono de la app y pantalla de carga: todavía usan los de Expo por defecto.
- Conectar un ESP32 real: sustituir `tick()` por una suscripción MQTT o HTTP con el mismo formato de `Reading`.
