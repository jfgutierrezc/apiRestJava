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


function cargarDepartamento() {
    fetch('src/Colombia.json')
        .then(respuesta => respuesta.json())
        .then(respuesta => console.log(respuesta))
}

cargarDepartamento();


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

function soloNumeros() {
    if ((event.keyCode != 46 ) && (event.keyCode < 48) || (event.keyCode > 57)  ) 
     event.returnValue = false;
   }

