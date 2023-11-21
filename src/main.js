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
const formMacro = document.getElementById("formMacroGraph");
const hostMacro = document.getElementById("host");
const itemMacro = document.getElementById("itemInterface");
const itemTiempo = document.getElementById("tiempo");
const btnActualizar = document.getElementById("botonActualizar");
const btnEliminar = document.getElementById("botonEliminar");
const selectElemento = document.getElementById("itemInterface");
const btnExecuteNow = document.getElementById("botonExecuteNow");

let departamentos = [];
let data;
let municipios = [];
const info = "data/colombia.json";
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
let selectedHost = "";
let selectedItem = "";
let selectedMacro = "";
let selectedTiempo = "";
let macroIds = "";
let myChart = null; // Variable para almacenar la instancia del gráfico.

// Agrega el evento que se ejecutará cuando el contenido de la página haya cargado
document.addEventListener("DOMContentLoaded", async () => {
  const storedToken = localStorage.getItem("authToken");
  const currentPath = window.location.pathname;
  if (storedToken) {
    // Si hay un token almacenado, establecerlo como authToken
    authToken = storedToken;

    
    // Verificar si el usuario está tratando de acceder a "index.html" manualmente
    if (currentPath.includes("index.html")) {
      // Determina la página a la que debe redirigirse (puedes usar "main.html" o "formMacroGraph.html" según tu lógica)
      const redirectTo = "main.html";
      window.location.href = redirectTo;
    }
  } else {
    

    // Verificar si el usuario está tratando de acceder a "main.html" manualmente
    if (currentPath.includes("main.html")) {
      // Si el usuario no está logueado, redirigir a la página de inicio de sesión
      window.location.href = "index.html";
    }
  }

  if (currentPath.includes("main.html")) {
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
        
      });
    }

    if (selectHost) {
      selectIp.addEventListener("change", function () {
        const ipAddres = selectIp.value;
        
      });
    }

    if (selectHost) {
      selectHost.addEventListener("change", function () {
        const hostName = selectHost.value;
        
      });
    }

    if (selectComunidad) {
      selectComunidad.addEventListener("change", function () {
        const comunidad = selectComunidad.value;
        
      });
    }

    // Obtiene los datos del archivo JSON usando fetch
    function obtenerDatos() {
      return fetch(info)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Error de conexión");
          }
        })
        .catch((error) => {
          
        });
    }

    if (btnCrear) {
      btnCrear.addEventListener("click", async function (event) {
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
                {
                  macro: "{$NET.IF.IFALIAS.MATCHES8}",
                  value: "\\S+",
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
              
              alert("Host creado exitosamente.");
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
  } else if (currentPath.includes("formMacroGraph.html")) {
    // Agregar un manejador de eventos al cambio en la lista desplegable
    document
      .getElementById("itemInterface")
      .addEventListener("change", buscarItemIdsYKeysPorNombre);

    // Asignar la función para capturar el ítem seleccionado de la lista desplegable
    document
      .getElementById("itemInterface")
      .addEventListener("change", function () {
        selectedItem = this.value;

        
        
      });

    // Asignar la función llenarListaDesplegable al evento onchange del campo host
    document
      .getElementById("host")
      .addEventListener("change", llenarListaDesplegable);

    // Llamar a la función para llenar la lista desplegable al cargar la página
    llenarListaDesplegable();


    document.getElementById('host').addEventListener('input', function() {
      // Obtener el valor del campo de entrada
      var inputText = this.value;
// Verificar si se ha ingresado texto antes de llamar a la función
if (inputText.trim() !== "") {
  // Llamar a la función para obtener sugerencias
  getSuggestions(inputText);
}
  });

  async function getSuggestions(inputText) {
    try {
        // Realizar la primera solicitud a la API de Zabbix para obtener todos los grupos
        const groupsResponse = await fetch(authURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "hostgroup.get",
                params: {
                    output: ["groupid", "name"]
                },
                auth: authToken,
                id: 1,
            }),
        });

        if (!groupsResponse.ok) {
            throw new Error('Error al obtener grupos: ' + groupsResponse.statusText);
        }

        // Procesar la respuesta de los grupos
        const groupsData = await groupsResponse.json();

        // Filtrar los nombres de los grupos que contienen la palabra "networking"
        const filteredGroupIds = groupsData.result
            .filter(group => /networking/i.test(group.name))
            .map(group => group.groupid);

        // Realizar la segunda solicitud a la API de Zabbix para obtener hosts en esos grupos
        const hostsResponse = await fetch(authURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "host.get",
                params: {
                    output: ["host"],
                    groupids: filteredGroupIds, // Utilizar los IDs de los grupos filtrados como filtro
                    search: {
                        name: inputText // También puedes incluir la búsqueda por nombre si es necesario
                    },
                },
                auth: authToken,
                id: 2,
            }),
        });

        if (!hostsResponse.ok) {
            throw new Error('Error al obtener sugerencias: ' + hostsResponse.statusText);
        }

        // Procesar la respuesta y mostrar las sugerencias en el datalist
        const hostsData = await hostsResponse.json();
        updateSuggestions(hostsData.result);
    } catch (error) {
        console.error(error);
    }
}



