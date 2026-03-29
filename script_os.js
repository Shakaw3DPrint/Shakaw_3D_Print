const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpOQdiIRhcvnOxt7eQkdIi5KqSqFw-bGPeiRuR7GwjLuUniV3Fi3JeCkZwGSYI2vI8sQ/exec";

function escolherImpressora(altura, tipo) {

  if (tipo === "Funcional") return "A1 Mini";

  if (altura <= 10) return "Mars 3 Pro";

  if (altura <= 18) return "Saturn 2";

  return "Saturn 4 Ultra";

}

function multiplicadorPintura(tipo, pintura) {

  if (tipo === "Funcional") return 1;

  if (pintura === "Sem pintura") return 0.8;

  if (pintura === "Básico") return 1.4;

  if (pintura === "Médio") return 1.5;

  if (pintura === "Avançado") return 1.6;

  if (pintura === "Extrema") return 1.8;

  return 1;

}

function custoMaterialPreview(material) {

  const mapa = {

    "Resina": 0.15,

    "PLA Preto": 0.10,

    "PLA Branco": 0.10,

    "PLA Azul": 0.10,

    "PLA Rosa": 0.10,

    "PLA Verde": 0.10,

    "PLA Vermelho": 0.10,

    "PLA Marrom": 0.10,

    "PLA Pele": 0.10,

    "PLA Azul Metálico": 0.12,

    "Filamento Dual Color Rosa": 0.16,

    "Filamento Dual Color Vermelho": 0.16,

    "PETG Preto": 0.11

  };

  return mapa[material] ?? 0.10;

}

function calcularValorPreview(peso, tempo, tipo, pintura, material) {

  const pesoComPerda = peso * 1.2;

  const materialTotal = pesoComPerda * custoMaterialPreview(material);

  const energia = 5;

  const manutencao = tempo * 1;

  const maoObraBase = tipo === "Funcional" ? 20 : 30;

  let maoObraPintura = 0;

  if (pintura === "Básico") maoObraPintura = 35;

  if (pintura === "Médio") maoObraPintura = 60;

  if (pintura === "Avançado") maoObraPintura = 100;

  if (pintura === "Extrema") maoObraPintura = 150;

  const custoBase = materialTotal + energia + manutencao + maoObraBase + maoObraPintura;

  const mult = multiplicadorPintura(tipo, pintura);

  return Math.round(custoBase * mult);

}

function atualizarPreview() {

  const altura = parseFloat(document.getElementById("altura").value) || 0;

  const tipo = document.getElementById("tipo").value;

  const material = document.getElementById("material").value;

  const peso = parseFloat(document.getElementById("peso").value) || 0;

  const tempo = parseFloat(document.getElementById("tempo").value) || 0;

  const pintura = document.getElementById("pintura").value;

  const impressora = escolherImpressora(altura, tipo);

  const valor = calcularValorPreview(peso, tempo, tipo, pintura, material);

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

  if (!cliente || !projeto || peso <= 0 || tempo <= 0) {

    alert("Preencha todos os campos obrigatórios.");

    return;

  }

  const impressora = escolherImpressora(altura, tipo);

  const valorPreview = calcularValorPreview(peso, tempo, tipo, pintura, material);

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

  formData.append("linkSTL", linkSTL);

  formData.append("observacoes", observacoes);

  try {

    await fetch(SCRIPT_URL, {

      method: "POST",

      mode: "no-cors",

      body: formData

    });

    alert(`Pedido enviado 🚀\nValor estimado: R$ ${valorPreview}`);

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
