# Pragma Technical Test — To-Do List App

Aplicación híbrida de lista de tareas construida con **Ionic 8 + Angular 20 + Capacitor 8** como parte de una prueba técnica para desarrollador mobile.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| UI Framework | Ionic 8 |
| Frontend | Angular 20 (NgModule, Signals) |
| Mobile runtime | Capacitor 8 |
| Persistencia local | Ionic Storage (SQLite en iOS/Android, IndexedDB en Web) |
| Formularios | Reactive Forms + Validators |
| Testing | Karma + Jasmine |
| Linting | ESLint (angular-eslint) |

---

## Arquitectura del proyecto

```
src/app/
├── core/                          # Capa de infraestructura (singletons globales)
│   ├── models/
│   │   └── task.model.ts          # Interfaz Task
│   └── services/
│       ├── storage.service.ts     # Fachada sobre Ionic Storage (SQLite/IndexedDB)
│       └── task.service.ts        # Lógica de negocio con Signals
│
├── features/                      # Módulos lazy-loaded
│   └── tasks/                     # Feature de gestión de tareas
│       ├── components/
│       │   └── task-form/         # Componente de formulario (modal crear/editar)
│       ├── tasks.page.ts          # Página principal de la lista
│       ├── tasks.page.html        # Template con secciones Pendientes/Completadas
│       ├── tasks.page.scss
│       ├── tasks.module.ts
│       └── tasks-routing.module.ts
│
├── shared/                        # Componentes reutilizables (vacío por ahora)
│   └── components/
│
├── app.module.ts                  # APP_INITIALIZER + IonicStorageModule
├── app-routing.module.ts          # Lazy loading de features
└── app.component.ts               # Shell de la aplicación
```

### Patrones de diseño empleados

| Patrón | Dónde | Propósito |
|---|---|---|
| **Singleton** | `StorageService`, `TaskService` (`providedIn: 'root'`) | Única instancia compartida en toda la app |
| **Fachada (Facade)** | `StorageService` | Oculta la complejidad de Ionic Storage tras `get/set/remove` |
| **Dependency Injection** | Vía `inject()` en toda la app | Desacoplamiento total entre capas |
| **Lazy Loading** | `features/tasks/` | Carga bajo demanda del módulo de tareas |
| **APP_INITIALIZER** | `app.module.ts` | Inicialización asíncrona de datos antes del primer render |

---

## Funcionalidades implementadas (Etapa 1 — Base To-Do List)

- [x] Arquitectura modular `core/` + `features/`
- [x] Persistencia local con Ionic Storage (SQLite/IndexedDB)
- [x] CRUD completo de tareas: crear, editar, completar, eliminar
- [x] Formularios reactivos con validación (título requerido, mínimo 3 caracteres)
- [x] Secciones Pendientes / Completadas con estados vacíos
- [x] Botones de acción visibles: completar, editar, eliminar
- [x] Confirmaciones vía AlertController antes de completar o eliminar
- [x] Regla de negocio: tarea completada no se edita ni se elimina
- [x] Metadata visible por tarea: ID abreviado + fecha de creación/completado
- [x] Modal centrado vía ModalController para crear/editar
- [x] 29 tests unitarios + lint 0 errores

### Pendiente por implementar

- [ ] Categorías: CRUD de categorías, asignación a tareas, filtrado
- [ ] Firebase + Remote Config: feature flag para funcionalidad específica
- [ ] Optimización de rendimiento (OnPush, trackBy, virtual scroll)
- [ ] Exportación de APK e IPA

---

## Instalación y ejecución

### Requisitos previos

- Node.js 18+
- npm 9+
- Angular CLI 21 (`npm install -g @angular/cli`)

### Instalar dependencias

```bash
npm install
```

### Ejecutar en el navegador (desarrollo)

```bash
npm start
```

Abre `http://localhost:4200` en el navegador.

### Ejecutar tests

```bash
npm test
```

### Ejecutar lint

```bash
npm run lint
```

---

## Compilación para Android e iOS

### Requisitos adicionales

- **Android**: Android Studio + SDK de Android
- **iOS**: macOS + Xcode (obligatorio para generar IPA)

### Android (APK)

```bash
# Sincronizar proyecto con Capacitor
npx cap sync android

# Abrir en Android Studio y compilar
npx cap open android
```

En Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`

### iOS (IPA — solo macOS)

```bash
# Sincronizar proyecto con Capacitor
npx cap sync ios

# Abrir en Xcode y compilar
npx cap open ios
```

En Xcode: seleccionar dispositivo/simulador > `Product > Archive`

> **Nota**: Si no disponés de macOS, alternativas para generar IPA:
> - [AppFlow](https://ionic.io/appflow) (servicio cloud de Ionic)
> - [CodeMagic](https://codemagic.io/) (CI/CD para apps móviles)
> - [MacStadium](https://www.macstadium.com/) (Mac en la nube)

---

## Preguntas de la prueba

### 1. ¿Cuáles fueron los principales desafíos?

- **Separación de responsabilidades**: Decidir la estructura de carpetas (`core/` + `features/`) que fuera suficientemente escalable sin caer en sobre-ingeniería para una app de este tamaño.
- **Ionic Storage como capa de persistencia**: Configurar correctamente la inicialización asíncrona con `APP_INITIALIZER` para que los datos estuvieran disponibles antes del primer render, evitando lógica en constructores.
- **Manejo de fechas en serialización JSON**: Las fechas se convierten a string al guardar en Ionic Storage, por lo que fue necesario deserializarlas a `Date` al cargar los datos.
- **Separar el formulario de la página principal**: Extraer `TaskFormComponent` y comunicarlo vía `ModalController.dismiss()` mantuvo las responsabilidades claras y el código testeable.

### 2. ¿Qué técnicas de optimización de rendimiento aplicaste?

- **Signals en lugar de RxJS**: Uso de `signal()` y `computed()` para reactividad granular. Las señales computadas (`pendingCount`, `completedCount`) solo se recalculan cuando `tasks` cambia.
- **Lazy Loading**: El módulo `TasksPageModule` se carga bajo demanda, reduciendo el bundle inicial.
- **APP_INITIALIZER**: Los datos se cargan antes del render, eliminando flickers o spinners innecesarios al iniciar.
- **Persistencia fire-and-forget**: Las escrituras a Ionic Storage se disparan sin `await`, evitando bloquear la UI mientras se persiste.
- **Ionic Storage con SQLite/IndexedDB**: Operaciones asíncronas no bloqueantes, a diferencia de `localStorage` que es síncrono.

### 3. ¿Cómo aseguraste la calidad y mantenibilidad del código?

- **Comentarios en español** documentando propósito y comportamiento de cada clase, método y parámetro.
- **Separación de responsabilidades**: `StorageService` (infraestructura), `TaskService` (negocio), `TasksPage` (orquestación), `TaskFormComponent` (formulario).
- **Reactive Forms con validación**: Previene datos inválidos en el modelo.
- **29 tests unitarios** cubriendo lógica de negocio, persistencia, formularios y flujos de CRUD.
- **ESLint 0 errores** siguiendo la guía de estilo de Angular (`prefer-inject`, `use-lifecycle-interface`).
- **Código en inglés, documentación en español**: Convenciones claras para variables/servicios vs comentarios.

---

## Historial de commits

| Commit | Descripción |
|---|---|
| `Initial commit` | Template base de Ionic Angular (blank starter) |
| *Próximo* | feat: implementar arquitectura base, persistencia y CRUD de tareas |

---

## Autor

Desarrollado por Bryan Cometa como parte de una prueba técnica para Pragma.
