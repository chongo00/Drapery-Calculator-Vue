# Drapery Calculator (Ionic Vue)

Guía completa para que cualquier integrante del equipo pueda construir, probar y publicar la aplicación en Android e iOS sin conocimientos previos.

> **Objetivo**: al finalizar este documento sabrás generar los archivos `.aab` (Android) y `.ipa` (iOS), validar la app y dejar listos los artefactos para enviarlos a las tiendas.

---

## 📚 Índice rápido
1. [Preparación del entorno](#-preparación-del-entorno)
2. [Checklist general antes de cada build](#-checklist-general-antes-de-cada-build)
3. [Generar iconos y recursos](#-generar-iconos-y-recursos)
4. [Android (Google Play)](#-android-google-play)
5. [iOS (App Store)](#-ios-app-store)
6. [Pruebas y QA](#-pruebas-y-qa)
7. [Entrega a la empresa](#-entrega-a-la-empresa)
8. [FAQ](#-faq)

---

## ⚙️ Preparación del entorno

| Herramienta | Uso | Instrucciones |
|-------------|-----|---------------|
| [Node.js](https://nodejs.org/) 18 LTS o 20 LTS | Ejecutar scripts `npm` | Instala desde la web oficial y reinicia la terminal. Comprueba con `node -v` y `npm -v`. |
| Git | Control de versiones | Instala desde [git-scm.com](https://git-scm.com/). Verifica con `git --version`. |
| [Android Studio](https://developer.android.com/studio) | Build y pruebas Android | Incluye JDK 17 y emulador. |
| [Xcode](https://developer.apple.com/xcode/) (solo Mac) | Build y pruebas iOS | Descarga desde App Store (requiere ~15 GB). |
| CLI opcionales | Ionic CLI (`npm install -g @ionic/cli`), Capacitor CLI (`npx cap ...` ya disponible) | Útiles pero no obligatorias. |

### 1. Clonar el repositorio
```bash
git clone https://<tu-servidor>/Drapery-Calculator-Vue.git
cd Drapery-Calculator-Vue
```

### 2. Instalar dependencias web
```bash
npm install
```

### 3. Verificar en modo desarrollo
```bash
npm run dev
```
- Abre http://localhost:5173 en el navegador.
- Revisa que la calculadora funcione y luego detén el servidor con `Ctrl + C`.

> ℹ️ Si aparece un error similar a `ENOENT: no such file or directory, lstat '...\0.0.0.0'`, vuelve a intentarlo con:
> ```bash
> npm run dev -- --host=0.0.0.0 --port=5173
> ```
> Este comando expone el servidor por red y evita el bug de Vite en Windows.

## ✅ Checklist de Pre-Release (común)

1. `npm run lint` y `npm run build` sin errores.
2. Actualizar número de versión (package.json + UI).
3. Ejecutar los tres tests manuales acordados (validaciones, cálculo, dark mode).
4. Limpiar historial local si es necesario (`localStorage.clear()`).
5. `npx cap sync` para copiar `dist/` a los contenedores nativos.
6. Verificar README, CHANGELOG o docs con cambios recientes.
7. Commit + tag en Git (`git tag v1.1.0.2` por ejemplo).

---

## 🤖 Android (Google Play)

### 1. Requisitos previos
- PC con Windows, macOS o Linux.
- [Android Studio](https://developer.android.com/studio) instalado (incluye JDK 17 y emulador).
- Herramienta `keytool` (viene con Java) para crear el keystore.
- Cuenta Google. *(Para publicar oficialmente necesitas una cuenta de Google Play Console: pago único de 25 USD).* 

### 2. Preparar el proyecto Android
1. Genera la versión web y sincroniza Capacitor:
   ```bash
   npm run build
   npx cap sync android
   ```
2. Abre el proyecto nativo:
   ```bash
   npx cap open android
   ```
   Android Studio se abrirá con la carpeta `android/`.
3. Cuando Android Studio lo solicite, pulsa **Sync Now** para descargar dependencias.

### 3. Actualizar SDK y ajustes recomendados
1. En Android Studio ve a **Help > Check for Updates** y aplica la última versión estable.
2. Abre **SDK Manager** y asegura que el último SDK de Android (API más reciente) esté instalado.
3. Si aparece el banner "Recommended actions" o "Update Gradle plugin", haz clic en **Apply Update** para que el proyecto use el SDK/base build tools más recientes.
4. Verifica en `android/build.gradle` o `android/variables.gradle` que `compileSdkVersion` y `targetSdkVersion` coincidan con el nivel requerido por Google Play (actualízalos si hace falta y vuelve a sincronizar).
5. Revisa la ventana **Build > Build Analyzer** y corrige advertencias importantes (librerías obsoletas, incompatibilidades, etc.) antes de continuar.

### 4. Crear y configurar el keystore (solo la primera vez)
1. En una terminal dentro del proyecto ejecuta:
   ```bash
   keytool -genkey -v -keystore drapery.keystore -alias drapery \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Completa los datos solicitados (nombre, organización, etc.).
3. Copia `drapery.keystore` a `android/app/` **(no subir a Git)**.
4. Abre `android/gradle.properties` y añade:
   ```
   MYAPP_UPLOAD_STORE_FILE=drapery.keystore
   MYAPP_UPLOAD_KEY_ALIAS=drapery
   MYAPP_UPLOAD_STORE_PASSWORD=<tu-contraseña>
   MYAPP_UPLOAD_KEY_PASSWORD=<tu-contraseña>
   ```
5. En `android/app/build.gradle`, dentro de `android { ... }`, agrega:
   ```gradle
   signingConfigs {
       release {
           storeFile file(MYAPP_UPLOAD_STORE_FILE)
           storePassword MYAPP_UPLOAD_STORE_PASSWORD
           keyAlias MYAPP_UPLOAD_KEY_ALIAS
           keyPassword MYAPP_UPLOAD_KEY_PASSWORD
       }
   }

   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled false
           shrinkResources false
       }
   }
   ```

### 5. Actualizar versión antes del build
1. Edita `android/app/build.gradle`:
   ```gradle
   versionCode  ## incrementa en +1
   versionName "1.1.0.2"  // cambia a la versión que vas a publicar
   ```
2. Guarda el archivo y sincroniza (Android Studio mostrará un aviso para "Sync now").

### 6. Generar el Android App Bundle (AAB)
1. En Android Studio ve a **Build > Generate Signed Bundle / APK**.
2. Selecciona **Android App Bundle** y haz clic en **Next**.
3. Elige el keystore (`drapery.keystore`), ingresa las contraseñas y selecciona el alias `drapery`.
4. Deja la variante `release` y finaliza. El AAB quedará en `android/app/release/app-release.aab`.
5. Opcional: renómbralo a `drapery-calculator-v1.1.0.2.aab` para claridad.

### 7. Probar la app antes de subir
- **Emulador**: en Android Studio, pulsa el botón ▶️ (Run) con un dispositivo virtual seleccionado.
- **Dispositivo físico**: activa "Depuración USB" en tu teléfono, conéctalo y pulsa ▶️.
- **Probar el .aab en un dispositivo**:
  ```bash
  java -jar bundletool.jar build-apks --bundle app-release.aab --output app.apks --mode universal
  java -jar bundletool.jar install-apks --apks app.apks
  ```

### 8. Publicar en Google Play Console
1. En https://play.google.com/console crea la aplicación (si es la primera vez).
2. Completa ficha de Play Store: nombre, descripción, screenshots, políticas.
3. Ve a **Release > Production** (o "Internal testing" para pruebas).
4. Sube el archivo `.aab`, añade notas de versión y guarda.
5. Revisa las secciones de contenido (clasificación por edades, privacidad, target SDK).
6. Envía para revisión. Google suele tardar 1–3 días hábiles.

### 9. Opciones de testeo gratuito
- Distribuye una pista de *Internal testing* para el equipo (se agregan correos Gmail).
- Usa `adb install app-debug.apk` para builds de depuración (generadas con **Run**).
- Mantén registro de feedback y errores en el issue del release.

---

## 🍎 iOS (App Store)

### 1. Requisitos previos
- Mac con macOS actualizado (no hay alternativa oficial en Windows/Linux).
- [Xcode](https://developer.apple.com/xcode/) instalado (App Store).
- Xcode Command Line Tools: abre Terminal y ejecuta `xcode-select --install`.
- Cuenta Apple ID gratuita para pruebas locales + cuenta Apple Developer (99 USD/año) para publicar.

### 2. Preparar el proyecto iOS
1. Genera la versión web y sincroniza Capacitor:
   ```bash
   npm run build
   npx cap sync ios
   ```
2. Abre el workspace en Xcode:
   ```bash
   npx cap open ios
   ```
   Xcode abrirá `ios/App/App.xcworkspace`.
3. Si Xcode solicita convertir el proyecto a una versión más reciente, acepta.

### 3. Actualizar SDK y aplicar ajustes recomendados
1. Abre la App Store y asegura que Xcode está en la última versión estable.
2. Dentro de Xcode, ve a **Preferences > Components** y descarga los simuladores/SDKs más recientes si faltan.
3. Cuando aparezca el banner "Update to recommended settings" pulsa **Perform Changes** para migrar el proyecto a la configuración más reciente.
4. En el panel del proyecto, pestaña **Build Settings**, confirma que `Base SDK` está en el iOS más reciente y que `iOS Deployment Target` cumple con los requisitos actuales de App Store.
5. Revisa la pestaña **Warnings** en el reporte de build o usa `Shift + Command + K` (Clean) seguido de **Product > Build** para detectar librerías obsoletas. Resuelve cualquier advertencia crítica antes de continuar.

### 4. Configurar firma y Bundle Identifier
1. En Xcode, en la barra lateral, selecciona el proyecto (ícono azul) y el target `App`.
2. En la pestaña **Signing & Capabilities**:
   - Marca "Automatically manage signing".
   - Selecciona tu Team (Apple ID / Developer account).
   - Define un `Bundle Identifier` único (ejemplo `com.tuempresa.drapery`).
3. Abre https://developer.apple.com/account/ e inicia sesión.
   - En **Certificates, Identifiers & Profiles**, renueva los certificados y perfiles de aprovisionamiento que estén por expirar.
   - Descarga los nuevos perfiles y agrégalos con doble clic (se abrirán en Xcode).

### 5. Verificar credenciales de firma localmente
- En **Signing & Capabilities**, asegúrate de que el perfil de aprovisionamiento correcto aparece sin advertencias.
- Si hay un símbolo de advertencia amarillo, pulsa "Download Manual Profiles" o utiliza el botón "Try Again" para que Xcode sincronice las credenciales.

### 6. Actualizar versión y número de build
1. En la pestaña **General > Identity**, ajusta:
   - `Version`: versión pública (ej. 1.1.0.3).
   - `Build`: contador interno (empieza en 1 y aumenta cada subida a TestFlight/App Store).

### 7. Verificar recursos
- Abre `Assets.xcassets` y confirma que existen los iconos y splash generados (gracias a `npx capacitor-assets generate`).

### 8. Pruebas locales
- **Simulador**: selecciona un dispositivo (iPhone 15, por ejemplo) en el menú superior y pulsa ▶️ (Run). Espera a que se compile y verificar.
- **Dispositivo físico**:
  1. Conecta el iPhone por USB.
  2. En el dispositivo ve a *Settings > General > VPN & Device Management* y confía en tu Apple ID.
  3. En Xcode selecciona el dispositivo y pulsa ▶️. (Con Apple ID gratuito la app expira en 7 días.)

### 9. Generar archivo para distribución
1. En Xcode: **Product > Archive**. Al finalizar se abrirá el **Organizer**.
2. Selecciona la build recién creada y pulsa **Distribute App**.
3. Elige **App Store Connect** y luego **Upload** (para TestFlight/App Store) o **Export** (para Ad Hoc/Enterprise).
4. Completa el asistente (firmas, información de encriptación, etc.).

### 10. TestFlight
1. Ingresa a https://appstoreconnect.apple.com/.
2. En **My Apps > Drapery Calculator > TestFlight**, espera a que aparezca la build (5–20 minutos).
3. Crea un grupo interno y agrega testers (correos Apple ID).
4. Envía invitaciones y recopila feedback.

### 11. Publicación en App Store
1. Completa las secciones: información general, precios, disponibilidad, política de privacidad.
2. Sube screenshots y texto de marketing (resoluciones obligatorias: iPhone 6.7", 6.5", 5.5" al menos).
3. Responde el cuestionario de privacidad (App Privacy) y el formulario de cumplimiento de encriptación (ITAR).
4. Selecciona la build en **App Store > Prepare for Submission**.
5. Añade notas para el revisor si es necesario y pulsa **Submit for Review**. Apple tarda 1–2 días en responder.

### 12. Recursos útiles
- [Guía oficial de envío a App Store](https://developer.apple.com/app-store/submissions/)
- [Documentación Capacitor iOS](https://capacitorjs.com/docs/ios)

---

## 🌐 Web / PWA (opcional)

Aunque el foco es móvil, puedes publicar la versión web como apoyo:
1. Ejecuta `npm run build`.
2. Sube el contenido de `dist/` a un hosting estático gratuito (Netlify, Vercel, GitHub Pages).
3. Si deseas una PWA instalable, revisa `vite.config.ts` y `manifest.webmanifest` (incluye los iconos generados). Puedes usar [Netlify CLI](https://docs.netlify.com/cli/get-started/) o `vercel deploy` para automatizar.

---

## 🧪 Pruebas y QA

### 1. Pruebas automáticas básicas
```bash
npm run lint
# npm run test:unit (disponible para cuando se agreguen pruebas unitarias)
```

### 2. Pruebas manuales recomendadas
1. **Test 1 – Cálculo básico**
   - Width `100`, Height `84`, Product `Ripplefold`, Fabric `54`, Return `6`, Opening `Center open`, Railroad `No`.
   - Resultado esperado: modal de resultados con `Required Fabric: 14 yards`, botones Copy funcionando.
2. **Validaciones**
   - Dejar `Width` vacío → mensaje “Width is required”.
   - Ingresar `Width 50.5` → mensaje “Width must be an integer value”.
   - Seleccionar Pinch Pleated sin fullness → mensaje “Pinch pleat fullness is required”.
3. **Tema oscuro**
   - Activar toggle en Settings, recargar la página y confirmar que el modo oscuro persiste.
4. **Historial**
   - Tras un cálculo exitoso, abrir la pestaña History y verificar que el registro aparece.

### 3. Dispositivos a cubrir
- Android emulador (API 34) y al menos un dispositivo físico (Android 10+).
- iOS simulador (iPhone 15) y, si es posible, un dispositivo físico.

### 4. Registro
- Documenta los resultados en el issue de release o documento compartido.
- Anexa capturas de pantalla o videos cortos de fallos.

---

## 📦 Entrega a la empresa

1. **Código fuente**
   - Merge en rama principal y crear tag `vX.Y.Z` si aplica.
   - Adjuntar link al commit release en el mensaje de entrega.
2. **Artefactos**
   - `app-release.aab` firmado.
   - `.ipa` exportado desde Xcode (cuando se genere).
   - Keystore y contraseñas, credenciales de Apple (en gestores seguros: 1Password, Vault, etc.).
3. **Documentación**
   - Actualizar `docs/CHANGELOG.md` con fecha, versión y resumen.
   - Mencionar cualquier incidencia pendiente o limitación conocida.
4. **Comunicación**
   - Enviar correo/mensaje al equipo con: versión, enlaces a artefactos, checklist QA, responsables y próximos pasos.

---

## ❓ FAQ

**¿Necesito el proyecto Angular antiguo?**
No, esta app es autónoma y contiene toda la lógica de cálculo.

**¿Qué hago si `npm install` falla por falta de permisos?**
Ejecuta la terminal como administrador (Windows) o usa `sudo` en macOS/Linux, o instala Node con nvm para evitar permisos globales.

**El icono no se actualiza en Android/iOS.**
Verifica que `resources/icon.png` se haya reemplazado y ejecuta: `npx capacitor-assets generate` seguido de `npx cap sync`.

**¿Puedo publicar sin pagar cuentas de desarrollador?**
No. Google cobra 25 USD (único) y Apple 99 USD/año. Sin esas cuentas solo podrás hacer pruebas locales.

**¿Dónde se guardan los cálculos? ¿Necesito backend?**
Los cálculos se almacenan en `localStorage`; no se requiere servidor ni base de datos externa.

---

> Mantén este README actualizado con cualquier cambio en requisitos de las tiendas o en el proceso interno. Es la guía oficial para futuras publicaciones.
