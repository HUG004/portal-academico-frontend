# Portal Académico SII — Frontend
- Rivera Morales Hugo Baruch
- Silva Mendez Abraham

Aplicación web desarrollada con **React y Vite** para la consulta y administración de información académica del Tecnológico Nacional de México, campus Celaya.

El sistema proporciona dos interfaces principales: un **portal estudiantil**, donde los alumnos pueden consultar su información académica, y un **panel administrativo**, desde el cual se gestiona la información de profesores, materias y horarios.

El frontend consume una API REST desarrollada con Laravel, alojada en Render, mientras que la interfaz web está desplegada en Vercel.

## 1. Enlaces del proyecto

| Recurso | Enlace |
|---|---|
| Frontend en producción | https://portal-academico-sii.vercel.app |
| Repositorio frontend | https://github.com/HUG004/portal-academico-frontend |
| API backend | https://portal-academico-sii.onrender.com |
| Repositorio backend | https://github.com/4bram/Portal-academico-SII |

## 2. Tecnologías utilizadas

### React

React es una biblioteca de JavaScript utilizada para desarrollar interfaces de usuario mediante componentes reutilizables.

En este proyecto se utiliza para construir las pantallas del portal, gestionar los formularios, actualizar dinámicamente la información y controlar el estado de autenticación.

### Vite

Vite es una herramienta de desarrollo y compilación para aplicaciones web modernas.

Se utiliza para iniciar el servidor de desarrollo, actualizar rápidamente los cambios mediante HMR y generar los archivos optimizados para producción.

### Otras tecnologías

| Tecnología | Función |
|---|---|
| JavaScript y JSX | Programación de componentes |
| React Router | Navegación y rutas protegidas |
| Axios | Consumo de la API REST |
| Context API | Gestión del estado de autenticación |
| CSS | Diseño y estilos responsivos |
| Lucide React | Iconografía |
| Laravel | Backend y API REST |
| PostgreSQL / Supabase | Persistencia de información en el backend |
| Vercel | Despliegue del frontend |
| Render | Alojamiento del backend |
| Git y GitHub | Control de versiones |

## 3. Funcionalidades implementadas

### Portal estudiantil

El estudiante puede iniciar sesión utilizando sus credenciales y acceder a los siguientes módulos:

- **Inicio:** información general del estudiante, promedio y créditos académicos.
- **Perfil:** visualización de datos personales y académicos.
- **Calificaciones:** consulta de calificaciones y filtrado por periodo.
- **Kardex:** historial de materias y resultados académicos.
- **Horarios:** consulta del horario semanal de clases.
- **Directorio de profesores:** búsqueda y consulta de información de docentes, materias y horarios.
- **Cierre de sesión:** eliminación de la autenticación almacenada en el navegador.

### Panel administrativo

El administrador dispone de un acceso independiente para realizar operaciones de gestión académica:

- Inicio de sesión administrativo.
- Panel principal con indicadores generales.
- Consulta y búsqueda de profesores.
- Registro de nuevos profesores.
- Actualización de información de profesores.
- Eliminación de profesores.
- Asignación, edición y eliminación de materias.
- Registro, edición y eliminación de horarios.
- Validación de horarios mediante controles de selección.
- Protección de las rutas administrativas.
- Cierre de sesión.

Las operaciones CRUD se realizan mediante peticiones HTTP a la API REST.

## 4. Requisitos previos

Para ejecutar el frontend localmente es necesario contar con:

- Node.js instalado.
- npm.
- Git.
- Un editor de código, como Visual Studio Code.
- Conexión a Internet para utilizar la API desplegada.

## 5. Instalación del proyecto

### Paso 1. Clonar el repositorio

```bash
git clone https://github.com/HUG004/portal-academico-frontend.git
```

### Paso 2. Acceder a la carpeta

```bash
cd portal-academico-frontend
```

### Paso 3. Instalar dependencias

```bash
npm install
```

Este comando instala las dependencias declaradas en `package.json`.

### Paso 4. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Para consumir el backend desplegado:

```env
VITE_API_URL=https://portal-academico-sii.onrender.com/api
```

Si el backend se está ejecutando localmente:

```env
VITE_API_URL=http://localhost:8001/api
```

La URL debe apuntar al servidor que contiene los endpoints de la API.

**Nota:** el archivo `.env` no debe contener contraseñas, tokens privados ni credenciales de base de datos. Las variables `VITE_` son accesibles desde el código del navegador.

### Paso 5. Ejecutar el proyecto

```bash
npm run dev
```

Abrir en el navegador:

http://localhost:5173

### Paso 6. Generar la versión de producción

