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
let hostName = "";
let ipAddres = "";
let comunidad = "";
let authToken = null;
let selectedTemplateId = "";
let selectedHost = "";
let selectedItem = "";
let selectedMacro = "";
let selectedTiempo = "";
let macroIds = "";
let myChart = null;
let itemDetails = [];


// Agrega el evento que se ejecutará cuando el contenido de la página haya cargado
document.addEventListener("DOMContentLoaded", async () => {
  const storedToken = localStorage.getItem("authToken");
  const currentPath = window.location.pathname;
  if (storedToken) {
    authToken = storedToken;

    // Verifica si el usuario está tratando de acceder a "index.html" manualmente
    if (currentPath.includes("index.html")) {
      // Determina la página a la que debe redirigirse el usuario
      const redirectTo = "main.html";
      window.location.href = redirectTo;
    }
  } else {
    // Verifica si el usuario está tratando de acceder a "main.html" manualmente
    if (currentPath.includes("main.html")) {
      // Si el usuario no está logueado, redirige a la página de inicio de sesión
      window.location.href = "index.html";
    }
  }

  if (currentPath.includes("main.html")) {
    data = await obtenerDatos();
    // Crea una lista de nombres de departamentos extrayendo "departamento" de cada dato en "data"
    departamentos = data.map((dato) => dato.departamento);
    llenarDepartamentos();
    selectDepartamento.addEventListener("change", obtenerMunicipios);
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

    function obtenerDatos() {
      return fetch(info)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Error de conexión");
          }
        })
        .catch((error) => {});
    }

    if (btnCrear) {
      btnCrear.addEventListener("click", async function (event) {
        event.preventDefault();
        const proxyDisponible = await obtenerProxyDisponible();

        if (proxyDisponible) {
          guardarTemplateId();

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
              proxy_hostid: proxyDisponible.proxyid,
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

          fetch(authURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(hostCreate),
          })
            .then((response) => response.json())
            .then((data) => {
              alert("Host creado exitosamente.");
              formulario.reset();
            })
            .catch((error) => {
              console.error("Error en la solicitud a la API de Zabbix:", error);
            });
        }
      });
    }

    obtenerTemplates();
    checkLoggedIn();
  } else if (currentPath.includes("formMacroGraph.html")) {
    document
      .getElementById("itemInterface")
      .addEventListener("change", buscarItemIdsYKeysPorNombre);

    document
      .getElementById("itemInterface")
      .addEventListener("change", function () {
        selectedItem = this.value;
      });

    document
      .getElementById("host")
      .addEventListener("change", llenarListaDesplegable);

    llenarListaDesplegable();

    document.getElementById("host").addEventListener("input", function () {
      var inputText = this.value;

      if (inputText.trim() !== "") {
        getSuggestions(inputText);
      }
    });

    async function getSuggestions(inputText) {
      try {
        const groupsResponse = await fetch(authURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "hostgroup.get",
            params: {
              output: ["groupid", "name"],
            },
            auth: authToken,
            id: 1,
          }),
        });

        if (!groupsResponse.ok) {
          throw new Error(
            "Error al obtener grupos: " + groupsResponse.statusText
          );
        }

        const groupsData = await groupsResponse.json();

        // Filtrar los nombres de los grupos que contienen la palabra "networking"
        const filteredGroupIds = groupsData.result
          .filter((group) => /networking/i.test(group.name))
          .map((group) => group.groupid);

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
              groupids: filteredGroupIds,
              search: {
                name: inputText,
              },
            },
            auth: authToken,
            id: 2,
          }),
        });

        if (!hostsResponse.ok) {
          throw new Error(
            "Error al obtener sugerencias: " + hostsResponse.statusText
          );
        }

        // Procesa la respuesta y muestra las sugerencias en el datalist
        const hostsData = await hostsResponse.json();
        updateSuggestions(hostsData.result);
      } catch (error) {
        console.error(error);
      }
    }

    function updateSuggestions(suggestions) {
      // Limpiar las sugerencias anteriores
      var hostSuggestions = document.getElementById("hostSuggestions");
      hostSuggestions.innerHTML = "";

      // Agregar las nuevas sugerencias al datalist
      suggestions.forEach(function (suggestion) {
        var option = document.createElement("option");
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
            output: ["hostid", "proxy_hostid"],
            filter: {
              host: [nombreHost],
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

    const obtenerProxyHostId = async (nombreHost) => {
      const response = await fetch(authURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "host.get",
          params: {
            output: ["proxy_hostid"],
            filter: {
              host: [nombreHost],
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

        return data.result[0].proxy_hostid;
      } else {
        throw new Error("No se encontró el host con el nombre:", nombreHost);
      }
    };

    // Lista global para almacenar todas las hostmacroids
    let listaHostMacroids = [];

    // Función para modificar el proxy_hostid según las reglas especificadas
    function modificarProxyHostId(proxy_hostid) {
      switch (proxy_hostid) {
        case 10316:
          return 10317;
        case 10421:
          return 10420;
        case 10422:
          return 10423;
        case 10424:
          return 10429;
        case 10425:
          return 10430;
        case 10426:
          return 10431;
        case 10427:
          return 10432;
        case 10428:
          return 10433;
        // Agregar más casos según sea necesario
        default:
          return proxy_hostid;
      }
    }

    // Función para utilizar el nuevo valor en otra función o almacenarlo
    async function otraFuncionConNuevoValor(nuevoProxyHostId) {
      // Hacer lo que necesites con el nuevo valor

      // Llamada al método script.execute con el nuevo valor de proxy_hostid
      try {
        const scriptExecuteRequest = {
          jsonrpc: "2.0",
          method: "script.execute",
          params: {
            scriptid: "4",
            hostid: nuevoProxyHostId,
          },
          auth: "9ba1e59db9f78b97ebcc8a28a72c1935",
          id: 1,
        };

        const scriptExecuteResponse = await fetch(authURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scriptExecuteRequest),
        });

        if (!scriptExecuteResponse.ok) {
          throw new Error(
            "Error al ejecutar el método script.execute: " +
              scriptExecuteResponse.statusText
          );
        }

        const scriptExecuteData = await scriptExecuteResponse.json();
      } catch (error) {}
    }

    // Función para buscar y eliminar macros con "$DELAY_IF:"
    async function buscarYEliminarDelayMacros(hostName) {
      
      const hostId = await obtenerHostIdPorNombre(hostName);

      const macrosResponse = await fetch(authURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "usermacro.get",
          params: {
            hostids: hostId,
          },
          auth: authToken,
          id: 3,
        }),
      });

      if (!macrosResponse.ok) {
        console.error(
          "Error al obtener la información de las macros:",
          macrosResponse.statusText
        );
        throw new Error(
          "Error al obtener la información de las macros: " +
            macrosResponse.statusText
        );
      }

      const macrosData = await macrosResponse.json();
      
      const delayMacros = macrosData.result.filter((macro) => {
        
        return macro.macro.includes('{$DELAY_IF:"');
      });

      if (delayMacros.length > 0) {
      

        for (const delayMacro of delayMacros) {
         

          const eliminarMacroRequest = {
            jsonrpc: "2.0",
            method: "usermacro.delete",
            params: [delayMacro.hostmacroid],
            auth: authToken,
            id: 4,
          };

          try {
            const response = await fetch(authURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(eliminarMacroRequest),
            });

            if (!response.ok) {
              console.error(
                "Error al eliminar la macro '$DELAY_IF:':",
                response.statusText
              );
              throw new Error("Error al eliminar la macro '$DELAY_IF:'");
            }

            const data = await response.json();
           
          } catch (error) {
            console.error("Error al eliminar la macro '$DELAY_IF:':", error);
          }
        }
      } else {
       
      }
    }

    // Agregar un evento para el botón de actualizar
    if (btnActualizar) {
      btnActualizar.addEventListener("click", async function () {
        event.preventDefault();

        const hostSelected = selectedHost;
        const tiempoValue = itemTiempo.value;

        if (!hostSelected || !selectedItem || !tiempoValue) {
          alert("Por favor, complete los datos correctamente.");
          return;
        }

           // Validar que el tiempo sea mayor o igual a 10
    if (isNaN(parseFloat(tiempoValue)) || parseFloat(tiempoValue) < 10) {
      alert("El valor del tiempo debe ser mayor o igual a 10.");
      return;
    }

        const hostId = await obtenerHostIdPorNombre(hostSelected);
        const proxy_hostid = await obtenerProxyHostId(hostSelected);

        if (hostId) {
          const createMacroRequest = {
            jsonrpc: "2.0",
            method: "usermacro.create",
            params: {
              hostid: hostId,
              macro: `{$DELAY_IF:"${selectedItem}"}`,
              value: tiempoValue + "s",
            },
            auth: authToken,
            id: 1,
          };

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
                throw new Error(
                  "Error al obtener la discovery rule: " +
                    discoveryRuleResponse.statusText
                );
              }

              // Procesar la respuesta para obtener el itemid de la discovery rule
              const discoveryRuleData = await discoveryRuleResponse.json();
              if (
                discoveryRuleData.result &&
                discoveryRuleData.result.length > 0
              ) {
                const discoveryRuleItemId = discoveryRuleData.result[0].itemid;

                // Crear tarea y obtener taskid
                const taskId = await crearTareaYObtenerTaskId(
                  discoveryRuleItemId
                );

                // Obtener información de la tarea utilizando taskid
                await obtenerInformacionTarea(taskId);

                 // Modificar el proxy_hostid según las reglas especificadas
              let nuevoProxyHostId = modificarProxyHostId(Number(proxy_hostid));

              // Llamada al método script.execute con el nuevo valor de proxy_hostid
              await otraFuncionConNuevoValor(nuevoProxyHostId);

              } else {
                console.error(
                  "No se encontró la discovery rule asociada al host"
                );
              }

              // Almacena la hostmacroids en la lista
              if (
                data.result.hostmacroids &&
                data.result.hostmacroids.length > 0
              ) {
                listaHostMacroids.push(data.result.hostmacroids[0].toString());
              } else {
                console.error(
                  "No se encontraron hostmacroids en la respuesta de la API de Zabbix"
                );
              }

              alert("Macro creada exitosamente.");

              //formMacro.reset();
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
            throw new Error(
              "Error al crear la tarea: " + createTaskResponse.statusText
            );
          }

          const createTaskData = await createTaskResponse.json();

          if (
            createTaskData.result &&
            createTaskData.result.taskids.length > 0
          ) {
            const taskId = createTaskData.result.taskids[0];

            return taskId;
          } else {
            console.error("No se pudo obtener el taskid de la tarea creada");

            return null;
          }
        } catch (error) {
          console.error("Error al crear la tarea:", error);

          return null;
        }
      }

      async function obtenerInformacionTarea(taskId) {
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
          throw new Error(
            "Error al obtener información de la tarea: " +
              getTaskResponse.statusText
          );
        }

        const getTaskData = await getTaskResponse.json();
      }
    }

    if (btnExecuteNow) {
      btnExecuteNow.addEventListener("click", async function () {
        event.preventDefault();

        const hostSelected = selectedHost;

        if (!hostSelected) {
          alert("Por favor, seleccione un host.");
          return;
        }

        // Obtener el hostid a partir del nombre del host
        const hostId = await obtenerHostIdPorNombre(hostSelected);
        const proxy_hostid = await obtenerProxyHostId(hostSelected);

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
              throw new Error(
                "Error al obtener la discovery rule: " +
                  discoveryRuleResponse.statusText
              );
            }

            // Procesar la respuesta para obtener el itemid de la discovery rule
            const discoveryRuleData = await discoveryRuleResponse.json();
            if (
              discoveryRuleData.result &&
              discoveryRuleData.result.length > 0
            ) {
              const discoveryRuleItemId = discoveryRuleData.result[0].itemid;

              // Crea tarea y obtiene taskid
              const taskId = await crearTareaYObtenerTaskId(
                discoveryRuleItemId
              );

              // Obtener información de la tarea utilizando taskid
              await obtenerInformacionTarea(taskId);

              // Modificar el proxy_hostid según las reglas especificadas
              let nuevoProxyHostId = modificarProxyHostId(Number(proxy_hostid));

              // Llamada al método script.execute con el nuevo valor de proxy_hostid
              await otraFuncionConNuevoValor(nuevoProxyHostId);

              alert("Discovery rule ejecutada exitosamente.");
              //formMacro.reset();
            } else {
              console.error(
                "No se encontró la discovery rule asociada al host"
              );
            }
          } catch (error) {
            console.error("Error al ejecutar la acción: ", error);
            alert(
              "Error al ejecutar la acción. Por favor, inténtelo nuevamente."
            );
          }
        }

        async function crearTareaYObtenerTaskId(discoveryRuleItemId) {
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
              throw new Error(
                "Error al crear la tarea: " + createTaskResponse.statusText
              );
            }

            const createTaskData = await createTaskResponse.json();

            if (
              createTaskData.result &&
              createTaskData.result.taskids.length > 0
            ) {
              const taskId = createTaskData.result.taskids[0];

              return taskId;
            } else {
              console.error("No se pudo obtener el taskid de la tarea creada");

              return null;
            }
          } catch (error) {
            console.error("Error al crear la tarea:", error);

            return null;
          }
        }

        async function obtenerInformacionTarea(taskId) {
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
            throw new Error(
              "Error al obtener información de la tarea: " +
                getTaskResponse.statusText
            );
          }

          const getTaskData = await getTaskResponse.json();
        }
      });
    }

    if (btnEliminar) {
      btnEliminar.addEventListener("click", async function () {
        event.preventDefault();

        if (listaHostMacroids.length > 0) {
          // Lógica para eliminar los macroids
          for (const macroid of listaHostMacroids) {
            const eliminarMacroidRequest = {
              jsonrpc: "2.0",
              method: "usermacro.delete",
              params: [macroid],
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
                throw new Error(
                  "Error al eliminar el macroid: " + response.statusText
                );
              }

              const data = await response.json();
            } catch (error) {
              console.error("Error en la solicitud a la API de Zabbix:", error);
            }
          }

          // Limpiar la lista después de eliminar los macroids
          listaHostMacroids = [];

          alert("La macro  ha sido eliminado correctamente");
        } else {
        }

        const hostSelected = selectedHost;

        if (!hostSelected) {
          alert("Por favor, seleccione un host.");
          return;
        }

        const hostId = await obtenerHostIdPorNombre(hostSelected);
        const proxy_hostid = await obtenerProxyHostId(hostSelected);

        // Llamada a la función para buscar y eliminar macros con "$DELAY_IF:"
        await buscarYEliminarDelayMacros(hostSelected);
        if (hostId) {
          try {
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
              throw new Error(
                "Error al obtener la discovery rule: " +
                  discoveryRuleResponse.statusText
              );
            }

            const discoveryRuleData = await discoveryRuleResponse.json();
            if (
              discoveryRuleData.result &&
              discoveryRuleData.result.length > 0
            ) {
              const discoveryRuleItemId = discoveryRuleData.result[0].itemid;

              const taskId = await crearTareaYObtenerTaskId(
                discoveryRuleItemId
              );

              await obtenerInformacionTarea(taskId);
               // Modificar el proxy_hostid según las reglas especificadas
               let nuevoProxyHostId = modificarProxyHostId(Number(proxy_hostid));

               // Llamada al método script.execute con el nuevo valor de proxy_hostid
               await otraFuncionConNuevoValor(nuevoProxyHostId);
               alert("La macro  ha sido eliminado correctamente");
            } else {
              console.error(
                "No se encontró la discovery rule asociada al host"
              );
            }
          } catch (error) {
            console.error("Error al ejecutar la acción: ", error);
            alert(
              "Error al ejecutar la acción. Por favor, inténtelo nuevamente."
            );
          }
        }

        async function crearTareaYObtenerTaskId(discoveryRuleItemId) {
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
              throw new Error(
                "Error al crear la tarea: " + createTaskResponse.statusText
              );
            }

            const createTaskData = await createTaskResponse.json();

            if (
              createTaskData.result &&
              createTaskData.result.taskids.length > 0
            ) {
              const taskId = createTaskData.result.taskids[0];

              return taskId;
            } else {
              console.error("No se pudo obtener el taskid de la tarea creada");

              return null;
            }
          } catch (error) {
            console.error("Error al crear la tarea:", error);

            return null;
          }
        }

        async function obtenerInformacionTarea(taskId) {
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
            throw new Error(
              "Error al obtener información de la tarea: " +
                getTaskResponse.statusText
            );
          }

          const getTaskData = await getTaskResponse.json();
        }
      });
    }
  }
});

