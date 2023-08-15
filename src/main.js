window.onload = function () {
    const host = document.getElementById("form_host");
    const macro = document.getElementById("form_macros");
    const inventory = document.getElementById("form_inventory");

    host.style.display = "block";
    macro.style.display = "none";
    inventory.style.display = "none";



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

// Select anidados para departamento y municipios

let info = '/data/colombia.json'
fetch(info)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error))

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


