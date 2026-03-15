function enviar(){

let altura = parseFloat(document.getElementById("altura").value) || 0
let tipo = document.getElementById("tipo").value

let peso = parseFloat(document.getElementById("peso").value) || 0
let tempo = parseFloat(document.getElementById("tempo").value) || 0
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

fetch("https://script.google.com/macros/s/AKfycbwc1Jkxe-SPTEFsrI1SZTxAmmUpc8IAzwl9-8wSD2B9KR4AODJt8j3kU9MXGjJgBiO77g/exec",{

method:"POST",
mode:"no-cors",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(dados)

})

alert("Pedido enviado 🚀\nValor calculado: R$ " + valor)

}

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

function atualizarValor(){

let peso = parseFloat(document.getElementById("peso").value) || 0
let tempo = parseFloat(document.getElementById("tempo").value) || 0
let pintura = document.getElementById("pintura").value

let valor = calcularValor(peso,tempo,pintura)

document.getElementById("valor").value = valor

}