// Función que Llena el select de departamentos con las opciones correspondientes
function llenarDepartamentos() {
  // Agrega la opción "Seleccionar" como un placeholder
  selectDepartamento.innerHTML =
    `<option value="" disabled selected>Seleccione un departamento</option>` +
    departamentos
      .map(
        (departamento) =>
          `<option value="${departamento}">${departamento}</option>`
      )
      .join("");

  // Muestra un mensaje de error si hay un error al obtener los departamentos
  if (departamentos.length === 0) {
    const error = document.createElement("p");
    error.classList.add("error");
    error.textContent = "Error al obtener los departamentos";
    selectDepartamento.parentNode.insertBefore(error, selectDepartamento);
  }
}
// Función que obtiene los municipios correspondientes al departamento seleccionado
function obtenerMunicipios(event) {
  const departamento = event.target.value;
  // Filtra los datos para encontrar los municipios del departamento seleccionado
  municipios =
    data.find((dato) => dato.departamento === departamento)?.ciudades || [];
  // Llena el select de municipios con las opciones generadas
  llenarMunicipios();
}

// Función que Llena el select de municipios con las opciones correspondientes
function llenarMunicipios() {
  // Agrega la opción "Seleccionar" como un placeholder
  selectMunicipio.innerHTML =
    `<option value="" disabled selected>Seleccione un municipio</option>` +
    municipios
      .map((nombre) => `<option value="${nombre}">${nombre}</option>`)
      .join(""); // Combina las opciones en una cadena para insertarlas en el select
}

