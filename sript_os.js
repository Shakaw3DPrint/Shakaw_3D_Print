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

fetch("COLE_AQUI_URL_DO_SCRIPT",{

method:"POST",
body: JSON.stringify(dados)

})
.then(res=>res.text())
.then(data=>{

alert("Pedido registrado com sucesso!")

})

}
