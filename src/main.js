// Selección de elementos del DOM
const selectDepartamento = document.querySelector("#departamento");
const selectMunicipio = document.querySelector("#municipio");
const selectMacros = document.querySelector("#macros");
let departamentos = [];
let data;
let municipios = [];
const info = '/data/colombia.json';
let selectedLatitud = "";
let selectedLongitud = "";



// Agrega el evento que se ejecutará cuando el contenido de la página haya cargado
document.addEventListener("DOMContentLoaded", async () => {
  

    if (window.location.pathname.includes("main.html")) {
        // Obtiene los datos del archivo JSON usando la función obtenerDatos()
        data = await obtenerDatos();
        // Crea una lista de nombres de departamentos extrayendo "departamento" de cada dato en "data"
        departamentos = data.map(dato => dato.departamento);
        // Llena el select de departamentos con las opciones generadas
        llenarDepartamentos();
        // Agrega un evento para cuando se cambie la selección de departamento
        selectDepartamento.addEventListener("change", obtenerMunicipios);
        // Agrega un evento para cuando se cambie guarden las latitud y longitud
        selectMunicipio.addEventListener("change", guardarLatitudLongitud);
        // Agrega un evento para cuando se cambie la selección de macros
        selectMacros.addEventListener("change", guardarMacros);

       
       
    }

});


// Obtiene los datos del archivo JSON usando fetch
function obtenerDatos() {
    return fetch(info).then(response => response.json());
}

// Llena el select de departamentos con las opciones correspondientes
function llenarDepartamentos() {

    // Agrega la opción "Seleccionar" como un placeholder
    selectDepartamento.innerHTML = `<option value="" disabled selected>Seleccione un departamento</option>` +
        departamentos
            .map(departamento => `<option value="${departamento}">${departamento}</option>`)
            .join(""); // Combina las opciones en una cadena para insertarlas en el select
}

// Obtiene los municipios correspondientes al departamento seleccionado
function obtenerMunicipios(event) {
    const departamento = event.target.value;
    // Filtra los datos para encontrar los municipios del departamento seleccionado
    municipios = data.find(dato => dato.departamento === departamento)?.ciudades || [];
    // Llena el select de municipios con las opciones generadas
    llenarMunicipios();
}

// Llena el select de municipios con las opciones correspondientes
function llenarMunicipios() {

    // Agrega la opción "Seleccionar" como un placeholder
    selectMunicipio.innerHTML = `<option value="" disabled selected>Seleccione un municipio</option>` +
        municipios
            .map(nombre => `<option value="${nombre}">${nombre}</option>`)
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
        if (valores.every(val => parseInt(val) <= 255)) {
            return; // La IP es válida
        }
    }
    // Muestra una alerta si el formato de IP no es válido
    alert("Formato de IP incorrecto. Por favor verificar.");
}

// Permite ingresar solo números y el punto en un campo de entrada
function soloNumeros() {
    if ((event.keyCode !== 46) && (event.keyCode < 48) || (event.keyCode > 57)) {
        event.returnValue = false; // Evita que el evento de entrada se propague
    }
}

// Esta función se encarga de guardar la latitud y longitud asociadas a una selección
function guardarLatitudLongitud() {
    // Obtenemos el valor seleccionado en el campo de departamento
    const departamento = selectDepartamento.value;
    // Obtenemos el valor seleccionado en el campo de municipio
    const municipio = selectMunicipio.value;
    // Buscamos en los datos del JSON una entrada que coincida con el departamento y municipio seleccionados
    const seleccion = data.find(
        (dato) => dato.departamento === departamento
    );
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


// Obtiene los datos del archivo JSON usando fetch
function obtenerDatos() {
    return fetch(info).then(response => response.json());
}

// Llena el select de departamentos con las opciones correspondientes
function llenarDepartamentos() {
    // Agrega la opción "Seleccionar" como un placeholder
    selectDepartamento.innerHTML = `<option value="" disabled selected>Seleccione un departamento</option>` +
        departamentos
            .map(departamento => `<option value="${departamento}">${departamento}</option>`)
            .join(""); // Combina las opciones en una cadena para insertarlas en el select
}

// Llena el select de municipios con las opciones correspondientes
function llenarMunicipios() {
    // Agrega la opción "Seleccionar" como un placeholder
    selectMunicipio.innerHTML = `<option value="" disabled selected>Seleccione un municipio</option>` +
        municipios
            .map(nombre => `<option value="${nombre}">${nombre}</option>`)
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
        if (valores.every(val => parseInt(val) <= 255)) {
            return; // La IP es válida
        }
    }
    // Muestra una alerta si el formato de IP no es válido
    alert("Formato de IP incorrecto. Por favor verificar.");
}

// Permite ingresar solo números y el punto en un campo de entrada
function soloNumeros() {
    if ((event.keyCode !== 46) && (event.keyCode < 48) || (event.keyCode > 57)) {
        event.returnValue = false; // Evita que el evento de entrada se propague
    }
}

// Esta función se encarga de guardar la latitud y longitud asociadas a una selección
function guardarLatitudLongitud() {
    // Obtenemos el valor seleccionado en el campo de departamento
    const departamento = selectDepartamento.value;
    // Obtenemos el valor seleccionado en el campo de municipio
    const municipio = selectMunicipio.value;
    // Buscamos en los datos del JSON una entrada que coincida con el departamento y municipio seleccionados
    const seleccion = data.find(
        (dato) => dato.departamento === departamento
    );
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

// Función para guardar la opción seleccionada en el formulario de macros
function guardarMacros(event) {
    const opcionSeleccionada = event.target.value;
}

