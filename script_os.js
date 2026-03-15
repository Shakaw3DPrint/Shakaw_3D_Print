function enviar(){

let cliente = document.getElementById("cliente").value
let projeto = document.getElementById("projeto").value
let altura = parseFloat(document.getElementById("altura").value) || 0

let tipo = document.getElementById("tipo").value
let material = document.getElementById("material").value

let peso = parseFloat(document.getElementById("peso").value) || 0
let tempo = parseFloat(document.getElementById("tempo").value) || 0

let pintura = "Sem pintura"

let impressora = escolherImpressora(altura,tipo)

let valor = calcularValor(peso,tempo,pintura,material)

let formData = new FormData()

formData.append("cliente", cliente)
formData.append("projeto", projeto)
formData.append("altura", altura)
formData.append("tipo", tipo)
formData.append("material", material)
formData.append("peso", peso)
formData.append("tempo", tempo)
formData.append("pintura", pintura)
formData.append("valor", valor)
formData.append("impressora", impressora)

fetch("https://script.google.com/macros/s/AKfycbx-0miRM89EDXKSeUBtFOSHDkBO6sOC7jVTu6LTAtjvcH6Op1MA5Ob8bweR5KcIB1cKlg/exec",{

method: "POST",
body: formData

})
.then(response => response.text())
.then(data => {

alert("Pedido enviado 🚀\nValor calculado: R$ " + valor)

})
.catch(error => {

alert("Erro ao enviar pedido")

console.error(error)

})

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
return 0.15
}

if(material === "PLA"){
return 0.10
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

function calcularValor(peso,tempo,pintura,material){

let pesoComPerda = peso * 1.2

let custoGrama = custoMaterial(material)

let materialTotal = pesoComPerda * custoGrama

let energia = 5

let manutencao = tempo * 1

let custoTotal = materialTotal + energia + manutencao

let margem = 2.5

let valorTotal = custoTotal * margem

return Math.round(valorTotal)

}

function atualizarValor(){

let peso = parseFloat(document.getElementById("peso").value) || 0
let tempo = parseFloat(document.getElementById("tempo").value) || 0
let material = document.getElementById("material").value

let valor = calcularValor(peso,tempo,"",material)

document.getElementById("valorPreview").value = "R$ " + valor

}

document.getElementById("peso").addEventListener("input", atualizarValor)
document.getElementById("tempo").addEventListener("input", atualizarValor)
document.getElementById("material").addEventListener("change", atualizarValor)