// Función que Vvlida el formato de una dirección IP
function validaIp(ip) {
  const object = document.getElementById(ip);
  const valorInputIp = object.value;
  const patronIp = /^([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3})$/;
  if (patronIp.test(valorInputIp)) {
    const valores = valorInputIp.split(".");
    // Verifica que todos los valores estén dentro del rango válido (0-255)
    if (valores.every((val) => parseInt(val) <= 255)) {
      return;
    }
  }
  // Muestra una alerta si el formato de IP no es válido
  alert("Formato de IP incorrecto. Por favor verificar.");
}

// Función Permite ingresar solo números y el punto en un campo de entrada
function soloNumeros() {
  let keyCode = event.keyCode;
  if (keyCode !== 46 && (keyCode < 48 || keyCode > 57)) {
    event.returnValue = false;
  }
}

// Función se encarga de guardar la latitud y longitud asociadas a una selección
function guardarLatitudLongitud() {
  const departamento = selectDepartamento.value;
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

// Función obtenerTemplates() mejorado
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
          option.value = obj.templateid;
          option.textContent = obj.host;
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

// Función para guardar el template seleccionado
function guardarTemplate() {
  const selectedValue = selectElement.value;
  if (selectedValue) {
  } else {
  }
}

// Función para guardar el id del template seleccionado
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

        // Verificar los grupos y redirigir según el resultado
        const responseGroups = await fetch(authURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "user.get",
            params: {
              output: ["userid", "alias", "usrgrps"],
              selectUsrgrps: ["usrgrpid", "name"],
            },
            auth: authToken,
            id: 1,
          }),
        });

        if (responseGroups.ok) {
          const userData = await responseGroups.json();
          const userGroups = userData.result[0]?.usrgrps || [];

          // Verificar si el usuario pertenece a alguno de los grupos del primer conjunto
          const primerConjuntoIds = ["37", "23", "31", "36", "14"];
          const perteneceAAlgunGrupoPrimerConjunto = userGroups.some((group) =>
            primerConjuntoIds.includes(group.usrgrpid)
          );

          if (perteneceAAlgunGrupoPrimerConjunto) {
            
            // Realizar la redirección a la interfaz "formMacroGraph.html"
            window.location.href = "formMacroGraph.html";
          } else {
            // Si no pertenece al primer conjunto, verificar el segundo conjunto
            const segundoConjuntoIds = ["25", "50", "26", "7"];
            const perteneceAAlgunGrupoSegundoConjunto = userGroups.some(
              (group) => segundoConjuntoIds.includes(group.usrgrpid)
            );

            if (perteneceAAlgunGrupoSegundoConjunto) {
             
              // Realizar la redirección a la interfaz correspondiente
              window.location.href = "main.html";
            } else {
              
              // Redirigir a la página principal "main.html"
              //window.location.href = "main.html";
            }
          }
        } else {
          console.error(
            "Error al obtener información del usuario:",
            responseGroups.statusText
          );
        }
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

