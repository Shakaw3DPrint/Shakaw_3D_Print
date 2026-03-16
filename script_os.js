const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpOQdiIRhcvnOxt7eQkdIi5KqSqFw-bGPeiRuR7GwjLuUniV3Fi3JeCkZwGSYI2vI8sQ/exec";

const CONFIG_PREVIEW = {
  perdaPct: 20,
  energiaFixa: 5,
  manutencaoHora: 1,
  maoObraBase: {
    funcional: 20,
    figureDiorama: 30
  },
  pinturaFixa: {
    "Sem pintura": 0,
    "Básico": 35,
    "Médio": 60,
    "Avançado": 100,
    "Extrema": 150
  },
  multiplicadores: {
    "Sem pintura": 1.3,
    "Básico": 1.4,
    "Médio": 1.5,
    "Avançado": 1.6,
    "Extrema": 1.8
  },
  custoMaterial: {
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
    "PLA Pele": 0.11
  }
};

function escolherImpressora(altura, tipo) {
  if (tipo === "Funcional") return "A1 Mini";
  if (altura <= 10) return "Mars 3 Pro";
  if (altura <= 18) return "Saturn 2";
  return "Saturn 4 Ultra";
}

function custoMaterialPreview(material) {
  return CONFIG_PREVIEW.custoMaterial[material] ?? 0.10;
}

function maoObraBasePreview(tipo) {
  return tipo === "Funcional"
    ? CONFIG_PREVIEW.maoObraBase.funcional
    : CONFIG_PREVIEW.maoObraBase.figureDiorama;
}

function maoObraPinturaPreview(tipo, pintura) {
  if (tipo === "Funcional") return 0;
  return CONFIG_PREVIEW.pinturaFixa[pintura] ?? 0;
}

function multiplicadorPintura(tipo, pintura) {
  if (tipo === "Funcional") return CONFIG_PREVIEW.multiplicadores["Sem pintura"];
  return CONFIG_PREVIEW.multiplicadores[pintura] ?? CONFIG_PREVIEW.multiplicadores["Sem pintura"];
}

function calcularValorPreview(peso, tempo, tipo, pintura, material) {
  const pesoComPerda = peso * (1 + CONFIG_PREVIEW.perdaPct / 100);
  const custoMaterialTotal = pesoComPerda * custoMaterialPreview(material);
  const energia = CONFIG_PREVIEW.energiaFixa;
  const manutencao = tempo * CONFIG_PREVIEW.manutencaoHora;
  const maoObraBase = maoObraBasePreview(tipo);
  const maoObraPintura = maoObraPinturaPreview(tipo, pintura);
  const custoBase = custoMaterialTotal + energia + manutencao + maoObraBase + maoObraPintura;
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

  if (!cliente) return alert("Informe o cliente.");
  if (!projeto) return alert("Informe o projeto.");
  if (peso <= 0) return alert("Informe o peso do slicer.");
  if (tempo <= 0) return alert("Informe o tempo de impressão.");

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
  formData.append("valorPreview", valorPreview);
  formData.append("linkSTL", linkSTL);
  formData.append("observacoes", observacoes);

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    alert(`Pedido enviado 🚀\nValor estimado: R$ ${valorPreview}\nImpressora: ${impressora}\n\nConfirme na planilha se a linha entrou com a versão V4-NOCORS na coluna Z.`);

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

document.getElementById("altura").value) || 0;
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

  if (!cliente) return alert("Informe o cliente.");
  if (!projeto) return alert("Informe o projeto.");
  if (peso <= 0) return alert("Informe o peso do slicer.");
  if (tempo <= 0) return alert("Informe o tempo de impressão.");

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
  formData.append("valorPreview", valorPreview);
  formData.append("linkSTL", linkSTL);
  formData.append("observacoes", observacoes);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: formData
    });

    const text = await response.text();
    console.log("Resposta do Apps Script:", text);

    if (!response.ok || String(text).startsWith("ERRO")) {
      throw new Error(text || "Erro ao enviar pedido.");
    }

    alert(`Pedido enviado 🚀\nValor estimado: R$ ${valorPreview}\nImpressora: ${impressora}`);

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
    alert("Erro ao enviar pedido: " + error.message);
  }
}

document.getElementById("altura").addEventListener("input", atualizarPreview);
document.getElementById("tipo").addEventListener("change", atualizarPreview);
document.getElementById("material").addEventListener("change", atualizarPreview);
document.getElementById("peso").addEventListener("input", atualizarPreview);
document.getElementById("tempo").addEventListener("input", atualizarPreview);
document.getElementById("pintura").addEventListener("change", atualizarPreview);

atualizarPreview();
