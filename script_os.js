function enviar(){

let dados = {

cliente: document.getElementById("cliente").value,
projeto: document.getElementById("projeto").value,
altura: document.getElementById("altura").value,
peso: document.getElementById("peso").value,
tempo: document.getElementById("tempo").value,
pintura: document.getElementById("pintura").value,
valor: document.getElementById("valor").value

}

console.log("Dados enviados:", dados)

  function escolherImpressora(altura,tipo){

if(tipo === "Funcional"){
return "A1 Mini"
}

if(altura <= 10){
return "Mars 3 Pro"
}

if(altura <= 18){
return "Saturn 2"
}

return "Saturn 4 Ultra"

}

fetch("https://script.google.com/macros/s/AKfycbz4xp2W2jvV869UAo-c3IlUoipb-2U5xJbuKcdfOTGnBywjUaRy_mgm90sRi2xePGTE/exec",{

method:"POST",
mode:"no-cors",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(dados)

})

alert("Pedido enviado para produção 🚀")

}
