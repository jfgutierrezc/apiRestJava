// Selección de elementos del DOM
const selectDepartamento = document.getElementById("departamento");
const selectMunicipio = document.getElementById("municipio");
const selectMacros = document.getElementById("macros");
const selectElement = document.getElementById("template");
const btnCrear = document.getElementById("botonCrear");
const selectIp = document.getElementById("ip");
const selectHost = document.getElementById("host");
const selectComunidad = document.getElementById("macros");
const formulario = document.getElementById("mainForm");
const formularioLogin = document.getElementById("formLogin");

let departamentos = [];
let data;
let municipios = [];
const info = "../data/colombia.json";
let selectedLatitud = "";
let selectedLongitud = "";
const authURL = "http://10.144.2.160/zabbix/api_jsonrpc.php";
let selectedMunicipio = "";
let selectedDepartamento = "";
let hostName = ""; // Variable global para el nombre del host
let ipAddres = ""; // Variable global para la dirección IP
let comunidad = ""; // Variable global para la comunidad SNMP
let authToken = null;
let selectedTemplateId = "";

// Agrega el evento que se ejecutará cuando el contenido de la página haya cargado
document.addEventListener("DOMContentLoaded", async () => {
  const storedToken = localStorage.getItem("authToken");
  if (storedToken) {
    // Si hay un token almacenado, establecerlo como authToken
    authToken = storedToken;

    console.log("Sesión activa encontrada con token:", authToken);
  } else {
    console.log("No se encontró una sesión activa.");
  }

  if (window.location.pathname.includes("main.html")) {
    // Obtiene los datos del archivo JSON usando la función obtenerDatos()
    data = await obtenerDatos();
    // Crea una lista de nombres de departamentos extrayendo "departamento" de cada dato en "data"
    departamentos = data.map((dato) => dato.departamento);
    // Llena el select de departamentos con las opciones generadas
    llenarDepartamentos();
    // Agrega un evento para cuando se cambie la selección de departamento
    selectDepartamento.addEventListener("change", obtenerMunicipios);
    // Agrega un evento para cuando se cambie guarden las latitud y longitud
    selectMunicipio.addEventListener("change", guardarLatitudLongitud);

    selectElement.addEventListener("change", guardarTemplate);
    selectElement.addEventListener("change", guardarTemplateId);

    if (selectIp) {
      selectIp.addEventListener("change", function () {
        const ipAddres = selectIp.value;
        console.log(ipAddres);
      });
    }

    if (selectHost) {
      selectIp.addEventListener("change", function () {
        const ipAddres = selectIp.value;
        console.log(ipAddres);
      });
    }

    if (selectHost) {
      selectHost.addEventListener("change", function () {
        const hostName = selectHost.value;
        console.log(hostName);
      });
    }

    if (selectComunidad) {
      selectComunidad.addEventListener("change", function () {
        const comunidad = selectComunidad.value;
        console.log(comunidad);
      });
    }

    // Obtiene los datos del archivo JSON usando fetch
    function obtenerDatos() {
      return fetch(info).then((response) => response.json());
    }

    if (btnCrear) {
      btnCrear.addEventListener("click", async function () {
        event.preventDefault();
        const proxyDisponible = await obtenerProxyDisponible();

        if (proxyDisponible) {
          guardarTemplateId();
          guardarTemplate();

          const hostName = selectHost.value;
          const ipAddres = selectIp.value;
          const comunidad = selectComunidad.value;

          const hostCreate = {
            jsonrpc: "2.0",
            method: "host.create",
            params: {
              host: hostName,
              inventory_mode: 1,
              status: 0,
              proxy_hostid: proxyDisponible.proxyid, // Asigna el proxy disponible al host
              interfaces: [
                {
                  type: 2,
                  main: 1,
                  useip: 1,
                  ip: ipAddres,
                  dns: "",
                  port: "161",
                  details: {
                    version: 2,
                    bulk: 0,
                    community: "{$SNMP_COMMUNITY}",
                  },
                },
              ],
              groups: [
                {
                  groupid: "51",
                },
              ],
              templates: [
                {
                  templateid: selectedTemplateId,
                },
              ],
              macros: [
                {
                  macro: "{$HOST.TYPE}",
                  value: "Cliente",
                },
                {
                  macro: "{$SNMP_COMMUNITY}",
                  value: comunidad,
                },
              ],
              inventory: {
                site_city: selectedMunicipio,
                site_state: selectedDepartamento,
                location_lat: selectedLatitud,
                location_lon: selectedLongitud,
              },
            },
            auth: authToken,
            id: 1,
          };

          console.log(hostCreate);

          // Realiza la solicitud POST a la API de Zabbix
          fetch(authURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(hostCreate),
          })
            .then((response) => response.json())
            .then((data) => {
              // Maneja la respuesta de la API aquí
              console.log("Respuesta de la API de Zabbix:", data);
              formulario.reset();
            })
            .catch((error) => {
              // Maneja los errores aquí
              console.error("Error en la solicitud a la API de Zabbix:", error);
            });
        }
      });
    }

    obtenerTemplates();
    checkLoggedIn();
  }
});