function updateSuggestions(suggestions) {
  // Limpiar las sugerencias anteriores
  var hostSuggestions = document.getElementById('hostSuggestions');
  hostSuggestions.innerHTML = '';

  // Agregar las nuevas sugerencias al datalist
  suggestions.forEach(function(suggestion) {
      var option = document.createElement('option');
      option.value = suggestion.host;
      hostSuggestions.appendChild(option);
  });
}


    // Función para obtener el hostid a partir del nombre del host
    const obtenerHostIdPorNombre = async (nombreHost) => {
      const response = await fetch(authURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "host.get",
          params: {
            output: ["hostid"],
            filter: {
              host: [nombreHost], // Nombre del host
            },
          },
          auth: authToken,
          id: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error al obtener el host por nombre: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.result && data.result.length > 0) {
        // Devuelve el hostid del primer resultado (asumiendo que no hay duplicados)
        return data.result[0].hostid;
      } else {
        throw new Error("No se encontró el host con el nombre:", nombreHost);
      }
    };



    // Lista global para almacenar todas las hostmacroids
let listaHostMacroids = [];    
    // Agregar un evento para el botón de actualizar
    if (btnActualizar) {
      btnActualizar.addEventListener("click", async function () {
        event.preventDefault();
    
        // Obtener el valor seleccionado del host, el ítem y el tiempo
        const hostSelected = selectedHost;
        const tiempoValue = itemTiempo.value;
    
        // Verificar si se ha seleccionado un host, un ítem y un tiempo válido (número)
        if (!hostSelected || !selectedItem || isNaN(parseFloat(tiempoValue))) {
          alert("Por favor, complete los datos correctamente.");
          return;
        }
    
        // Obtener el hostid a partir del nombre del host
        const hostId = await obtenerHostIdPorNombre(hostSelected);
    
        if (hostId) {
          // Crear el objeto para la solicitud de creación de macro
          const createMacroRequest = {
            jsonrpc: "2.0",
            method: "usermacro.create",
            params: {
              hostid: hostId, // El ID del host en el que se creará la macro
              macro: `{$DELAY_IF:"${selectedItem}"}`, // El nombre de la macro que se creará
              value: tiempoValue + 'm', // El valor de la nueva macro (agregar 'm' aquí si es necesario)
            },
            auth: authToken,
            id: 1,
          };
    
          // Realizar la solicitud POST a la API de Zabbix para crear la macro
          try {
            const response = await fetch(authURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(createMacroRequest),
            });
    
            if (response.ok) {
              const data = await response.json();
              
    // Obtener la discovery rule asociada al host
const discoveryRuleResponse = await fetch(authURL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "discoveryrule.get",
    params: {
      output: ["itemid"], 
      hostids: hostId,
      filter: {
        key_: "net.if.discovery",
      },
    },
    auth: authToken,
    id: 2, 
  }),
});

if (!discoveryRuleResponse.ok) {
  throw new Error('Error al obtener la discovery rule: ' + discoveryRuleResponse.statusText);
}

// Procesar la respuesta para obtener el itemid de la discovery rule
const discoveryRuleData = await discoveryRuleResponse.json();
if (discoveryRuleData.result && discoveryRuleData.result.length > 0) {
  const discoveryRuleItemId = discoveryRuleData.result[0].itemid;
  
// Crear tarea y obtener taskid
const taskId = await crearTareaYObtenerTaskId(discoveryRuleItemId);

// Obtener información de la tarea utilizando taskid
await obtenerInformacionTarea(taskId);
  // Ahora puedes usar el discoveryRuleItemId según tus necesidades
} else {
  console.error("No se encontró la discovery rule asociada al host");
  // Puedes manejar esta situación de otra manera, según tus necesidades
}



         // Almacenar la hostmacroids en la lista
      if (data.result.hostmacroids && data.result.hostmacroids.length > 0) {
        listaHostMacroids.push(data.result.hostmacroids[0].toString()); // Asegúrate de convertirlo a cadena
        
      } else {
        console.error("No se encontraron hostmacroids en la respuesta de la API de Zabbix");
        // Puedes manejar esta situación de otra manera, según tus necesidades
      }

         
              // Si la creación fue exitosa, puedes realizar acciones adicionales aquí si es necesario
    
              alert("Macro creada exitosamente.");
    
              formMacro.reset();
              selectElemento.innerHTML = "";
              // Deshabilitar la opción predeterminada
              selectElemento.appendChild(
                new Option("Seleccione un ítem", "", false, false)
              );
            } else {
              console.error("Error al crear la macro:", response.statusText);
              alert(
                "Error al crear la macro. Por favor, inténtelo nuevamente."
              );
            }
          } catch (error) {
            console.error("Error en la solicitud a la API de Zabbix:", error);
            alert(
              "Error en la solicitud a la API de Zabbix. Por favor, inténtelo nuevamente."
            );
          }
        }
      });

      async function crearTareaYObtenerTaskId(discoveryRuleItemId) {
        // Lógica para crear la tarea y obtener el taskid
        // Usar el discoveryRuleItemId según tus necesidades
      
        const createTaskRequest = {
          jsonrpc: "2.0",
          method: "task.create",
          params: {
            type: 6,
            request: {
              itemid: discoveryRuleItemId,
            },
          },
          auth: "9ba1e59db9f78b97ebcc8a28a72c1935",
          id: 1,
        };
      
        try {
          const createTaskResponse = await fetch(authURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(createTaskRequest),
          });
      
          if (!createTaskResponse.ok) {
            throw new Error('Error al crear la tarea: ' + createTaskResponse.statusText);
          }
      
          const createTaskData = await createTaskResponse.json();
          
      
          if (createTaskData.result && createTaskData.result.taskids.length > 0) {
            const taskId = createTaskData.result.taskids[0];
            
            return taskId;
          } else {
            console.error("No se pudo obtener el taskid de la tarea creada");
            // Puedes manejar esta situación de otra manera, según tus necesidades
            return null;
          }
        } catch (error) {
          console.error("Error al crear la tarea:", error);
          // Puedes manejar esta situación de otra manera, según tus necesidades
          return null;
        }
      }
      
      async function obtenerInformacionTarea(taskId) {
        // Lógica para obtener información de la tarea utilizando taskid
        // Usar el taskId según tus necesidades
      
        const getTaskRequest = {
          jsonrpc: "2.0",
          method: "task.get",
          params: {
            output: "extend",
            taskids: taskId,
          },
          auth: "9ba1e59db9f78b97ebcc8a28a72c1935",
          id: 1,
        };
      
        const getTaskResponse = await fetch(authURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(getTaskRequest),
        });
      
        if (!getTaskResponse.ok) {
          throw new Error('Error al obtener información de la tarea: ' + getTaskResponse.statusText);
        }
      
        const getTaskData = await getTaskResponse.json();
        
      }
      
    }



    if (btnExecuteNow){

      btnExecuteNow.addEventListener("click", async function () {
      event.preventDefault();

// Obtener el valor seleccionado del host y la discovery rule
const hostSelected = selectedHost;

// Verificar si se ha seleccionado un host válido
if (!hostSelected) {
  alert("Por favor, seleccione un host.");
  return;
}

// Obtener el hostid a partir del nombre del host
const hostId = await obtenerHostIdPorNombre(hostSelected);

if (hostId) {
  try {
    // Obtener la discovery rule asociada al host
    const discoveryRuleResponse = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "discoveryrule.get",
        params: {
          output: ["itemid"],
          hostids: hostId,
          filter: {
            key_: "net.if.discovery",
          },
        },
        auth: authToken,
        id: 2,
      }),
    });

    if (!discoveryRuleResponse.ok) {
      throw new Error('Error al obtener la discovery rule: ' + discoveryRuleResponse.statusText);
    }

    // Procesar la respuesta para obtener el itemid de la discovery rule
    const discoveryRuleData = await discoveryRuleResponse.json();
    if (discoveryRuleData.result && discoveryRuleData.result.length > 0) {
      const discoveryRuleItemId = discoveryRuleData.result[0].itemid;
      

      // Crear tarea y obtener taskid
      const taskId = await crearTareaYObtenerTaskId(discoveryRuleItemId);

      // Obtener información de la tarea utilizando taskid
      await obtenerInformacionTarea(taskId);
    } else {
      console.error("No se encontró la discovery rule asociada al host");
      // Puedes manejar esta situación de otra manera, según tus necesidades
    }
  } catch (error) {
    console.error("Error al ejecutar la acción: ", error);
    alert("Error al ejecutar la acción. Por favor, inténtelo nuevamente.");
  }
}


