const selectDepartamento = document.querySelector("#departamento");
const selectMunicipio = document.querySelector("#municipio");
let departamentos = [];
let data;
let municipios = [];
const info = '/data/colombia.json';

document.addEventListener("DOMContentLoaded", async () => {
    data = await obtenerDatos();
    departamentos = data.map(dato => dato.departamento);
    llenarDepartamentos();
    selectDepartamento.addEventListener("change", obtenerMunicipios);
});

window.onload = function () {
    mostrar("form_host");
};

function mostrar(id) {
    const formHost = document.getElementById("form_host");
    const formMacros = document.getElementById("form_macros");
    const formInventory = document.getElementById("form_inventory");

    formHost.style.display = id === "form_host" ? "block" : "none";
    formMacros.style.display = id === "form_macros" ? "block" : "none";
    formInventory.style.display = id === "form_inventory" ? "block" : "none";
}

function obtenerDatos() {
    return fetch(info).then(response => response.json());
}

function llenarDepartamentos() {
    selectDepartamento.innerHTML = departamentos
        .map(departamento => `<option value="${departamento}">${departamento}</option>`)
        .join("");
}

function obtenerMunicipios(event) {
    const departamento = event.target.value;
    municipios = data.find(dato => dato.departamento === departamento)?.ciudades || [];
    llenarMunicipios();
}

function llenarMunicipios() {
    selectMunicipio.innerHTML = municipios
        .map(nombre => `<option value="${nombre}">${nombre}</option>`)
        .join("");
}

function validaIp(ip) {
    const object = document.getElementById(ip);
    const valorInputIp = object.value;
    const patronIp = /^([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3})$/;

    if (patronIp.test(valorInputIp)) {
        const valores = valorInputIp.split(".");
        if (valores.every(val => parseInt(val) <= 255)) {
            return;
        }
    }

    alert("Formato de IP incorrecto. Por favor verificar.");
}

function soloNumeros() {
    if ((event.keyCode !== 46) && (event.keyCode < 48) || (event.keyCode > 57)) {
        event.returnValue = false;
    }
}