// Función que verificará si el usuario ha iniciado sesión
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

// Función que obteniene los Proxys Disponibles
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

    const response = await fetch(authURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonRpcRequest),
    });

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
    const selectedItemName = document.getElementById("itemInterface").value;
    
    // Verifica si se seleccionó un nombre de item
    if (selectedItemName) {
      const jsonRpcRequest = {
        jsonrpc: "2.0",
        method: "item.get",
        params: {
          output: ["itemids", "key_"],
          host: selectedHost,
          search: {
            name: selectedItemName,
          },
        },
        auth: authToken,
        id: 1,
      };

      const response = await fetch(authURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonRpcRequest),
      });

      const data = await response.json();

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
};


// Función para obtener datos históricos de Zabbix utilizando history.get
async function obtenerDatosHistoricos(itemDetails) {
  
  let datosHistoricos = [];

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
        limit: 30,
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

    if (data.result) {
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
    } else {
      console.error("Los datos históricos no están definidos en la respuesta.");
    }
  }

  graficarDatosHistoricos(datosHistoricos);
}

// Función para convertir datos históricos
function convertirDatosHistoricos(datos) {

  
  return datos.map((dato) => ({
    timestamp: new Date(dato.clock * 1000), 
    mbps: dato.value / 1000000, 
  }));
}


