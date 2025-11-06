# Drapery Calculator — Technical Documentation (v1.1.0.2)

> Última actualización: 04-nov-2025 | Repositorios: GitHub (sandbox) y Azure DevOps (producción)

## 1. Panorama General
/ Aplicación móvil hecha con **Vue 3 + Ionic Vue 8 + Capacitor** que calcula telas necesarias para cortinería **Ripplefold** y **Pinch Pleated**. 
/ Funciona 100% offline, persiste historial en `localStorage` y ofrece tema claro/oscuro.
/ Se mantiene la lógica matemática del proyecto Angular original, ahora con un UI moderno (TailwindCSS) y flujos UX mejorados.

### Arquitectura
| Capa | Descripción |
|------|-------------|
| **Frontend** | Vue 3 (Composition API) + Ionic. La vista principal está en `src/views/Tab1Page.vue` y usa `@vuelidate` para validaciones. |
| **Estado** | Reactivo (Composition API). No se usa Vuex/Pinia. |
| **Persistencia local** | `localStorage` para historial y preferencias (tema). |
| **Build nativo** | Capacitor genera contenedores Android/iOS (`android/`, `ios/`). |

## 2. Funcionalidades vigentes
### Calculadora de Telas
- Entradas: ancho/alto (con fracciones 1/8 a 7/8), tipo de producto, fullness, return, railroad, vertical repeat.
- Salida: yardas requeridas, número de anchos, cortes, longitud de corte, orientación y snaps (solo Ripplefold).
- Modal de resultados con animaciones, iconografía y botón de **copiar** todo el resumen al portapapeles.

### Historial
- Guarda hasta 50 resultados (orden cronológico inverso).
- Posibilidad de borrar ítems individuales.

### Ajustes
- Toggle Tema Oscuro con persistencia en `localStorage` y aplicación global (`html.dark`).
- Información de versión actual (`v1.1.0.2`).

### Accesibilidad y UX
- Botones/campos más grandes (friendly mobile).
- Radio buttons con “fila completa clicable”.
- Mensajes de validación en tiempo real.

Para el listado detallado de features y roadmap revisar `docs/FEATURES.md` y `docs/Futuras-Implementaciones.md`.

## 3. Mejoras relevantes (v1.1.0.2)
Resumen extraído de `docs/MEJORAS.md`:

- Tema oscuro completamente funcional (aplica clases `dark` en `<html>` y `ion-app`).
- ResultModal rediseñado con gradientes, animaciones y CTA de copiado.
- Toast/banner visual después de copiar resultados.
- Validaciones inmediatas con `@ionBlur`, `@ionInput`, `@ionChange`.
- Versión y branding actualizados en UI y `package.json`.
- Optimización de animaciones, transiciones y estados `hover/focus`.

## 4. Guía de QA y Pruebas
La suite manual completa vive en el README raíz (`Pruebas manuales recomendadas`). Se resumen los casos clave:

1. **Ripplefold 100%** — 1 panel (Regular) → Required Fabric `14 yds`, `Fabric Widths 5`, `Snaps 52`.
2. **Ripplefold 60% + Railroad** — 2 paneles → `Orientation Railroad`, `Fabric Widths 1`, `Required Fabric 9 yds`.
3. **Pinch Pleated 3.0** con fracciones → `Fabric Widths 6`, `Cut Length 94 3/8`.
4. **Pinch Pleated 2.5 + Vertical Repeat** → `Required Fabric 24 yds`.
5. **Ripplefold 120% + Railroad** → `Required Fabric 8 yds`, `Snaps 58`.
6. **Fracciones y redondeo** — Altura 83 5/8 → `fabricCutLength 93 5/8`.
7. **Cambio de Fabric Width** — 54 → 118 disminuye yardas a 6.
8. **Effect del Return** — 0 vs 6 cambia anchos de 5 a 6.
9. **Validaciones** — campos obligatorios, enteros, fullness PP, opening/railroad.
10. **Tema oscuro persistente**.
11. **Gestos/tab bar** — swipes suaves entre Calculator/History/Settings.
12. **Historial** — se agregan registros tras cada cálculo.

### Paso a paso sugerido para QA
- `npm install`
- `npm run lint`
- `npm run build`
- `npm run dev -- --host=0.0.0.0 --port=5173` para pruebas en red/phone.
- Ejecutar los 12 casos anteriores (marcar evidencias en Azure DevOps o Notion del proyecto).

## 5. Build & Deploy

### Requisitos previos
- Node.js 18 LTS o 20 LTS, Git, Android Studio (incluye JDK 17), Xcode (Mac) si se compila iOS.

### Web / QA interno
```bash
npm install
npm run build
```
La carpeta `dist/` se despliega automáticamente a GitHub Pages mediante workflow (`.github/workflows/deploy.yml`).

### Android
```bash
npm run build
npx cap sync android
npx cap open android
```
Desde Android Studio: sincronizar, configurar keystore y generar `.aab` (ver README raíz sección Android).

### iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
```
En Xcode: actualizar perfiles de firma, `Product > Archive`, distribuir vía TestFlight/App Store.

### Repositorios y flujo Git
- **GitHub (`origin`)**: sandbox / despliegue a Pages.
- **Azure DevOps (`azure`)**: código productivo.
- Rama principal: `main`.
- Rama de trabajo actual: `Drapery-Calculator-Vue` (subida a ambos remotos). 
- Pull Request: crear en Azure contra `main` usando la descripción provista.

## 6. Checklist de liberación sugerido
1. Actualizar versión (`package.json`, Settings UI) y fecha en docs.
2. Ejecutar `npm run lint` y `npm run build` sin errores.
3. Correr suite manual (12 casos) y adjuntar evidencias.
4. `npx cap sync` + abrir los proyectos nativos para asegurar que compilan.
5. Generar `app-release.aab` y `archive` iOS (si aplica).
6. Actualizar `docs/CHANGELOG.md` y `README.md` con cambios relevantes.
7. Abrir PR en Azure DevOps, asignar reviewers y linkear work items.

## 7. Documentos relacionados
- `README.md` (raíz): guía paso a paso para miembros del equipo.
- `docs/MEJORAS.md`: historial de mejoras recientes.
- `docs/FEATURES.md`: lista de features actuales/futuros.
- `docs/Futuras-Implementaciones.md`: plan de monetización y roadmap.
- `docs/CHANGELOG.md`: versiones publicadas.

Mantén este documento actualizado en cada release para reflejar cambios de arquitectura, procesos o QA.