// Llena el select de departamentos con las opciones correspondientes
function llenarDepartamentos() {
  // Agrega la opción "Seleccionar" como un placeholder
  selectDepartamento.innerHTML =
    `<option value="" disabled selected>Seleccione un departamento</option>` +
    departamentos
      .map(
        (departamento) =>
          `<option value="${departamento}">${departamento}</option>`
      )
      .join(""); // Combina las opciones en una cadena para insertarlas en el select
}

// Obtiene los municipios correspondientes al departamento seleccionado
function obtenerMunicipios(event) {
  const departamento = event.target.value;
  // Filtra los datos para encontrar los municipios del departamento seleccionado
  municipios =
    data.find((dato) => dato.departamento === departamento)?.ciudades || [];
  // Llena el select de municipios con las opciones generadas
  llenarMunicipios();
}

// Llena el select de municipios con las opciones correspondientes
function llenarMunicipios() {
  // Agrega la opción "Seleccionar" como un placeholder
  selectMunicipio.innerHTML =
    `<option value="" disabled selected>Seleccione un municipio</option>` +
    municipios
      .map((nombre) => `<option value="${nombre}">${nombre}</option>`)
      .join(""); // Combina las opciones en una cadena para insertarlas en el select
}

// Valida el formato de una dirección IP
function validaIp(ip) {
  const object = document.getElementById(ip);
  const valorInputIp = object.value;
  const patronIp = /^([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3})$/;
  if (patronIp.test(valorInputIp)) {
    const valores = valorInputIp.split(".");
    // Verifica que todos los valores estén dentro del rango válido (0-255)
    if (valores.every((val) => parseInt(val) <= 255)) {
      return; // La IP es válida
    }
  }
  // Muestra una alerta si el formato de IP no es válido
  alert("Formato de IP incorrecto. Por favor verificar.");
}

// Permite ingresar solo números y el punto en un campo de entrada
function soloNumeros() {
  if ((event.keyCode !== 46 && event.keyCode < 48) || event.keyCode > 57) {
    event.returnValue = false; // Evita que el evento de entrada se propague
  }
}

// Esta función se encarga de guardar la latitud y longitud asociadas a una selección
function guardarLatitudLongitud() {
  // Obtenemos el valor seleccionado en el campo de departamento
  const departamento = selectDepartamento.value;

  // Obtenemos el valor seleccionado en el campo de municipio
  const municipio = selectMunicipio.value;

  selectedDepartamento = departamento;
  selectedMunicipio = municipio;

  console.log(selectedDepartamento);
  console.log(selectedMunicipio);
  // Buscamos en los datos del JSON una entrada que coincida con el departamento y municipio seleccionados
  const seleccion = data.find((dato) => dato.departamento === departamento);
  // Si encontramos una selección válida
  if (seleccion) {
    // Obtenemos el índice del municipio seleccionado en el array de ciudades
    const index = seleccion.ciudades.indexOf(municipio);
    // Si encontramos la latitud y longitud correspondientes al municipio seleccionado
    if (index !== -1) {
      selectedLatitud = seleccion.latitudes[index];
      selectedLongitud = seleccion.longitudes[index];
      // Imprimimos la latitud y longitud en la consola para verificar
      console.log(selectedLatitud);
      console.log(selectedLongitud);
    } else {
      // Si no se encontraron latitud y longitud, reseteamos las variables
      selectedLatitud = "";
      selectedLongitud = "";
    }
  } else {
    // Si no se encontró una selección válida, reseteamos las variables
    selectedLatitud = "";
    selectedLongitud = "";
  }
}

