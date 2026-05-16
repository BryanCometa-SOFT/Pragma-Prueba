# Pragma Technical Test — To-Do List App

Aplicación híbrida de lista de tareas construida con **Ionic 8 + Angular 20 + Capacitor 8** como parte de una prueba técnica para desarrollador mobile.

---

## Preguntas de la prueba

### 1. ¿Cuáles fueron los principales desafíos que enfrentaste al implementar las nuevas funcionalidades?

- **Decisión de arquitectura**: Elegir entre una estructura plana o modular (`core/` + `features/`). Opté por la modular porque demuestra preparación para proyectos enterprise sin caer en sobre-ingeniería para una app de este tamaño.

- **Ionic Storage como capa de persistencia**: Configurar correctamente la inicialización asíncrona con `APP_INITIALIZER` para que los datos estuvieran disponibles antes del primer render.

- **Manejo de fechas en serialización JSON**: Ionic Storage serializa a string. Implementé deserialización a `Date` en `TaskService.init()` para mantener la integridad de tipos.

- **Separación de responsabilidades**: Extraer `TaskFormComponent` y `CategoryFormComponent` como componentes independientes comunicados vía `ModalController.dismiss()`, manteniendo las páginas ligeras y enfocadas.

### 2. ¿Qué técnicas de optimización de rendimiento aplicaste y por qué?

- **Signals + computed() memoizados**: `filteredPendingTasks` y `filteredCategories` combinan búsqueda por texto y filtro por categoría en una sola señal computada que solo se recalcula si cambian sus dependencias. La búsqueda tiene **debounce de 300ms** para evitar recálculos mientras el usuario escribe.

- **Buscador por texto en tareas y categorías**: Filtrado O(n) sobre arrays en memoria con `computed()`, respuesta instantánea incluso con cientos de registros. Sin llamadas a servidor ni índices externos.

- **OnPush change detection**: Solo se re-renderiza el componente cuando una señal leída en el template cambia, eliminando ciclos innecesarios.

- **Lazy Loading + PreloadAllModules**: Los módulos de features se cargan bajo demanda (bundle inicial de solo **197 kB**), pero se precargan en segundo plano tras el primer render.

- **Persistencia fire-and-forget**: Las escrituras a Ionic Storage se disparan sin `await`, evitando bloquear el hilo principal. Ionic Storage usa SQLite/IndexedDB, asíncrono y no bloqueante.

- **SSE en lugar de polling para Remote Config**: `onConfigUpdate` mantiene una conexión Server-Sent Events que no consume batería ni datos en segundo plano. Firebase notifica cambios al instante, sin peticiones HTTP repetidas.

- **Angular Animations con triggers**: Las tareas entran/salen con fade + slide, y la sección de completadas usa fade in/out, todo manejado por el motor nativo de animaciones de Angular (sin librerías extra).

- **Pull-to-refresh**: Gesto nativo que fuerza una recarga inmediata de los feature flags sin esperar al listener SSE.

### 3. ¿Cómo aseguraste la calidad y mantenibilidad del código?

- **Código en inglés, documentación en español**: Convención clara y consistente.

- **Comentarios en español**: Cada clase, método y parámetro documenta su propósito y comportamiento.

- **Separación de responsabilidades**: Capa de infraestructura (`StorageService`), capa de negocio (`TaskService`, `CategoryService`), capa de presentación (páginas + componentes de formulario).

- **Mismo patrón en features replicables**: `TasksPage` y `CategoriesPage` siguen exactamente la misma estructura, facilitando el onboarding de nuevos desarrolladores.

- **Reactive Forms con validación**: Previene datos inválidos antes de llegar al modelo.

- **40 tests unitarios**: Cubriendo lógica de negocio (casos borde, IDs inválidos, trim), persistencia (corruptos, sin init), formularios (validación, crear vs editar) y orquestación (flujos CRUD completos con confirmaciones).

- **JSDoc completo (47 comentarios)**: Todas las clases, métodos públicos, propiedades inyectadas y señales tienen `@param`, `@returns` y descripción de su propósito en español.

- **ESLint 0 errores**: Siguiendo guía de estilo Angular (`prefer-inject`, `use-lifecycle-interface`).

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
│   ├── tasks/                     # Feature de gestión de tareas
│   │   ├── components/
│   │   │   └── task-form/         # Componente de formulario (modal crear/editar)
│   │   ├── tasks.page.ts          # Lista con filtro por categoría
│   │   ├── tasks.page.html
│   │   └── tasks.module.ts
│   │
│   └── categories/                # Feature de gestión de categorías
│       ├── components/
│       │   └── category-form/     # Formulario con selector de ícono
│       ├── categories.page.ts
│       ├── categories.page.html
│       └── categories.module.ts
│
├── shared/                        # Componentes reutilizables
│   └── components/
│
├── app.module.ts                  # APP_INITIALIZER + IonicStorageModule
├── app-routing.module.ts          # Lazy loading de features
└── app.component.ts               # Shell con ion-menu lateral
```

### Patrones de diseño empleados

| Patrón | Dónde | Propósito |
|---|---|---|
| **Singleton** | Servicios (`providedIn: 'root'`) | Única instancia compartida en toda la app |

| **Fachada (Facade)** | `StorageService` | Oculta complejidad de Ionic Storage tras `get/set/remove` |

| **Dependency Injection** | `inject()` en toda la app | Desacoplamiento total entre capas |

| **Lazy Loading** | `features/tasks/`, `features/categories/` | Carga bajo demanda de cada módulo |

| **APP_INITIALIZER** | `app.module.ts` | Inicialización asíncrona de datos antes del primer render |

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

### Configuración

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Agregar app **web** (`</>`) y copiar la configuración a `src/environments/environment.ts` y `src/environments/environment.prod.ts`
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