async function crearTareaYObtenerTaskId(discoveryRuleItemId) {
  // Lógica para crear la tarea y obtener el taskid
  // Usar el discoveryRuleItemId según tus necesidades

  const createTaskRequest = {
    jsonrpc: "2.0",
    method: "task.create",
    params: {
      type: 6,
      request: {
        itemid: discoveryRuleItemId,
      },
    },
    auth: "9ba1e59db9f78b97ebcc8a28a72c1935",
    id: 1,
  };

  try {
    const createTaskResponse = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createTaskRequest),
    });

    if (!createTaskResponse.ok) {
      throw new Error('Error al crear la tarea: ' + createTaskResponse.statusText);
    }

    const createTaskData = await createTaskResponse.json();
    

    if (createTaskData.result && createTaskData.result.taskids.length > 0) {
      const taskId = createTaskData.result.taskids[0];
      
      return taskId;
    } else {
      console.error("No se pudo obtener el taskid de la tarea creada");
      // Puedes manejar esta situación de otra manera, según tus necesidades
      return null;
    }
  } catch (error) {
    console.error("Error al crear la tarea:", error);
    // Puedes manejar esta situación de otra manera, según tus necesidades
    return null;
  }
}

async function obtenerInformacionTarea(taskId) {
  // Lógica para obtener información de la tarea utilizando taskid
  // Usar el taskId según tus necesidades

  const getTaskRequest = {
    jsonrpc: "2.0",
    method: "task.get",
    params: {
      output: "extend",
      taskids: taskId,
    },
    auth: "9ba1e59db9f78b97ebcc8a28a72c1935",
    id: 1,
  };

  const getTaskResponse = await fetch(authURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getTaskRequest),
  });

  if (!getTaskResponse.ok) {
    throw new Error('Error al obtener información de la tarea: ' + getTaskResponse.statusText);
  }

  const getTaskData = await getTaskResponse.json();
  
}


      });


    }


    if(btnEliminar){

      btnEliminar.addEventListener("click", async function () {
        event.preventDefault();

 if (listaHostMacroids.length > 0) {
      // Lógica para eliminar los macroids
      for (const macroid of listaHostMacroids) {
        // Lógica para eliminar el macroid utilizando la API de Zabbix
        const eliminarMacroidRequest = {
          jsonrpc: "2.0",
          method: "usermacro.delete",
          params: [macroid], // Pasar el macroid como parámetro
          auth: authToken,
          id: 1,
        };

        try {
          const response = await fetch(authURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eliminarMacroidRequest),
          });

          if (!response.ok) {
            throw new Error('Error al eliminar el macroid: ' + response.statusText);
          }

          const data = await response.json();
          
        } catch (error) {
          console.error("Error en la solicitud a la API de Zabbix:", error);
          // Puedes manejar el error según tus necesidades
        }
      }

      // Limpiar la lista después de eliminar los macroids
      listaHostMacroids = [];
      

         // Mostrar mensaje en la interfaz de usuario
         alert("Las macros  han sido eliminados correctamente");
    } else {
      
    }


    // Obtener el valor seleccionado del host y la discovery rule
const hostSelected = selectedHost;

// Verificar si se ha seleccionado un host válido
if (!hostSelected) {
  alert("Por favor, seleccione un host.");
  return;
}

// Obtener el hostid a partir del nombre del host
const hostId = await obtenerHostIdPorNombre(hostSelected);

if (hostId) {
  try {
    // Obtener la discovery rule asociada al host
    const discoveryRuleResponse = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "discoveryrule.get",
        params: {
          output: ["itemid"],
          hostids: hostId,
          filter: {
            key_: "net.if.discovery",
          },
        },
        auth: authToken,
        id: 2,
      }),
    });

    if (!discoveryRuleResponse.ok) {
      throw new Error('Error al obtener la discovery rule: ' + discoveryRuleResponse.statusText);
    }

    // Procesar la respuesta para obtener el itemid de la discovery rule
    const discoveryRuleData = await discoveryRuleResponse.json();
    if (discoveryRuleData.result && discoveryRuleData.result.length > 0) {
      const discoveryRuleItemId = discoveryRuleData.result[0].itemid;
      

      // Crear tarea y obtener taskid
      const taskId = await crearTareaYObtenerTaskId(discoveryRuleItemId);

      // Obtener información de la tarea utilizando taskid
      await obtenerInformacionTarea(taskId);
    } else {
      console.error("No se encontró la discovery rule asociada al host");
      // Puedes manejar esta situación de otra manera, según tus necesidades
    }
  } catch (error) {
    console.error("Error al ejecutar la acción: ", error);
    alert("Error al ejecutar la acción. Por favor, inténtelo nuevamente.");
  }
}


