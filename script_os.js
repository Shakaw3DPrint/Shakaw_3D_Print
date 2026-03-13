function enviar(){

let altura = parseFloat(document.getElementById("altura").value)
let tipo = document.getElementById("tipo").value

let peso = parseFloat(document.getElementById("peso").value)
let tempo = parseFloat(document.getElementById("tempo").value)
let pintura = document.getElementById("pintura").value

let impressora = escolherImpressora(altura,tipo)

let valor = calcularValor(peso,tempo,pintura)

let dados = {

cliente: document.getElementById("cliente").value,
projeto: document.getElementById("projeto").value,
altura: altura,
peso: peso,
tempo: tempo,
pintura: pintura,
valor: valor,
impressora: impressora

}

fetch("https://script.google.com/macros/s/AKfycbz4xp2W2jvV869UAo-c3IlUoipb-2U5xJbuKcdfOTGnBywjUaRy_mgm90sRi2xePGTE/exec",{

method:"POST",
mode:"no-cors",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(dados)

})

alert("Pedido enviado 🚀\nValor calculado: R$ " + valor)

}
function calcularValor(peso,tempo,pintura){

let custoResina = peso * 0.35
let custoTempo = tempo * 2

let valorPintura = 0

if(pintura === "Básico"){
valorPintura = 40
}

if(pintura === "Médio"){
valorPintura = 80
}

if(pintura === "Avançado"){
valorPintura = 150
}

let valorTotal = custoResina + custoTempo + valorPintura

return Math.round(valorTotal)

}
