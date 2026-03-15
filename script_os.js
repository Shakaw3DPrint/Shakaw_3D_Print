const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzM3SrL8uxUudEtPX0AUXBwAt8uGO7sYOVqvvXZjEJwrpPbjbn6n-iFfB5QHxYTO1nZbA/exec";

function escolherImpressora(altura, tipo) {
  if (tipo === "Funcional") {
    return "A1 Mini";
  }

  if (altura <= 10) {
    return "Mars 3 Pro";
  }

  if (altura <= 18) {
    return "Saturn 2";
  }

  return "Saturn 4 Ultra";
}

function multiplicadorPintura(tipo, pintura) {
  if (tipo === "Funcional") {
    return 1;
  }

  if (pintura === "Sem pintura") return 1;
  if (pintura === "Básico") return 1.75;
  if (pintura === "Médio") return 2.00;
  if (pintura === "Avançado") return 2.50;
  if (pintura === "Extrema") return 3.25;

  return 1;
}

function custoMaterial(material) {
  const mapa = {
    "Resina": 0.15,
    "PLA Preto": 0.10,
    "PLA Branco": 0.10,
    "PLA Silk Azul": 0.12,
    "PLA Duo Verde": 0.16,
    "PETG Preto": 0.11
  };

  return mapa[material] ?? 0.10;
}

function calcularValor(peso, tempo, tipo, pintura, material) {
  const perdaPercentual = 0.20;
  const pesoComPerda = peso * (1 + perdaPercentual);

  const custoGrama = custoMaterial(material);
  const custoMaterialTotal = pesoComPerda * custoGrama;

  const energia = 5;
  const manutencao = tempo * 1;

  const custoBase = custoMaterialTotal + energia + manutencao;
  const multiplicador = multiplicadorPintura(tipo, pintura);

  const valorTotal = custoBase * multiplicador;

  return Math.round(valorTotal);
}

function atualizarPreview() {
  const altura = parseFloat(document.getElementById("altura").value) || 0;
  const tipo = document.getElementById("tipo").value;
  const material = document.getElementById("material").value;
  const peso = parseFloat(document.getElementById("peso").value) || 0;
  const tempo = parseFloat(document.getElementById("tempo").value) || 0;
  const pintura = document.getElementById("pintura").value;

  const impressora = escolherImpressora(altura, tipo);
  const valor = calcularValor(peso, tempo, tipo, pintura, material);

  document.getElementById("impressoraPreview").value = impressora;
  document.getElementById("valorPreview").value = "R$ " + valor;
}

async function enviar() {
  const cliente = document.getElementById("cliente").value.trim();
  const projeto = document.getElementById("projeto").value.trim();
  const altura = parseFloat(document.getElementById("altura").value) || 0;
  const tipo = document.getElementById("tipo").value;
  const material = document.getElementById("material").value;
  const peso = parseFloat(document.getElementById("peso").value) || 0;
  const tempo = parseFloat(document.getElementById("tempo").value) || 0;
  const pintura = document.getElementById("pintura").value;
  const linkSTL = document.getElementById("linkSTL").value.trim();
  const observacoes = document.getElementById("observacoes").value.trim();

  if (!cliente) {
    alert("Informe o cliente.");
    return;
  }

  if (!projeto) {
    alert("Informe o projeto.");
    return;
  }

  if (peso <= 0) {
    alert("Informe o peso do slicer em gramas.");
    return;
  }

  if (tempo <= 0) {
    alert("Informe o tempo de impressão.");
    return;
  }

  const impressora = escolherImpressora(altura, tipo);
  const valor = calcularValor(peso, tempo, tipo, pintura, material);

  const formData = new FormData();
  formData.append("cliente", cliente);
  formData.append("projeto", projeto);
  formData.append("altura", altura);
  formData.append("tipo", tipo);
  formData.append("material", material);
  formData.append("peso", peso);
  formData.append("tempo", tempo);
  formData.append("impressora", impressora);
  formData.append("pintura", pintura);
  formData.append("valor", valor);
  formData.append("linkSTL", linkSTL);
  formData.append("observacoes", observacoes);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData
    });

    const text = await response.text();

    alert(`Pedido enviado 🚀\nValor calculado: R$ ${valor}\nImpressora: ${impressora}`);

    console.log("Resposta do Apps Script:", text);

    document.getElementById("cliente").value = "";
    document.getElementById("projeto").value = "";
    document.getElementById("altura").value = "";
    document.getElementById("peso").value = "";
    document.getElementById("tempo").value = "";
    document.getElementById("linkSTL").value = "";
    document.getElementById("observacoes").value = "";
    document.getElementById("tipo").value = "Figure";
    document.getElementById("material").selectedIndex = 0;
    document.getElementById("pintura").value = "Sem pintura";

    atualizarPreview();
  } catch (error) {
    console.error(error);
    alert("Erro ao enviar pedido.");
  }
}

document.getElementById("altura").addEventListener("input", atualizarPreview);
document.getElementById("tipo").addEventListener("change", atualizarPreview);
document.getElementById("material").addEventListener("change", atualizarPreview);
document.getElementById("peso").addEventListener("input", atualizarPreview);
document.getElementById("tempo").addEventListener("input", atualizarPreview);
document.getElementById("pintura").addEventListener("change", atualizarPreview);

atualizarPreview();