async function crearTareaYObtenerTaskId(discoveryRuleItemId) {
  // Lógica para crear la tarea y obtener el taskid
  // Usar el discoveryRuleItemId según tus necesidades

  const createTaskRequest = {
    jsonrpc: "2.0",
    method: "task.create",
    params: {
      type: 6,
      request: {
        itemid: discoveryRuleItemId,
      },
    },
    auth: "9ba1e59db9f78b97ebcc8a28a72c1935",
    id: 1,
  };

  try {
    const createTaskResponse = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createTaskRequest),
    });

    if (!createTaskResponse.ok) {
      throw new Error('Error al crear la tarea: ' + createTaskResponse.statusText);
    }

    const createTaskData = await createTaskResponse.json();
    

    if (createTaskData.result && createTaskData.result.taskids.length > 0) {
      const taskId = createTaskData.result.taskids[0];
      
      return taskId;
    } else {
      console.error("No se pudo obtener el taskid de la tarea creada");
      // Puedes manejar esta situación de otra manera, según tus necesidades
      return null;
    }
  } catch (error) {
    console.error("Error al crear la tarea:", error);
    // Puedes manejar esta situación de otra manera, según tus necesidades
    return null;
  }
}

async function obtenerInformacionTarea(taskId) {
  // Lógica para obtener información de la tarea utilizando taskid
  // Usar el taskId según tus necesidades

  const getTaskRequest = {
    jsonrpc: "2.0",
    method: "task.get",
    params: {
      output: "extend",
      taskids: taskId,
    },
    auth: "9ba1e59db9f78b97ebcc8a28a72c1935",
    id: 1,
  };

  const getTaskResponse = await fetch(authURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getTaskRequest),
  });

  if (!getTaskResponse.ok) {
    throw new Error('Error al obtener información de la tarea: ' + getTaskResponse.statusText);
  }

  const getTaskData = await getTaskResponse.json();
  
}



        
      });

    }
   



    


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

  // Muestra un mensaje de error si hay un error al obtener los departamentos
  if (departamentos.length === 0) {
    const error = document.createElement("p");
    error.classList.add("error");
    error.textContent = "Error al obtener los departamentos";
    selectDepartamento.parentNode.insertBefore(error, selectDepartamento);
  }
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
  let keyCode = event.keyCode;
  if (keyCode !== 46 && (keyCode < 48 || keyCode > 57)) {
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

// Código de la función obtenerTemplates() mejorado
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
  if (selectedValue) {
    
  } else {
    
  }
}