// Función para obtener los templates disponibles
async function obtenerTemplates() {
  try {
    const response = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "template.get",
        params: {
          output: ["host", "templateid"],
          groupids: "9",
        },
        auth: authToken,
        id: 1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const selectElement = document.getElementById("template");

      // Verifica si 'data.result' es un array antes de iterar
      if (Array.isArray(data.result)) {
        // Recorre los objetos de "result" y crea opciones en el select
        data.result.forEach((obj) => {
          const option = document.createElement("option");
          option.value = obj.templateid; // Valor que se enviará cuando se seleccione la opción (templateid)
          option.textContent = obj.host; // Texto visible para el usuario (nombre del host)
          selectElement.appendChild(option);
        });
      } else {
        console.error(
          "La respuesta de la API no contiene un array de resultados:",
          data
        );
      }
    } else {
      console.error("Error al obtener los datos:", response.statusText);
    }
  } catch (error) {
    console.error("Error en la solicitud a la API de Zabbix:", error);
  }
}

function guardarTemplate() {
  const selectedValue = selectElement.value;
  console.log("Valor seleccionado:", selectedValue);
}

function guardarTemplateId() {
  const selectedOption = selectElement.selectedOptions[0];
  selectedTemplateId = selectedOption.value;
  console.log("templateid seleccionado:", selectedTemplateId);
}

// Función para realizar el inicio de sesión
async function login() {
  event.preventDefault(); // Evita que el formulario se envíe automáticamente

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const params = {
    username: username,
    password: password,
  };

  try {
    const response = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "user.login",
        params: params,
        id: 1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result !== undefined) {
        authToken = data.result;

        // Almacenar el token en el almacenamiento local
        localStorage.setItem("authToken", authToken);

        console.log("Inicio de sesión exitoso.");
        console.log("Token de autenticación:", authToken);

        // Redirigir a la página principal después del inicio de sesión
        window.location.href = "main.html";
      } else {
        // Mostrar una alerta de usuario o contraseña incorrecta
        alert("Usuario o contraseña incorrecta.");
        formularioLogin.reset();

      }
    } else {
      console.error("Error al iniciar sesión:", response.statusText);
    }
  } catch (error) {
    console.error("Error al realizar la solicitud:", error);
  }
}

// Función para cerrar sesión
async function logout() {
  if (authToken) {
    try {
      const response = await fetch(authURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "user.logout",
          params: [],
          id: 1,
          auth: authToken,
        }),
      });

      if (response.ok) {
        // Eliminar el token del almacenamiento local
        localStorage.removeItem("authToken");
        authToken = null; // Establecer el token como nulo
        console.log("Cierre de sesión exitoso.");
        // Redirigir a la página de inicio de sesión
        window.location.href = "index.html";
      } else {
        console.error("Error al cerrar sesión.");
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  } else {
    console.log("No hay sesión activa para cerrar.");
  }
}

// Función para verificar la sesión
async function checkSession(sessionId) {
  try {
    const response = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "user.checkAuthentication",
        params: {
          sessionid: sessionId,
        },
        id: 1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Sesión válida:", data.result);
      return true;
    } else {
      console.error("Sesión no válida.");
      return false;
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    return false;
  }
}

// Esta función verificará si el usuario ha iniciado sesión
async function checkLoggedIn() {
  const storedToken = localStorage.getItem("authToken");
  if (!storedToken) {
    // Si no hay un token almacenado, redirigir a la página de inicio de sesión
    window.location.href = "index.html";
  } else {
    // Si hay un token almacenado, verificar si la sesión es válida
    const sessionValid = await checkSession(storedToken);
    if (!sessionValid) {
      // Si la sesión no es válida, redirigir a la página de inicio de sesión
      window.location.href = "index.html";
    }
  }
}

async function obtenerProxyDisponible() {
  try {
    const response = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "proxy.get",
        params: {
          output: "extend",
          selectHosts: "count",
        },
        auth: authToken,
        id: 1,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (!data.result || data.result.length === 0) {
        console.error("No se encontraron proxies disponibles.");
        return null;
      }

      // Filtra los proxies para encontrar el que tiene la menor cantidad de hosts y no es el proxy 6
      const proxiesDisponibles = data.result.filter(
        (proxy) => proxy.proxyid !== "10427"
      );
      console.log("Proxies disponibles:", proxiesDisponibles);
      if (proxiesDisponibles.length === 0) {
        console.error("No hay proxies disponibles que no sean el proxy 6.");
        return null;
      }

      // Ordena los proxies por la cantidad de hosts de manera ascendente
      proxiesDisponibles.sort(
        (a, b) => (a.hosts || []).length - (b.hosts || []).length
      );

      // Elige aleatoriamente uno de los proxies con menos hosts
      const proxyAleatorio =
        proxiesDisponibles[
          Math.floor(Math.random() * proxiesDisponibles.length)
        ];

      return proxyAleatorio;
    } else {
      console.error(
        "Error al obtener los datos de los proxies:",
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error en la solicitud a la API de Zabbix:", error);
    return null;
  }
}
