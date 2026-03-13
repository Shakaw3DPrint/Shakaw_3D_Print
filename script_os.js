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



function enviar(){

let altura = parseFloat(document.getElementById("altura").value)
let tipo = document.getElementById("tipo").value

let impressora = escolherImpressora(altura,tipo)

let dados = {

cliente: document.getElementById("cliente").value,
projeto: document.getElementById("projeto").value,
altura: altura,
peso: document.getElementById("peso").value,
tempo: document.getElementById("tempo").value,
pintura: document.getElementById("pintura").value,
valor: document.getElementById("valor").value,
impressora: impressora

}

fetch("https://script.google.com/macros/s/AKfycbxJMvFEHKFTyYZqtAh5KnxJZvBszfabxW1IvJiUcYLl456DhhSsttM-c1qu_NQvVAM4/exec",{

method:"POST",
mode:"no-cors",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(dados)

})

alert("OS criada para " + impressora)

}