function guardarTemplateId() {
  const selectedOption = selectElement.selectedOptions[0];
  if (selectedOption) {
    selectedTemplateId = selectedOption.value;
    
  } else {
    console.error("No se ha seleccionado ningún template");
  }
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
      // Realizar la solicitud de cierre de sesión
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

      // Comprobar si la solicitud se realizó correctamente
      if (!response.ok) {
        throw new Error("Error al cerrar sesión.");
      }

      // Eliminar el token del almacenamiento local
      localStorage.removeItem("authToken");
      // Establecer el token como nulo
      authToken = null;
      
      // Redirigir a la página de inicio de sesión
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
    }
  } else {
    
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
      if (data.result) {
        
        return true;
      } else {
        console.error("Sesión no válida.");
        return false;
      }
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
    return;
  }
  // Si hay un token almacenado, verificar si la sesión es válida
  try {
    const sessionValid = await checkSession(storedToken);
    if (!sessionValid) {
      // Si la sesión no es válida, redirigir a la página de inicio de sesión
      window.location.href = "index.html";
    }
  } catch (error) {
    // Si hay un error, redirigir a la página de inicio de sesión
    window.location.href = "index.html";
  }
}

async function obtenerProxyDisponible() {
  const hostValue = selectHost.value;
  const ipValue = selectIp.value;
  const comunidadValue = selectComunidad.value;

  if (
    !hostValue ||
    !ipValue ||
    !comunidadValue ||
    !selectedTemplateId ||
    !selectedDepartamento ||
    !selectedMunicipio
  ) {
    alert("Por favor, complete todos los campos del formulario.");
    return null;
  }

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
        (proxy) => proxy.proxyid !== "10426"
      );
      
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

