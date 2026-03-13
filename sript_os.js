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

fetch("https://script.google.com/macros/s/AKfycbwOzBQZDLqHKCCFVwZ7xrlYJ__MeTOeENwqCpE9SGnHgIb8A1BRK2Jqc8v5hZZJaKFV/exec",{

method:"POST",
body: JSON.stringify(dados)

})
.then(res=>res.text())
.then(data=>{

alert("Pedido registrado com sucesso!")

})

}
