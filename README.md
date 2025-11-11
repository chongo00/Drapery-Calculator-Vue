# Drapery Calculator (Ionic Vue)

Guía completa para que cualquier integrante del equipo pueda construir, probar y publicar la aplicación en Android e iOS sin conocimientos previos.

> **Objetivo**: al finalizar este documento sabrás generar los archivos `.aab` (Android) y `.ipa` (iOS), validar la app y dejar listos los artefactos para enviarlos a las tiendas.

---

## 📚 Índice rápido
1. [Preparación del entorno](#-preparación-del-entorno)
2. [Checklist general antes de cada build](#-checklist-general-antes-de-cada-build)
3. [Generar iconos y recursos](#-generar-iconos-y-recursos)
4. [Android (Google Play)](#-android-google-play)
   - [Requisitos esenciales](#-requisitos-esenciales-android)
   - [Keystore (una sola vez)](#-keystore-una-sola-vez)
   - [Opcion A: Android Studio](#-opcion-a-android-studio-principiantes)
   - [Opcion B: Solo terminal](#-opcion-b-solo-terminal-sin-android-studio)
   - [Empaquetado y publicación](#-empaquetado-y-publicación-en-google-play)
5. [iOS (App Store)](#-ios-app-store)
   - [Requisitos esenciales](#-requisitos-esenciales-ios)
   - [Certificados y perfiles](#-certificados-y-perfiles-una-sola-vez)
   - [Opcion A: Xcode](#-opcion-a-xcode-recomendado)
   - [Opcion B: Solo terminal](#-opcion-b-solo-terminal-sin-xcode)
   - [TestFlight y App Store](#-testflight-y-app-store)
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

### 🔌 Requisitos esenciales (Android)
- PC con Windows, macOS o Linux con al menos 15 GB libres.
- [Node.js](https://nodejs.org/) 18 LTS o 20 LTS y Git (ya instalados desde la sección anterior).
- Java 17 (incluido en Android Studio) o [Temurin JDK 17](https://adoptium.net/) si no usarás Android Studio.
- Cuenta de Google Play Console (pago único 25 USD) para publicar.
- Opcional pero recomendado: [Android Studio](https://developer.android.com/studio) para un flujo visual guiado.
- Herramientas de línea de comandos: `keytool` (viene con Java), `adb` (Android Platform Tools) y `bundletool` (descargar desde [GitHub](https://github.com/google/bundletool/releases)).

> ⚠️ **Nunca pierdas el keystore ni sus contraseñas.** Si se extravían, Google no permitirá actualizar la app publicada.

### 🔐 Keystore (una sola vez)
1. Abre una terminal en la raíz del proyecto.
2. Ejecuta (reemplaza los datos entre `< >`):
   ```bash
   keytool -genkey -v -keystore drapery.keystore -alias drapery \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
3. Responde a las preguntas con los datos de la empresa.
4. Copia `drapery.keystore` a `android/app/` y guarda las contraseñas en un gestor seguro.
5. Abre `android/gradle.properties` y agrega:
   ```
   MYAPP_UPLOAD_STORE_FILE=drapery.keystore
   MYAPP_UPLOAD_KEY_ALIAS=drapery
   MYAPP_UPLOAD_STORE_PASSWORD=<contraseña keystore>
   MYAPP_UPLOAD_KEY_PASSWORD=<contraseña clave>
   ```
6. Revisa `android/app/build.gradle`. Dentro de `android { ... }` deben existir:
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

### 🛠️ Opción A: Android Studio (principiantes)
1. **Preparar archivos web**
   ```bash
   npm run build
   npx cap sync android
   ```
2. **Abrir el proyecto nativo**
   ```bash
   npx cap open android
   ```
   Android Studio abrirá la carpeta `android/`. Pulsa **Sync Now** si aparece.
3. **Actualizar herramientas**
   - Menú **Help > Check for Updates**.
   - `Tools > SDK Manager`: instala el SDK más reciente (API 34 o superior).
   - Si ves banners de "Recommended actions", pulsa **Apply Update**.
4. **Incrementar la versión**
   - Abre `android/app/build.gradle`.
   - Cambia `versionCode` (+1) y `versionName` (ej. `1.1.0.3`).
   - Guarda; si aparece un aviso, pulsa **Sync Now**.
5. **Generar paquete de publicación (.aab)**
   - Menú **Build > Generate Signed Bundle / APK...**.
   - Selecciona **Android App Bundle**, clic en **Next**.
   - Escoge tu keystore `drapery.keystore`, introduce contraseñas y alias.
   - Variante `release` → **Finish**. Archivo resultante: `android/app/release/app-release.aab`.
6. **Generar APK de pruebas (.apk)**
   - Menú **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Android Studio mostrará una notificación con el botón **locate** para abrir la carpeta `app/build/outputs/apk/`.
   - Sube ese `app-debug.apk` a testers o instálalo con `adb install`.
7. **Probar antes de subir**
   - **Emulador**: botón 🟢▶ y selecciona un dispositivo virtual.
   - **Dispositivo físico**: activa *Opciones de desarrollador > Depuración USB*, conecta por cable y pulsa ▶.
   - **Probar el .aab**: descarga [bundletool](https://developer.android.com/tools/bundletool) y ejecuta:
     ```bash
     java -jar bundletool.jar build-apks --bundle app-release.aab --output app.apks --mode universal
     java -jar bundletool.jar install-apks --apks app.apks
     ```

### 💻 Opción B: Solo terminal (sin Android Studio)
1. **Instalar SDK de Android por CLI**
   - Descarga *Command Line Tools* desde Android Studio > sección *Download Options*.
   - Descomprime en `C:\Android\cmdline-tools\latest` (Windows) o `~/Library/Android/sdk/cmdline-tools/latest` (macOS).
   - Define variables de entorno:
     - Windows: Panel de control → Variables del sistema → añade `ANDROID_HOME=C:\Android` y suma `%ANDROID_HOME%\platform-tools` al `PATH`.
     - macOS/Linux: agrega a tu `~/.zshrc` o `~/.bashrc`:
       ```bash
       export ANDROID_HOME=$HOME/Library/Android/sdk
       export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
       ```
2. **Descargar SDKs mínimos**
   ```bash
   sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"
   yes | sdkmanager --licenses
   ```
3. **Sincronizar los recursos web**
   ```bash
   npm run build
   npx cap sync android
   ```
4. **Actualizar versión de la app**
   - Edita `android/app/build.gradle` con cualquier editor de texto.
   - Incrementa `versionCode` y ajusta `versionName`.
5. **Construir el bundle `.aab` firmado**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   El archivo quedará en `app/build/outputs/bundle/release/app-release.aab`.
6. **Construir APK y probar en dispositivos**
   ```bash
   ./gradlew assembleRelease   # genera app-release.apk (firmado)
   ./gradlew assembleDebug     # genera app-debug.apk (sin firma de release)
   adb devices                 # verifica que el dispositivo esté conectado
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```
7. **Generar APK universal desde el `.aab`** (útil cuando Play Store exige `.aab` pero necesitas un APK único para testers):
   ```bash
   java -jar bundletool.jar build-apks --bundle app/build/outputs/bundle/release/app-release.aab \
     --output app-release.apks --mode universal
   java -jar bundletool.jar install-apks --apks app-release.apks
   ```
8. **Limpiar y repetir cuando todo esté correcto**
   ```bash
   ./gradlew clean
   cd ..
   ```

> 📝 Si no guardas contraseñas en `gradle.properties`, puedes pasarlas al vuelo: `./gradlew bundleRelease -PMYAPP_UPLOAD_STORE_PASSWORD=...`.

### 📦 Empaquetado y publicación en Google Play
1. Entra a [Google Play Console](https://play.google.com/console) y crea la app si es la primera vez.
2. Completa la ficha de Play Store (nombre, descripción, screenshots, políticas, clasificación por edades, privacidad).
3. Ve a **Release > Testing** y crea primero un track de **Internal testing** para validaciones internas:
   - Sube el `.aab` generado.
   - Agrega testers (correos Gmail) y publica.
   - Valida instalación automática en los dispositivos de QA.
4. Cuando todo funcione, crea una **Production release**:
   - Reutiliza el `.aab` validado.
   - Escribe notas de lanzamiento claras.
   - Revisa advertencias en la consola (nivel de API, permisos, políticas).
5. Envía a revisión. Google suele tardar de 24 h a 72 h.
6. Guarda un registro de:
   - Ruta del `.aab` final.
   - Versión y `versionCode` enviados.
   - Fecha/hora de subida y capturas de pantalla del estado de la consola.

> ✅ Después de publicar, vuelve al checklist inicial y marca los puntos completados para documentar el release.

---

## 🍎 iOS (App Store)

### 🧰 Requisitos esenciales (iOS)
- Mac con macOS actualizado (mínimo 15 GB libres).
- Cuenta Apple ID gratuita para pruebas locales y cuenta Apple Developer Program (99 USD/año) para distribuir en App Store/TestFlight.
- [Xcode](https://developer.apple.com/xcode/) (opción recomendada) o, para flujo sin IDE, Xcode Command Line Tools (`xcode-select --install`).
- Certificados y perfiles de aprovisionamiento vigentes (ver siguiente sección).
- Herramientas de línea de comandos útiles: `xcodebuild`, `xcrun`, [Transporter](https://apps.apple.com/app/transporter/id1450874784) o `fastlane`.

> ⚠️ Es obligatorio usar un Mac. Apple no permite compilar ni firmar apps iOS desde Windows o Linux.

### 🪪 Certificados y perfiles (una sola vez)
1. Ingresa a [Apple Developer](https://developer.apple.com/account/) con la cuenta del equipo.
2. En **Certificates, Identifiers & Profiles** crea o renueva:
   - Certificado **iOS Distribution** (`.cer`).
   - Identificador de la app (`Bundle ID`, p.ej., `com.tuempresa.drapery`).
   - Perfil de aprovisionamiento **App Store** y, opcionalmente, **Development** para pruebas en dispositivos.
3. Descarga los certificados y perfiles.
4. Haz doble clic en cada certificado y perfil para instalarlos en el llavero y en Xcode.
5. Crea un Apple ID alternativo o habilita la [contraseña específica de app](https://appleid.apple.com/) que usarás en Transporter o `xcrun altool`.

### 🛠️ Opcion A: Xcode (recomendado)
1. **Sincronizar el proyecto iOS**
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```
   Se abrirá `ios/App/App.xcworkspace` en Xcode.
2. **Actualizar herramientas**
   - App Store ▶ actualiza Xcode a la versión estable más reciente.
   - En Xcode, menú **Preferences > Locations** comprueba que `Command Line Tools` apunte a la versión actual.
   - Si ves el banner "Update to recommended settings", pulsa **Perform Changes**.
3. **Configurar firma automática**
   - Selecciona el proyecto (ícono azul) ► target `App` ► pestaña **Signing & Capabilities**.
   - Activa **Automatically manage signing**.
   - Elige tu `Team` y asegúrate de que el `Bundle Identifier` coincide con el creado en Apple Developer.
4. **Ajustar versión antes de compilar**
   - Pestaña **General > Identity**: actualiza `Version` (ej. 1.1.0.3) y `Build` (incrementa en +1 cada envío).
   - Menú **Product > Clean Build Folder** (`Shift + Cmd + K`).
5. **Probar la app**
   - **Simulador**: selecciona un dispositivo (p. ej., *iPhone 15*) en la barra superior y pulsa ▶.
   - **Dispositivo físico**:
     1. Conecta el iPhone por USB.
     2. En el iPhone, ve a *Settings > General > VPN & Device Management* y confía en tu Apple ID.
     3. En Xcode, selecciona el dispositivo real y pulsa ▶ (con Apple ID gratuito la build expira en 7 días).
6. **Crear un archivo de distribución (.ipa)**
   - Menú **Product > Archive**.
   - En el **Organizer**, selecciona la build ► **Distribute App**.
   - Elige **App Store Connect** ▶ **Upload** (para TestFlight/App Store) o **Export** (para Ad Hoc/Enterprise).
   - Sigue el asistente (firma, encriptación, bitcode). Al finalizar obtendrás un `.ipa` listo.
7. **Checklist rápido tras el archive**
   - Verifica que no haya advertencias en la pestaña **Issues**.
   - Guarda el `.xcarchive` en `~/Library/Developer/Xcode/Archives/<fecha>/` para futuras referencias.

### 💻 Opcion B: Solo terminal (sin Xcode)
Este flujo usa `xcodebuild` y Transporter. Necesitas haber instalado previamente los certificados/perfiles.

1. **Instalar herramientas CLI**
   ```bash
   xcode-select --install    # solo la primera vez
   sudo xcodebuild -license  # acepta la licencia
   ```
2. **Generar y sincronizar recursos**
   ```bash
   npm run build
   npx cap sync ios
   ```
3. **Crear el archivo `.xcarchive`**
   ```bash
   cd ios/App
   xcodebuild -scheme App \
     -configuration Release \
     -archivePath ../build/App.xcarchive archive
   ```
4. **Preparar `ExportOptions.plist`**
   En `ios/App/`, crea `ExportOptions.plist` con este contenido (ajusta `teamID` y `bundleIdentifier`):
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
     <dict>
       <key>method</key>
       <string>app-store</string>
       <key>teamID</key>
       <string>TEAMID1234</string>
       <key>bundleIdentifier</key>
       <string>com.tuempresa.drapery</string>
       <key>uploadBitcode</key>
       <false/>
       <key>compileBitcode</key>
       <false/>
       <key>signingStyle</key>
       <string>automatic</string>
     </dict>
   </plist>
   ```
5. **Exportar el `.ipa`**
   ```bash
   xcodebuild -exportArchive \
     -archivePath ../build/App.xcarchive \
     -exportOptionsPlist ExportOptions.plist \
     -exportPath ../build/export
   ```
   El archivo aparecerá en `ios/build/export/App.ipa`.
6. **Subir a App Store Connect sin Xcode**
   - Instala Transporter desde la App Store (abre `Applications/Transporter.app` una vez para iniciar sesión), o usa el CLI:
     ```bash
     xcrun altool --upload-app -t ios \
       -f ../build/export/App.ipa \
       -u <correo-apple-id> \
       -p <contraseña-específica-app>
     ```
   - Transporter mostrará "Upload Successful" cuando finalice.
7. **Verificar estado**
   - Ve a [App Store Connect](https://appstoreconnect.apple.com/) ▶ **My Apps** ▶ selecciona la app.
   - En la pestaña **Activity** aparecerá la build procesándose (puede tardar 10–30 minutos).

> 📝 Mantén respaldos del `ExportOptions.plist` y del `.xcarchive` junto con el `.ipa` para auditar versiones futuras.

### 🚀 TestFlight y App Store
1. Inicia sesión en [App Store Connect](https://appstoreconnect.apple.com/).
2. Ve a **My Apps > Drapery Calculator**.
3. En **TestFlight**:
   - Asegura que la build cambió a estado **Ready to Test**.
   - Crea un grupo interno y agrega correos Apple ID.
   - Envía invitaciones y solicita feedback estructurado.
4. Para publicar en App Store:
   - Completa las secciones de **App Information**, **Pricing and Availability** y **App Privacy**.
   - Sube screenshots requeridos (al menos iPhone 6.7", 6.5" y 5.5").
   - En **App Store > Prepare for Submission**, selecciona la build, añade notas para el revisor y pulsa **Submit for Review**.
   - Apple suele responder en 24–48 h. Supervisa el estado hasta ver **Ready for Sale**.
5. Documenta internamente la versión enviada (número de build, fecha, enlaces a `.ipa`, capturas del estado y cualquier requisito pendiente).

> ✅ Tras la aprobación, actualiza el changelog y comunica al equipo la fecha de publicación y enlaces de seguimiento.

### 📎 Recursos útiles
- [Guía oficial de envío a App Store](https://developer.apple.com/app-store/submissions/)
- [Documentación Capacitor iOS](https://capacitorjs.com/docs/ios)
- [Guía de ExportOptions.plist](https://help.apple.com/xcode/mac/current/#/dev3a05256b8)

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

> Nota: Las fracciones se redondean a incrementos de 1/8". Las yardas se calculan como `ceil(pulgadas_totales / 36)`.

1. **Cálculo base – Ripplefold 100% (1 panel, Regular)**
   - Width `100`, Width Fraction `0`
   - Height `84`, Height Fraction `0`
   - Product `Ripplefold`, Fullness `100%`
   - Fabric Width `54`, Return `6`, Opening `One way`, Railroad `No`, Vertical Repeat `0`
   - Resultado esperado:
     - Required Fabric: `14 yards`
     - Fabric Widths: `5`
     - Cuts: `5 x 94`
     - Orientation: `Regular`
     - Snaps: `52`

2. **Ripplefold 60% (2 paneles) con Railroad (aplicado)**
   - Width `144`, Height `96`, fracciones `0`
   - Product `Ripplefold`, Fullness `60%`
   - Fabric Width `108`, Opening `Center open`, Return `6`, Railroad `Yes`, Vertical Repeat `0`
   - Resultado esperado:
     - Orientation: `Railroad`
     - Required Fabric: `9 yards`
     - Fabric Widths: `1`
     - Cuts: `2 x 145 5/8`
     - Snaps: `62`

3. **Pinch Pleated 3.0 con fracciones**
   - Width `100`, Width Fraction `1/2`
   - Height `84`, Height Fraction `3/8`
   - Product `Pinch Pleated`, Fullness `3.0`
   - Fabric Width `54`, Opening `One way`, Return `6`, Railroad `No`, Vertical Repeat `0`
   - Resultado esperado:
     - Orientation: `Regular`
     - Required Fabric: `16 yards`
     - Fabric Widths: `6`
     - Cuts: `6 x 94 3/8`
     - Snaps: `N/A` (solo Ripplefold)

4. **Pinch Pleated 2.5 con Vertical Repeat y 2 paneles**
   - Width `120`, Height `90`, fracciones `0`
   - Product `Pinch Pleated`, Fullness `2.5`
   - Fabric Width `54`, Opening `Center open`, Return `6`, Railroad `No`, Vertical Repeat `10`
   - Resultado esperado:
     - Orientation: `Regular`
     - Required Fabric: `24 yards`
     - Fabric Widths: `7`
     - Cuts: `7 x 120`

5. **Ripplefold 120% (2 paneles) con Railroad (aplicado)**
   - Width `100`, Height `84`, fracciones `0`
   - Product `Ripplefold`, Fullness `120%`
   - Fabric Width `118`, Opening `Center open`, Return `6`, Railroad `Yes`, Vertical Repeat `0`
   - Resultado esperado:
     - Orientation: `Railroad`
     - Required Fabric: `8 yards`
     - Fabric Widths: `1`
     - Cuts: `2 x 136`
     - Snaps: `58`

6. **Fracciones y redondeo de corte**
   - Con orientación `Regular` (p.ej., Fabric `54`), ajustar Height a `83` + `5/8` y Vertical Repeat `0`.
   - Resultado esperado: `fabricCutLength = 93 5/8`.

7. **Efecto del Fabric Width**
   - Partiendo del Test 1, cambiar Fabric Width a `118`.
   - Resultado esperado:
     - Fabric Widths: `2`
     - Cuts: `2 x 94`
     - Required Fabric: `6 yards`

8. **Efecto del Return sobre el número de anchos**
   - Width `118`, Product `Ripplefold 100%`, Height `84`, Fabric `54`, Opening `One way`, Railroad `No`.
   - Caso A: `Return 0` → Fabric Widths `5`, Required Fabric `14 yards`.
   - Caso B: `Return 6` → Fabric Widths `6`, Required Fabric `16 yards`.

9. **Validaciones**
   - Dejar `Width` vacío → “Width is required”.
   - Ingresar `Width 50.5` (sin fracción) → “Width must be an integer value”.
   - Cambiar a `Pinch Pleated` y limpiar `Fullness` → “Pinch pleat fullness is required”.
   - No seleccionar `Opening` o `Allow Railroad` → error de campo requerido.

10. **Tema oscuro y persistencia**
   - Activar el toggle en Settings, recargar la página y confirmar persistencia.

11. **Gestos y navegación por tabs**
   - Deslizar horizontalmente para moverse entre Calculator ↔ History ↔ Settings (una pasada suave debe bastar).

12. **Historial**
   - Tras cada cálculo exitoso, abrir History y verificar que se agrega el registro con fecha y datos correctos.

13. **Orientación Railroad vs Regular**
   - **Railroad bloqueado (Regular)**
     - Entradas: Width 160, Height 108, Width Fraction 0, Height Fraction 0, Product Ripplefold (Fullness 100%), Fabric Width 118, Return 3, Hem 8, Opening: One Way y luego Center Open, Railroad: Sí.
     - Resultado esperado: Orientación **Regular** (por panelHeight = 118 >= fabric width), Fabric Widths 4, Fabric Cuts 4, Cut Length 118, Required Fabric 14 yards, Snaps 83 (One Way) / 84 (Center Open).
   - **Railroad permitido**
     - Entradas: Width 160, Height 109, Width Fraction 0, Height Fraction 0, Product Ripplefold (Fullness 100%), Fabric Width 118, Return 3, Hem 4, Opening: One Way, Railroad: Sí.
     - Resultado esperado: Orientación **Railroad**, Fabric Widths 1, Fabric Cuts 1, Cut Length 365, Required Fabric 11 yards, Snaps 83.

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