// Función asincrónica para llenar la lista desplegable
async function llenarListaDesplegable() {
  try {
    // Datos de la solicitud JSON-RPC
    var jsonRpcRequest = {
      jsonrpc: "2.0",
      method: "item.get",
      params: {
        output: "extend",
        host: document.getElementById("host").value,
        search: {
          key_: "net.if.alias",
        },
      },
      auth: authToken,
      id: 1,
    };

    // Realizar la solicitud HTTP a la API de Zabbix y esperar la respuesta
    const response = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonRpcRequest),
    });

    // Procesar la respuesta como JSON
    const data = await response.json();

    // Limpiar la lista desplegable
    selectElemento.innerHTML = "";

    // Deshabilitar la opción predeterminada
    selectElemento.appendChild(
      new Option("Seleccione un ítem", "", false, false)
    );

    data.result.forEach(function (item) {
      var option = document.createElement("option");

      // Procesar el nombre para eliminar "Interface", lo que está entre paréntesis y ": Alias"
      var processedName = item.name.replace(/^Interface |\(.*\)|: Alias$/g, "");

      option.value = processedName; // Usar processedName en lugar de item.key_
      option.text = processedName;
      selectElemento.appendChild(option);
    });

    // Guardar el valor seleccionado en las variable
    selectedHost = document.getElementById("host").value;
    // selectedItem se mantiene igual si se desea mantener "Seleccione un ítem" seleccionado
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }

  // Deshabilitar la opción "Seleccione un ítem" después de llenar la lista
  selectElemento.querySelector('option[value=""]').disabled = true;
}