// Función para graficar datos históricos
function graficarDatosHistoricos(datos) {
 

  const colores = [
    "rgba(75, 192, 192, 1)",
    "rgba(192, 75, 75, 1)",
    "rgba(75, 75, 192, 1)",
    "rgba(192, 192, 75, 1",
  ];

  const etiquetas = ["Bits received", "Bits sent"];

  const datasets = datos.map((dato, index) => ({
    label: `${etiquetas[index]} - ${dato.key}`,
    data: dato.values.map((value) => ({
      x: value.timestamp,
      y: value.mbps,
    })),
    borderColor: colores[index % colores.length],
    backgroundColor: colores[index % colores.length].replace('1)', '0.5)'),
    pointRadius: 1.5, 
    pointHoverRadius: 4,
    borderWidth: 2,
    fill: true,
  }));

  const ctx = document.getElementById("myChart").getContext("2d");

  if (myChart) {
   
    myChart.data.datasets = datasets;
    myChart.options.plugins.title.text = "Tipo de datos en el eje X";
    myChart.update();
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
              size: 0,
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
              display: true,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Cantidad de datos (Mbps)",
              font: {
                size: 20,
                color: "gray",
              },
            },
            ticks: {
              callback: function (value) {
                return value + "mbps";
              },
            },
            grid: {
              display: true,
            },
          },
        },
        layout: {
          padding: {
            bottom: 2,
            top: 10,
          },
        },
      },
    });

    const tituloEncima = document.createElement("div");
    tituloEncima.textContent =
      "Grafico comparativo de Bits Received vs Bits Sent";
    tituloEncima.style.textAlign = "center";
    tituloEncima.style.color = "White";
    tituloEncima.style.fontSize = "20px";
    document.getElementById("myChart").before(tituloEncima);
    const tituloTiempo = document.createElement("div");
    tituloTiempo.textContent = "Tiempo (h:m)";
    tituloTiempo.style.textAlign = "center";
    tituloTiempo.style.color = "gray";
    tituloTiempo.style.fontSize = "20px";
    tituloTiempo.style.marginTop = "1px";
    document.getElementById("myChart").after(tituloTiempo);
  }

  if (myChart) {
    const refreshButton = document.getElementById("refreshButton");
    refreshButton.style.display = "block"; // Muestra el botón
    refreshButton.addEventListener("click", async function () {      
      try {
       
        await buscarItemIdsYKeysPorNombre();
  
    
        await obtenerDatosHistoricos(itemDetails);

        convertirDatosHistoricos(datos);
        graficarDatosHistoricos(datos);
  
      } catch (error) {
        console.error("Error al refrescar el gráfico:", error);
      }
    });
  }

  
  const cuadriculaX = document.createElement("hr");
  cuadriculaX.style.border = "none";
  cuadriculaX.style.borderTop = "1px dashed white";
  cuadriculaX.style.margin = "0";
  cuadriculaX.style.padding = "0";
  cuadriculaX.style.width = "100%";
  cuadriculaX.style.position = "absolute";
  cuadriculaX.style.top = "50%";
  cuadriculaX.style.transform = "translateY(-50%)";
  const cuadriculaY = document.createElement("div");
  cuadriculaY.style.border = "1px dashed red";
  cuadriculaY.style.height = "100%";
  cuadriculaY.style.position = "absolute";
  cuadriculaY.style.left = "50%";
  cuadriculaY.style.transform = "translateX(-50%)";
  const contenedorGrafico = document.getElementById("myChart");
  contenedorGrafico.style.backgroundColor = "white";
  cuadriculaX.style.borderTop = "1px dashed white";
  cuadriculaY.style.border = "1px dashed white";
  contenedorGrafico.appendChild(cuadriculaX);
  contenedorGrafico.appendChild(cuadriculaY);
}


// Oculta el botón inicialmente (puedes hacerlo en tu HTML o en tu script)
document.getElementById("refreshButton").style.display = "none";