```bash
npm run build
```

Vite genera la carpeta `dist/`, que contiene los archivos optimizados para producción.

Para comprobar la compilación localmente:

```bash
npm run preview
```

## 6. Estructura principal del frontend

La aplicación se organiza en componentes, páginas, servicios y contextos de autenticación.

```text
portal-academico-frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── clienteApi.js
│   │   └── adminApi.js
│   ├── components/
│   ├── context/
│   ├── pages/
│   │   └── admin/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

**Responsabilidad de las principales partes:**

- `src/api/`: centraliza las peticiones HTTP y el envío de tokens.
- `src/components/`: contiene componentes reutilizables de la interfaz.
- `src/context/`: administra el estado de autenticación.
- `src/pages/`: contiene las pantallas del portal.
- `src/pages/admin/`: agrupa las páginas del panel administrativo.
- `src/styles/`: contiene los estilos visuales.
- `src/App.jsx`: define las rutas de navegación.
- `src/main.jsx`: inicia la aplicación React.
- `vercel.json`: configura la navegación SPA en producción.

## 7. Comunicación con la API REST

El frontend utiliza Axios para enviar solicitudes HTTP al backend.

La URL base se obtiene de una variable de entorno:

```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

Las peticiones permiten obtener información académica y ejecutar operaciones administrativas.

Los principales métodos HTTP utilizados son:

| Método | Propósito |
|---|---|
| GET | Consultar información |
| POST | Iniciar sesión o registrar información |
| PUT | Actualizar registros |
| DELETE | Eliminar registros |

Las respuestas del backend se procesan para actualizar los componentes de React.

## 8. Autenticación y gestión de sesiones

El sistema implementa autenticación basada en tokens para controlar el acceso a las funciones protegidas.

### 8.1 Inicio de sesión

1. El usuario introduce sus credenciales.
2. React envía una petición al endpoint de autenticación.
3. Laravel valida las credenciales.
4. Si son correctas, el backend devuelve un token.
5. React almacena el token temporalmente en `sessionStorage`.
6. El usuario puede acceder a las rutas autorizadas.

### 8.2 Almacenamiento de tokens

El frontend utiliza `sessionStorage` para conservar la credencial durante la sesión de navegación.

Las claves utilizadas son:

| Usuario | Clave |
|---|---|
| Estudiante | `token` |
| Administrador | `admin_token` |

Ejemplo de almacenamiento:

```javascript
sessionStorage.setItem('admin_token', token);
```

Ejemplo de recuperación:

```javascript
const token = sessionStorage.getItem('admin_token');
```

`sessionStorage` conserva la información al recargar la página, pero normalmente la elimina cuando termina la sesión de la pestaña.

### 8.3 Envío del token

Las peticiones autenticadas incluyen el token mediante el encabezado HTTP:

```http
Authorization: Bearer TOKEN
```

Axios permite agregar automáticamente esta información a las solicitudes.

El backend valida la credencial antes de permitir el acceso a los recursos protegidos.

### 8.4 Protección de rutas

React Router y los contextos de autenticación permiten restringir la navegación a usuarios autenticados.

Cuando no existe una sesión local válida, el usuario es redirigido a la pantalla de inicio de sesión correspondiente.

La protección del frontend complementa la validación de seguridad realizada por el backend.

### 8.5 Cierre de sesión

Cuando el usuario cierra sesión, el frontend elimina el token almacenado y actualiza el estado de autenticación.

Ejemplo:

```javascript
sessionStorage.removeItem('admin_token');
```

Después, el usuario regresa a la pantalla de inicio de sesión.

**Consideración de seguridad:** eliminar el token del navegador no equivale a revocarlo en el servidor. La invalidación definitiva del token requiere que el backend implemente y ejecute el mecanismo de revocación correspondiente.

Por ello, la revocación del lado del servidor debe verificarse de forma independiente para los accesos estudiantiles y administrativos.

## 9. Capturas de pantalla del funcionamiento

Las siguientes evidencias muestran las principales funciones del sistema.

### Captura 1. Inicio de sesión estudiantil

![Inicio de sesión estudiantil](portal-academico-frontend\docs\capturas\cap1.png)

Formulario de autenticación para ingresar al portal académico.

### Captura 2. Panel principal del estudiante

![Dashboard estudiantil](portal-academico-frontend\docs\capturas\cap2.png)

Visualización de los datos generales del estudiante y su información académica.

### Captura 3. Consulta de calificaciones

![Calificaciones](portal-academico-frontend\docs\capturas\cap3.png)

Consulta de calificaciones y filtrado por periodo.

### Captura 4. Kardex académico

