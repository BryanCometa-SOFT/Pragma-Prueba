# Pragma Technical Test — To-Do List App

Aplicación híbrida de lista de tareas construida con **Ionic 8 + Angular 20 + Capacitor 8** como parte de una prueba técnica para desarrollador mobile.

---

## Preguntas de la prueba

### 1. ¿Cuáles fueron los principales desafíos que enfrentaste al implementar las nuevas funcionalidades?

- **Decisión de arquitectura**: Elegir entre una estructura plana o modular (`core/` + `features/`). Opté por la modular porque demuestra preparación para proyectos enterprise.

- **Ionic Storage como capa de persistencia**: Configurar correctamente la inicialización asíncrona con `provideAppInitializer` para que los datos estuvieran disponibles antes del primer render.

- **Manejo de fechas en serialización JSON**: Ionic Storage serializa a string. Implementé deserialización a `Date` en `TaskService.init()` para mantener la integridad de tipos.

- **Separación de responsabilidades**: Extraer `TaskFormComponent` y `CategoryFormComponent` como componentes independientes comunicados vía `ModalController.dismiss()`, manteniendo las páginas ligeras y enfocadas.

### 2. ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

- **Signals + computed() memoizados**: `filteredPendingTasks`, `filteredCategories`, `visiblePendingTasks` y `visibleCompletedTasks` combinan búsqueda, filtro e infinite scroll en señales computadas que solo se recalculan si cambian sus dependencias. La búsqueda tiene **debounce de 300ms**.

- **Infinite Scroll nativo (ion-infinite-scroll)**: Solo se renderizan 20 tareas pendientes, 10 completadas y 10 categorías por vez. El resto carga bajo demanda al hacer scroll. Con 10,000 registros el DOM sigue teniendo 20 nodos.

- **OnPush change detection**: Solo se re-renderiza el componente cuando una señal leída en el template cambia.

- **Lazy Loading + PreloadAllModules**: Los módulos se cargan bajo demanda (bundle inicial de solo **197 kB**), precargándose en segundo plano.

- **Persistencia fire-and-forget**: Las escrituras a Ionic Storage se disparan sin `await`. Ionic Storage usa SQLite/IndexedDB, asíncrono y no bloqueante.

- **SSE en lugar de polling para Remote Config**: `onConfigUpdate` mantiene una conexión Server-Sent Events. Cero consumo de batería/datos en segundo plano. Sin riesgo de throttling.

- **Angular Animations nativas**: Las tareas entran/salen con fade + slide.

- **Pull-to-refresh**: Gesto nativo que fuerza recarga inmediata de feature flags.

### 3. ¿Cómo aseguraste la calidad y mantenibilidad del código?

- **Separación de responsabilidades**: Capa de infraestructura (`StorageService`), capa de negocio (`TaskService`, `CategoryService`), capa de presentación (páginas + formularios modales).

- **Mismo patrón en features replicables**: `TasksPage` y `CategoriesPage` siguen la misma estructura.

- **Reactive Forms con validación**: Previene datos inválidos antes de llegar al modelo.

- **40 tests unitarios**: Lógica de negocio (casos borde, IDs inválidos, trim), persistencia (corruptos, sin init), formularios (validación, crear vs editar) y flujos CRUD completos con confirmaciones.

- **JSDoc completo (47 comentarios)**: Clases, métodos, propiedades y señales con `@param`, `@returns` y descripción.

- **ESLint 0 errores**: Guía de estilo Angular (`prefer-inject`, `use-lifecycle-interface`).

- **APIs modernas Angular 19+**: `provideAppInitializer`, `provideAnimations`, `inject()`.

---

## Instalación y ejecución

### Requisitos previos

- Node.js 18+
- npm 9+
- Angular CLI 20 (`npm install -g @angular/cli`)
- Android Studio (para APK)
- Xcode (para IPA, solo macOS)

```bash
npm install      # Instalar dependencias
npm start        # Ejecutar en http://localhost:4200 (carga 100 tareas + 5 categorías de prueba)
npm test         # Ejecutar 40 tests unitarios
npm run lint     # Ejecutar ESLint
```

---

## Compilación para Android e iOS

> Las carpetas `android/` e `ios/` **no se versionan** en el repositorio.
> Se regeneran con los comandos de abajo.