// Función para buscar "item id" y "keys_" por nombre de item y filtrar por "keys_" específicas
async function buscarItemIdsYKeysPorNombre() {
  try {
    // Obtén el nombre del item seleccionado
    const selectedItemName = document.getElementById("itemInterface").value;

    // Verifica si se seleccionó un nombre de item
    if (selectedItemName) {
      // Datos de la solicitud JSON-RPC para buscar "item id" y "keys_" por nombre de item
      const jsonRpcRequest = {
        jsonrpc: "2.0",
        method: "item.get",
        params: {
          output: ["itemids", "key_"],
          host: selectedHost, // Utiliza el host seleccionado previamente
          search: {
            name: selectedItemName, // Busca por el nombre seleccionado
          },
        },
        auth: authToken,
        id: 1, // Puedes utilizar un ID diferente
      };

      // Realiza la solicitud HTTP a la API de Zabbix y espera la respuesta
      const response = await fetch(authURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonRpcRequest),
      });

      // Procesa la respuesta como JSON
      const data = await response.json();

      // Filtra solo los elementos con "keys_" específicas
      const filteredItems = data.result.filter(
        (item) =>
          item.key_.startsWith("net.if.out[ifHCOutOctets.") ||
          item.key_.startsWith("net.if.in[ifHCInOctets.")
      );

      // Verifica si se encontraron elementos después del filtrado
      if (filteredItems.length > 0) {
        const itemDetails = filteredItems.map((item) => ({
          itemid: item.itemid,
          key: item.key_,
        }));
        

        // Llama a la función obtenerDatosHistoricos con itemIds
        obtenerDatosHistoricos(itemDetails);
      } else {
        
      }
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
  }
}

// Objeto para mapear los itemids a sus nombres
const nombresDeItems = {
  itemid1: "Bits sent",
  itemid2: "Bits received",
  // Agrega más mapeos si es necesario
};

// Función para obtener datos históricos de Zabbix utilizando history.get
async function obtenerDatosHistoricos(itemDetails) {
  const datosHistoricos = [];

  for (const item of itemDetails) {
    const jsonRpcRequest = {
      jsonrpc: "2.0",
      method: "history.get",
      params: {
        output: "extend",
        history: 3,
        itemids: item.itemid,
        sortfield: "clock",
        sortorder: "DESC",
        limit: 60,
      },
      auth: authToken,
      id: 2,
    };

    const response = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonRpcRequest),
    });

    const data = await response.json();

    const datosConvertidos = convertirDatosHistoricos(data.result);

    let etiqueta = selectedItem;
    if (item.key_ === "net.if.out[ifHCOutOctets") {
      etiqueta += " - Bits sent";
    } else if (item.key_ === "net.if.in[ifHCInOctets") {
      etiqueta += " - Bits received";
    }

    datosHistoricos.push({
      key: etiqueta,
      values: datosConvertidos,
    });
  }

  graficarDatosHistoricos(datosHistoricos);
}

// Función para convertir datos históricos
function convertirDatosHistoricos(datos) {
  // Mapea los datos y realiza las conversiones necesarias
  return datos.map((dato) => ({
    timestamp: new Date(dato.clock * 1000), // Convierte el "clock" a timestamp
    mbps: dato.value / 1000000, // Convierte "value" de kbps a Mbps
  }));
}

