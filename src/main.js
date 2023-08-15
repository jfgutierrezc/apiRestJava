const selectDepartamento = document.querySelector("#departamento")
const selectMunicipio = document.querySelector("#municipio")
let departamentos = []
let data 
let municipios = []
let info = '/data/colombia.json'

document.addEventListener("DOMContentLoaded", async () => {
    data = await obetenerDatos()
    departamentos = data.map((dato)=>dato.departamento)
    llenarDepartamentos()
    selectDepartamento.addEventListener("change", obtenerMunicipios)
   
} )

window.onload = function () {
    const host = document.getElementById("form_host");
    const macro = document.getElementById("form_macros");
    const inventory = document.getElementById("form_inventory");

    host.style.display = "block";
    macro.style.display = "none";
    inventory.style.display = "none";



}

// Select anidados para departamento y municipios


async function obetenerDatos(){
    const respuesta = await fetch(info)
    const departamentos = await respuesta.json()
    return departamentos
}


function llenarDepartamentos(){
    departamentos.forEach((departamento)=>{
        const departamentoOption = document.createElement("option")
        departamento.value = departamento
        departamentoOption.textContent = departamento
        selectDepartamento.appendChild(departamentoOption)
    })
}

function obtenerMunicipios(event){
    const departamento = event.target.value
    
    municipios = data.filter((dato)=> dato.departamento === departamento)[0].ciudades
    llenarMunicipios()
    
    }

function llenarMunicipios(){
    while(selectMunicipio.firstChild){
        selectMunicipio.firstChild.remove()
    }
    
    municipios.forEach((nombre)=>{
        const municipioOption = document.createElement("option")
        municipioOption.value = nombre
        municipioOption.textContent =  nombre
        selectMunicipio.appendChild(municipioOption)
    })

}


function mostrar(id) {
    const host = document.getElementById("form_host");
    const macro = document.getElementById("form_macros");
    const inventory = document.getElementById("form_inventory");

    if (id === "form_host") {
        host.style.display = "block";
        macro.style.display = "none";
        inventory.style.display = "none";
    } else if (id === "form_macros") {
        macro.style.display = "block";
        host.style.display = "none";
        inventory.style.display = "none";
    } else {
        host.style.display = "none";
        macro.style.display = "none";
        inventory.style.display = "block";
    }

}

//Funcion que valida el formato de ip sea correcto
function validaIp(ip) {

    const object = document.getElementById(ip);
    const valorInputIp = object.value;

    var patronIp = new RegExp("^([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3})$");

    if (valorInputIp.search(patronIp) == 0) {

        valores = valorInputIp.split(".");
        if (valores[0] <= 255 && valores[1] <= 255 && valores[2] <= 255 && valores[3] <= 255) {

            return;
        }
    }

    alert("Formato de IP incorrecto por favor verificar")
}


//Funcion que valida que solo se digite numeros y el punto
function soloNumeros() {
    if ((event.keyCode != 46) && (event.keyCode < 48) || (event.keyCode > 57))
        event.returnValue = false;
}