### Generar las plataformas nativas (solo la primera vez)

```bash
npx cap add android    # Genera la carpeta android/
npx cap add ios        # Genera la carpeta ios/
```

### Flujo completo de compilación

```bash
npm run build -- --configuration production   # Build web
npx cap sync                                   # Copia el build a las plataformas
```

### Android (APK)

```bash
npx cap open android
```

En Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`

### iOS (IPA — solo macOS)

```bash
npx cap open ios
```

En Xcode: `Product > Archive`

> Si no disponés de macOS: [AppFlow](https://ionic.io/appflow), [CodeMagic](https://codemagic.io/) o [MacStadium](https://www.macstadium.com/).

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| UI Framework | Ionic 8 |
| Frontend | Angular 20 (NgModule, Signals) |
| Mobile runtime | Capacitor 8 |
| Persistencia local | Ionic Storage (SQLite en iOS/Android, IndexedDB en Web) |
| Feature flags | Firebase Remote Config |
| Formularios | Reactive Forms + Validators |
| Testing | Karma + Jasmine (40 tests) |
| Linting | ESLint (angular-eslint) |

---

## Arquitectura del proyecto

```
src/app/
├── core/                          # Capa de infraestructura (singletons globales)
│   ├── models/
│   │   ├── task.model.ts          # Interfaz Task
│   │   └── category.model.ts      # Interfaz Category
│   └── services/
│       ├── storage.service.ts     # Fachada sobre Ionic Storage (SQLite/IndexedDB)
│       ├── task.service.ts        # Lógica de negocio de tareas con Signals
│       ├── category.service.ts    # Lógica de negocio de categorías con Signals
│       └── remote-config.service.ts  # Firebase Remote Config (feature flags)
│
├── features/                      # Módulos lazy-loaded
│   ├── tasks/                     # Gestión de tareas
│   │   ├── components/
│   │   │   └── task-form/         # Modal crear/editar tarea
│   │   ├── tasks.page.ts          # Lista con filtros, búsqueda e infinite scroll
│   │   ├── tasks.page.html
│   │   └── tasks.module.ts
│   │
│   └── categories/                # Gestión de categorías
│       ├── components/
│       │   └── category-form/     # Modal con selector de ícono
│       ├── categories.page.ts
│       ├── categories.page.html
│       └── categories.module.ts
│
├── app.module.ts                  # provideAppInitializer + provideAnimations
├── app-routing.module.ts          # Lazy loading de features
└── app.component.ts               # Shell con ion-menu lateral
```

### Patrones de diseño empleados

| Patrón | Dónde | Propósito |
|---|---|---|
| **Singleton** | Servicios (`providedIn: 'root'`) | Única instancia compartida |
| **Fachada (Facade)** | `StorageService` | Oculta complejidad de Ionic Storage tras `get/set/remove` |
| **Dependency Injection** | `inject()` en toda la app | Desacoplamiento total entre capas |
| **Lazy Loading** | `features/tasks/`, `features/categories/` | Carga bajo demanda |
| **provideAppInitializer** | `app.module.ts` | Inicialización asíncrona antes del primer render |

---

## Funcionalidades implementadas

- [x] CRUD completo de tareas: crear, editar, completar, eliminar
- [x] CRUD completo de categorías: crear, editar, eliminar
- [x] Asignación de categoría a tareas desde el formulario
- [x] Filtro de tareas por categoría con chips interactivos
- [x] Buscador por texto en tareas (título + descripción) con debounce de 300ms
- [x] Buscador por texto en categorías (nombre) con debounce de 300ms
- [x] Formularios reactivos con validación (título requerido, mínimo 3 caracteres)
- [x] Secciones Pendientes / Completadas con estados vacíos por sección
- [x] Botones de acción con feature flags: completar ✓, editar ✏️, eliminar 🗑️, crear +
- [x] Confirmaciones vía AlertController antes de completar o eliminar
- [x] Regla de negocio: tarea completada no se edita ni se elimina
- [x] Metadata visible: ID abreviado + fecha de creación/completado
- [x] Modal centrado vía ModalController para crear/editar
- [x] Menú lateral (`ion-menu`) con navegación entre Tareas y Categorías
- [x] Firebase Remote Config con 5 feature flags + listener en tiempo real (SSE)
- [x] Transiciones animadas (fade + slide) al crear, completar y eliminar tareas
- [x] Pull-to-refresh para forzar recarga de feature flags
- [x] `ChangeDetectionStrategy.OnPush` + Signals + `computed()` memoizados
- [x] Lazy Loading + PreloadAllModules (bundle inicial: 197 kB)
- [x] Infinite scroll: 20 pendientes, 10 completadas y 10 categorías por vez (carga bajo demanda)
- [x] 100 tareas de prueba + 5 categorías precargadas al iniciar por primera vez (seed data)
- [x] Ordenamiento por fecha: más nuevas primero en pendientes y completadas
- [x] Limpieza automática de filtros al crear una tarea nueva
- [x] Tema claro forzado (sin modo oscuro) + inputs con borde azul al foco
- [x] 40 tests unitarios + ESLint 0 errores
- [x] 47 JSDoc documentando todas las clases, métodos y propiedades

---

## Instalación y ejecución

### Requisitos previos

- Node.js 18+
- npm 9+
- Angular CLI 20 (`npm install -g @angular/cli`)
- Android Studio (para APK)
- Xcode (para IPA, solo macOS)

```bash
npm install      # Instalar dependencias
npm start        # Ejecutar en http://localhost:4200
npm test         # Ejecutar 40 tests unitarios
npm run lint     # Ejecutar ESLint
```

---

## Compilación para Android e iOS

> Las carpetas `android/` e `ios/` **no se versionan** en el repositorio.
> Se regeneran con los comandos de abajo y contienen los proyectos nativos
> (Android Studio / Xcode).

### Generar las plataformas nativas (solo la primera vez)

```bash
npx cap add android    # Genera la carpeta android/
npx cap add ios        # Genera la carpeta ios/
```

### Flujo completo de compilación

```bash
npm run build -- --configuration production   # Build web
npx cap sync                                   # Copia el build a las plataformas
```

### Android (APK)

```bash
npx cap open android
```

En Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`

