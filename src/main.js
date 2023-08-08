
//console.log("API URL = " + API_KEY)

var url = "http://10.144.2.160/zabbix/api_jsonrpc.php";
var bodyZ = {
    "jsonrpc": "2.0",
    "method": "item.get",
    "params": {
        "output": ["name","lastvalue","hostid","interfaceid","snmp_oid"],
        "groupids":["76"],
        "search": {
            "name": ["tension"]
        }
    },
    "auth": "d5aef56bf650141b17ee54a7f1e51bdc",
    "id": 2
};



async function getItemZabbix(){
const res = await fetch(url, {
    method: "POST", 
    body: JSON.stringify(bodyZ),
    headers: {
        "Content-Type": "application/json",
    },
    });
const data = await res.json();
const result = data.result[5]['name'];
console.log({data,result})
}


getItemZabbix();