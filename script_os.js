const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydHb_3RYP5JC9OcCWinqYmHgkeadb_TXhlm3pRldoH6lL7Pzt_7iPH07TfX3mfV_4vCg/exec";

const SCRIPT_VERSION = "V6-ESTOQUE-PERDA-CORRIGIDO";

function escolherImpressora(altura, tipo) {
  if (tipo === "Funcional") return "A1 Mini";
  if (altura <= 10) return "Mars 3 Pro";
  if (altura <= 18) return "Saturn 2";
  return "Saturn 4 Ultra";
}

function multiplicadorPintura(tipo, pintura) {
  if (tipo === "Funcional") return 1.3;
  if (pintura === "Sem pintura") return 1.3;
  if (pintura === "Básico") return 1.4;
  if (pintura === "Médio") return 1.5;
  if (pintura === "Avançado") return 1.6;
  if (pintura === "Extrema") return 1.8;
  return 1.3;
}

function custoMaterialPreview(material) {
  const mapa = {
    "Resina": 0.15,
    "PLA Preto": 0.10,
    "PLA Branco": 0.10,
    "PLA Silk Azul": 0.12,
    "PLA Duo Verde": 0.16,
    "PETG Preto": 0.11,
    "Filamento Dual Color Rosa": 0.16,
    "Filamento Dual Color Vermelho": 0.16,
    "PLA Rosa": 0.10,
    "PLA Azul": 0.10,
    "PLA Azul Metálico": 0.12,
    "PLA Marrom": 0.10,
    "PLA Vermelho": 0.10,
    "PLA Verde": 0.10,
    "PLA Pele": 0.10
  };

  return mapa[material] ?? 0.10;
}

function calcularPesoComPerda(peso) {
  return Math.round((peso * 1.2) * 100) / 100;
}

function calcularMaoObraBase(tipo) {
  return tipo === "Funcional" ? 20 : 30;
}

function calcularMaoObraPintura(tipo, pintura) {
  if (tipo === "Funcional") return 0;
  if (pintura === "Sem pintura") return 0;
  if (pintura === "Básico") return 35;
  if (pintura === "Médio") return 60;
  if (pintura === "Avançado") return 100;
  if (pintura === "Extrema") return 150;
  return 0;
}

function calcularValorPreview(peso, tempo, tipo, pintura, material) {
  const pesoComPerda = calcularPesoComPerda(peso);
  const custoMaterialTotal = pesoComPerda * custoMaterialPreview(material);
  const energia = 5;
  const manutencao = tempo * 1;
  const maoObraBase = calcularMaoObraBase(tipo);
  const maoObraPintura = calcularMaoObraPintura(tipo, pintura);

  const custoBase =
    custoMaterialTotal +
    energia +
    manutencao +
    maoObraBase +
    maoObraPintura;

  const multiplicador = multiplicadorPintura(tipo, pintura);

  return Math.round(custoBase * multiplicador);
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

  if (!cliente) {
    alert("Informe o cliente.");
    return;
  }

  if (!projeto) {
    alert("Informe o projeto.");
    return;
  }

  if (peso <= 0) {
    alert("Informe o peso do slicer.");
    return;
  }

  if (tempo <= 0) {
    alert("Informe o tempo de impressão.");
    return;
  }

  const impressora = escolherImpressora(altura, tipo);
  const pesoComPerda = calcularPesoComPerda(peso);
  const valorPreview = calcularValorPreview(peso, tempo, tipo, pintura, material);

  const formData = new FormData();
  formData.append("cliente", cliente);
  formData.append("projeto", projeto);
  formData.append("altura", altura);
  formData.append("tipo", tipo);
  formData.append("material", material);
  formData.append("peso", peso);
  formData.append("pesoComPerda", pesoComPerda);
  formData.append("tempo", tempo);
  formData.append("impressora", impressora);
  formData.append("pintura", pintura);
  formData.append("linkSTL", linkSTL);
  formData.append("observacoes", observacoes);
  formData.append("scriptVersion", SCRIPT_VERSION);

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    alert(
      `Pedido enviado 🚀\n` +
      `Valor estimado: R$ ${valorPreview}\n` +
      `Peso com perda: ${pesoComPerda} g\n` +
      `Impressora: ${impressora}`
    );

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