### iOS (IPA — solo macOS)

```bash
npx cap open ios
```

En Xcode: `Product > Archive`

> Si no disponés de macOS: [AppFlow](https://ionic.io/appflow), [CodeMagic](https://codemagic.io/) o [MacStadium](https://www.macstadium.com/).

---

## Firebase Remote Config

> **Importante**: Las credenciales de Firebase **no están incluidas** en este repositorio público por seguridad. Si se expusieran, cualquier persona podría consumir recursos de mi proyecto (costos, cuotas de uso, throttling). Quien evalúe esta prueba debe crear su propio proyecto en Firebase Console y configurar las credenciales.

### Configuración

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Agregar app **web** (`</>`), copiar el objeto `firebaseConfig` y pegarlo en `src/environments/environment.ts` (desarrollo) y `src/environments/environment.prod.ts` (producción). Ambos archivos están en `.gitignore`.
3. En **Remote Config** (menú lateral → DevOps y participación), crear los siguientes parámetros booleanos:

| Parámetro | Default | Efecto cuando `false` |
|---|---|---|
| `enable_create` | `true` | Oculta el botón FAB (+) en tareas y categorías |
| `enable_edit` | `true` | Oculta botón ✏️ en tareas y categorías |
| `enable_delete` | `true` | Oculta botón 🗑️ en tareas y categorías |
| `enable_complete` | `true` | Oculta botón ✓ de completar en tareas |
| `enable_categories` | `true` | Oculta la sección Categorías del menú lateral y filtro |

### Listener en tiempo real (SSE)

La app usa `onConfigUpdate` (Server-Sent Events) en lugar de polling:

- Firebase **notifica al instante** cuando publicás un cambio en la consola
- **Cero consumo** de batería y datos en segundo plano
- Sin riesgo de throttling por peticiones repetidas
- Fallback: si SSE no está disponible, cache de 12 horas

### Demo del feature flag

1. Publicar los parámetros con todos en `true`
2. Abrir la app → todos los botones y secciones visibles
3. Cambiar `enable_delete` a `false` en Firebase Console → **Publicar cambios**
4. La app recibe la notificación por SSE y el botón 🗑️ desaparece **al instante**, sin reiniciar

---
