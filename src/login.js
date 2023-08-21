console.log("conexion exitosa")

var url = "http://10.144.2.160/zabbix/api_jsonrpc.php";

// Obtener una referencia al elemento de input y al botón
const userName = document.getElementById("usuario");
const password = document.getElementById("password");
const logginButton = document.getElementById("logginButton");

// Agregar un evento de clic al botón para obtener el valor del input
logginButton.addEventListener("click", function(event) {
    event.preventDefault();
    const user = userName.value;
    const passwd =String(password.value);

    let bodyZ = {
        "jsonrpc":"2.0",
        "method":"user.login",
        "params":{
            "user":user,
            "password":passwd
        },
        "id":1,
        "auth":null
    };
    console.log(bodyZ)
    
    getItemZabbix(bodyZ); // Pasar bodyZ como argumento
});


async function getItemZabbix(bodyZ) { // Recibir bodyZ como parámetro
    const res = await fetch(url, {
        method: "POST", 
        body: JSON.stringify(bodyZ),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await res.json();
    //const result = data.result;
    console.log(data)
}

