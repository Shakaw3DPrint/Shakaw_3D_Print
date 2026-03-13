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

fetch("https://script.google.com/macros/s/AKfycbwOzBQZDLqHKCCFVwZ7xrlYJ__MeTOeENwqCpE9SGnHgIb8A1BRK2Jqc8v5hZZJaKFV/exec",{

method:"POST",
mode:"no-cors",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(dados)

})

alert("Pedido enviado para produção 🚀")

}
