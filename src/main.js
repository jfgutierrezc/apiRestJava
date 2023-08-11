window.onload = function () {
    var host = document.getElementById("form_host");
    var macro = document.getElementById("form_macros");
    var inventory = document.getElementById("form_inventory");

    host.style.display = "block";
    macro.style.display = "none";
    inventory.style.display = "none";



}

function mostrar(id) {
    var host = document.getElementById("form_host");
    var macro = document.getElementById("form_macros");
    var inventory = document.getElementById("form_inventory");

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


function cargarDepartamento(){
    fetch('src/Colombia.json')
    .then(respuesta => respuesta.json())
    .then(respuesta => console.log(respuesta))
}

cargarDepartamento();