![Kardex](portal-academico-frontend\docs\capturas\cap4.png)

Historial de asignaturas y resultados académicos.

### Captura 5. Horario estudiantil

![Horarios](portal-academico-frontend\docs\capturas\cap5.png)

Visualización de las materias y horarios de clase.

### Captura 6. Directorio de profesores

![Directorio de profesores](portal-academico-frontend\docs\capturas\cap6.png)

Búsqueda y consulta de profesores.

### Captura 7. Inicio de sesión administrativo

![Login administrativo](portal-academico-frontend\docs\capturas\cap7.png)

Acceso independiente al panel de administración.

### Captura 8. Dashboard administrativo

![Dashboard administrativo](portal-academico-frontend\docs\capturas\cap8.png)

Indicadores generales de profesores, materias y horarios.

### Captura 9. Gestión de profesores

![CRUD de profesores](portal-academico-frontend\docs\capturas\cap9.png)

Registro, consulta, edición y eliminación de profesores.

### Captura 10. Gestión de materias y horarios

![Gestión académica](portal-academico-frontend\docs\capturas\cap10-1.png)
![Gestión académica](portal-academico-frontend\docs\capturas\cap10-2.png)

Administración de asignaturas y horarios asociados a los profesores.

### Captura 11. Aplicación desplegada

![Despliegue en Vercel](portal-academico-frontend\docs\capturas\cap11.png)

Ejecución del frontend publicado en Vercel y conectado al backend en Render.

## 10. Despliegue en Vercel

El frontend está publicado mediante Vercel, utilizando la integración con GitHub.

### Procedimiento

1. Subir el código fuente a GitHub.
2. Iniciar sesión en Vercel.
3. Importar el repositorio del frontend.
4. Seleccionar Vite como framework.
5. Configurar el comando de compilación `npm run build`.
6. Establecer `dist` como directorio de salida.
7. Configurar la variable `VITE_API_URL` con la dirección pública del backend.
8. Ejecutar el despliegue.

Para permitir la navegación de React Router, se utiliza `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

El backend debe permitir mediante CORS las solicitudes provenientes del dominio público del frontend.

### Aplicación publicada

https://portal-academico-sii.vercel.app

## 11. Pruebas de funcionamiento

Se contemplan las siguientes verificaciones:

| Prueba | Resultado esperado |
|---|---|
| Acceder al login estudiantil | Mostrar formulario |
| Iniciar sesión con credenciales válidas | Permitir acceso |
| Consultar calificaciones | Mostrar información de la API |
| Consultar Kardex | Mostrar historial académico |
| Consultar horarios | Mostrar horario del estudiante |
| Buscar profesores | Filtrar registros |
| Iniciar sesión administrativo | Mostrar panel administrativo |
| Registrar profesor | Crear registro |
| Editar profesor | Actualizar información |
| Eliminar profesor | Eliminar registro |
| Gestionar materias | Reflejar cambios en la API |
| Gestionar horarios | Validar y guardar horarios |
| Acceder sin token a rutas protegidas | Denegar acceso |
| Cerrar sesión | Eliminar autenticación local |
| Recargar rutas en Vercel | Mantener navegación SPA |

Las pruebas de revocación de tokens en el servidor deben documentarse una vez verificada su implementación.

## 12. Consideraciones de seguridad

El sistema contempla medidas de seguridad como:

- Separación entre autenticación estudiantil y administrativa.
- Uso de tokens Bearer.
- Almacenamiento temporal de tokens en el navegador.
- Rutas protegidas en React.
- Validación de peticiones en Laravel.
- Comunicación HTTPS en producción.
- Configuración de CORS para el dominio autorizado.
- Exclusión de archivos `.env` del repositorio.

Las autorizaciones reales deben aplicarse en el backend, ya que ocultar una pantalla o proteger una ruta de React no impide por sí solo las solicitudes directas a la API.

## 13. Conclusión

El desarrollo del Portal Académico SII permitió integrar una aplicación frontend construida con React y Vite con una API REST desarrollada en Laravel.

Se implementaron interfaces para estudiantes y administradores, consumo de servicios HTTP, navegación protegida, gestión del estado de autenticación y operaciones CRUD.

La publicación mediante Vercel y Render permite acceder al sistema desde Internet, mientras que GitHub facilita el mantenimiento y control de versiones del proyecto.

Este trabajo permitió aplicar conceptos de desarrollo web moderno, comunicación cliente-servidor, autenticación mediante tokens y despliegue de aplicaciones.

---

**Proyecto académico — Tópicos Avanzados de Desarrollo Web**

Tecnológico Nacional de México — Instituto Tecnológico de Celaya.