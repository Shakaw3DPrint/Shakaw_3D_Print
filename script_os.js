function enviar(){

let cliente = document.getElementById("cliente").value
let projeto = document.getElementById("projeto").value
let altura = parseFloat(document.getElementById("altura").value)

let tipo = document.getElementById("tipo").value
let material = document.getElementById("material").value

let peso = parseFloat(document.getElementById("peso").value)
let tempo = parseFloat(document.getElementById("tempo").value)

let pintura = document.getElementById("pintura").value

let impressora = escolherImpressora(altura,tipo)

let valor = calcularValor(peso,tempo,pintura,tipo,material)

let dados = {

cliente:cliente,
projeto:projeto,
altura:altura,
tipo:tipo,
material:material,
peso:peso,
tempo:tempo,
pintura:pintura,
valor:valor,
impressora:impressora

}

fetch("https://script.google.com/macros/s/AKfycbyKBlla4R_fZfe4i91H7Ffn8jLo7ZfgCBq4ZrDne3vb3jKKbOlHDC6fA7ilYedvzU_3hw/exec",{

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

function custoMaterial(material){

if(material === "Resina"){
return 0.35
}

if(material === "PLA"){
return 0.09
}

if(material === "PLA Silk"){
return 0.12
}

if(material === "PLA Duo"){
return 0.16
}

if(material === "PETG"){
return 0.11
}

return 0.10

}

function calcularValor(peso,tempo,pintura,tipo,material){

let custoGrama = custoMaterial(material)

let custoMaterialTotal = peso * custoGrama

let custoTempo = tempo * 2

let valorPintura = 0

if(tipo === "Funcional"){
valorPintura = 0
}
else{

if(pintura === "Básico"){
valorPintura = 40
}

if(pintura === "Médio"){
valorPintura = 80
}

if(pintura === "Avançado"){
valorPintura = 150
}

}

let valorTotal = custoMaterialTotal + custoTempo + valorPintura

return Math.round(valorTotal)

}

function atualizarValor(){

let peso = parseFloat(document.getElementById("peso").value) || 0
let tempo = parseFloat(document.getElementById("tempo").value) || 0
let pintura = document.getElementById("pintura").value
let tipo = document.getElementById("tipo").value
let material = document.getElementById("material").value

let valor = calcularValor(peso,tempo,pintura,tipo,material)

document.getElementById("valorPreview").value = "R$ " + valor

}

document.getElementById("peso").addEventListener("input", atualizarValor)
document.getElementById("tempo").addEventListener("input", atualizarValor)
document.getElementById("pintura").addEventListener("change", atualizarValor)
document.getElementById("material").addEventListener("change", atualizarValor)
document.getElementById("tipo").addEventListener("change", atualizarValor)
