# Panel de Monitoreo Zabbix
Este proyecto implementa un panel de monitoreo basado en web utilizando la API de Zabbix para recuperar y mostrar datos históricos. El panel incluye funcionalidades como inicio de sesión de usuario, selección de plantillas y visualización dinámica de gráficos.

## Características

**Autenticación de Usuario:** Los usuarios pueden iniciar sesión con sus credenciales de Zabbix para acceder al panel de monitoreo.

**Selección de Plantilla:** Elija una plantilla de monitoreo de las opciones disponibles para personalizar los datos mostrados.

**Visualización Dinámica de Gráficos:** Vea datos históricos dinámicamente a través de un gráfico de líneas que visualiza "Bits recibidos" y "Bits enviados" a lo largo del tiempo.

## Prerrequisitos
Antes de ejecutar el proyecto, asegúrese de tener lo siguiente:

- Servidor Zabbix: Asegúrese de tener un servidor Zabbix configurado con las plantillas y datos necesarios.

- Navegador Web: Para una mejor experiencia, utilice un navegador web moderno como Chrome o Firefox.

## Uso

**Inicio de Sesión:**
- Ingrese su nombre de usuario y contraseña de Zabbix.
- Haga clic en el botón "Iniciar Sesión".

**Selección de Plantilla:**
- Después de iniciar sesión, elija una plantilla de monitoreo de las opciones disponibles.

**Gráfico Dinámico:**
- Explore el gráfico de líneas dinámico que visualiza datos históricos para "Bits recibidos" y "Bits enviados".

**Cerrar Sesión:**
-Haga clic en el botón "Cerrar Sesión" para finalizar la sesión.

## Funcionalidades Detalladas
**Función guardarLatitudLongitud()**
Esta función se encarga de guardar la latitud y longitud asociadas a una selección de departamento y municipio.

**Función obtenerTemplates()**
La función obtenerTemplates() realiza una solicitud a la API de Zabbix para obtener información sobre plantillas. Luego, crea opciones en un elemento de selección en el formulario.

**Función guardarTemplate()**
Esta función está diseñada para guardar la plantilla seleccionada, pero actualmente, el bloque de código relacionado está vacío.

**Función guardarTemplateId()**
La función guardarTemplateId() extrae el ID de la plantilla seleccionada y lo guarda en una variable.

**Función login()**
La función login() realiza el inicio de sesión del usuario utilizando las credenciales proporcionadas. Luego, verifica a qué conjunto de grupos pertenece el usuario y redirige según el resultado.

**Función logout()**
La función logout() maneja el cierre de sesión del usuario, realizando una solicitud para cerrar la sesión en el servidor Zabbix.

**Función checkSession()**
Esta función verifica la validez de una sesión utilizando el ID de sesión proporcionado.

**Función checkLoggedIn()**
La función checkLoggedIn() verifica si el usuario ha iniciado sesión, redirigiendo a la página de inicio de sesión si no se encuentra un token de sesión válido.

**Función obtenerProxyDisponible()**
La función obtenerProxyDisponible() realiza una solicitud para obtener información sobre los proxies disponibles y selecciona uno de manera aleatoria.

**Función llenarListaDesplegable()**
Esta función realiza una solicitud para obtener información sobre elementos y llena dinámicamente una lista desplegable en el formulario.

**Función buscarItemIdsYKeysPorNombre()**
Esta función busca "item id" y "keys_" por el nombre del ítem y filtra por "keys_" específicas.


**Función obtenerDatosHistoricos()**
Esta función obtiene datos históricos de Zabbix utilizando history.get y luego llama a funciones adicionales para convertir y graficar los datos.

**Función convertirDatosHistoricos()**
La función convertirDatosHistoricos() realiza conversiones necesarias en los datos históricos obtenidos.

**Función graficarDatosHistoricos()**
Esta función utiliza Chart.js para graficar datos históricos en un gráfico de líneas. La función maneja tanto la creación inicial como las actualizaciones del gráfico.

## Dependencias
Chart.js: Una biblioteca de gráficos en JavaScript para crear gráficos interactivos.

## Licencia
Este proyecto está bajo la Licencia MIT.