function graficarDatosHistoricos(datos) {
  const colores = [
    "rgba(75, 192, 192, 1)",
    "rgba(192, 75, 75, 1)",
    "rgba(75, 75, 192, 1)",
    "rgba(192, 192, 75, 1",
  ];

  const etiquetas = ["Bits received", "Bits sent"];

  const datasets = datos.map((dato, index) => ({
    label: `${etiquetas[index]} - ${dato.key}`, // Combinando etiquetas personalizadas y originales
    data: dato.values.map((value) => ({
      x: value.timestamp,
      y: value.mbps,
    })),
    borderColor: colores[index % colores.length],
    backgroundColor: colores[index % colores.length],
  }));

  const ctx = document.getElementById("myChart").getContext("2d");

  if (myChart) {
    // Si ya existe una instancia de Chart, actualiza los datos en lugar de crear una nueva.
    myChart.data.datasets = datasets;
    myChart.options.plugins.title.text = "Tipo de datos en el eje X"; // Cambia el título al eje X
    myChart.update(); // Actualiza el gráfico con los nuevos datos.
  } else {
    myChart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: datasets,
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Cantidad de datos",
            font: {
              size: 0, // Tamaño del texto en el eje Y
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: "minute",
            },
            grid: {
              display: true, // Mostrar líneas en el eje X
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Cantidad de datos (Mbps)",
              font: {
                size: 20, // Tamaño del texto en el eje Y
                color: "gray",
              },
            },
            ticks: {
              callback: function (value) {
                return value + "mbps";
              },
            },
            grid: {
              display: true, // Mostrar líneas en el eje Y
            },
          },
        },
        layout: {
          padding: {
            bottom: 2, // Ajusta el espacio debajo de la gráfica
            top: 10, // Añade espacio encima de la gráfica
          },
        },
      },
    });

    // Agregar el título "Tiempo" encima de la gráfica
    const tituloEncima = document.createElement("div");
    tituloEncima.textContent =
      "Grafico comparativo de Bits Received vs Bits Sent";
    tituloEncima.style.textAlign = "center"; // Centrar el texto
    tituloEncima.style.color = "White"; // Cambiar el color del texto
    tituloEncima.style.fontSize = "20px"; // Ajusta el tamaño del texto

    document.getElementById("myChart").before(tituloEncima);

    // Agregar el título "Tiempo" debajo de la gráfica
    const tituloTiempo = document.createElement("div");
    tituloTiempo.textContent = "Tiempo (h:m)";
    tituloTiempo.style.textAlign = "center"; // Centrar el texto
    tituloTiempo.style.color = "gray"; // Cambiar el color del texto
    tituloTiempo.style.fontSize = "20px"; // Ajusta el tamaño del texto
    tituloTiempo.style.marginTop = "1px"; // Ajustar la distancia superior

    document.getElementById("myChart").after(tituloTiempo);
  }

  // Crear elementos para las líneas de cuadrícula en el eje X y Y
  const cuadriculaX = document.createElement("hr");
  cuadriculaX.style.border = "none";
  cuadriculaX.style.borderTop = "1px dashed white"; // Estilo de la línea de cuadrícula
  cuadriculaX.style.margin = "0";
  cuadriculaX.style.padding = "0";
  cuadriculaX.style.width = "100%";
  cuadriculaX.style.position = "absolute";
  cuadriculaX.style.top = "50%"; // Alinea la línea de cuadrícula en el centro
  cuadriculaX.style.transform = "translateY(-50%)"; // Alinea la línea de cuadrícula en el centro verticalmente

  const cuadriculaY = document.createElement("div");
  cuadriculaY.style.border = "1px dashed red"; // Estilo de la línea de cuadrícula
  cuadriculaY.style.height = "100%";
  cuadriculaY.style.position = "absolute";
  cuadriculaY.style.left = "50%"; // Alinea la línea de cuadrícula en el centro
  cuadriculaY.style.transform = "translateX(-50%)"; // Alinea la línea de cuadrícula en el centro horizontalmente

  // Cambiar el color de fondo del contenedor del gráfico a negro
  const contenedorGrafico = document.getElementById("myChart");
  contenedorGrafico.style.backgroundColor = "white"; // Cambiar el color de fondo del contenedor

  // Cambiar el color de las líneas de cuadrícula a blanco
  cuadriculaX.style.borderTop = "1px dashed white";
  cuadriculaY.style.border = "1px dashed white";

  // Agregar los elementos de la línea de cuadrícula al contenedor del gráfico
  contenedorGrafico.appendChild(cuadriculaX);
  contenedorGrafico.appendChild(cuadriculaY);
}

















