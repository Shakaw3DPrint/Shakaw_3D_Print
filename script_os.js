const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdPBJ9mZBpN5p-_Cdx-zxjpcJKgxL-dF9xUMY0UyFPgwKLgl8Pb-jrFbxgKFMTAtPa/exec";
const SCRIPT_VERSION = "V11-CONFIG-DINAMICA";

let SHAKAW_CONFIG = {
  perdaPercent: 20,
  energiaFixa: 5,
  manutencaoHora: 1,
  multSemPintura: 1.3,
  multBasico: 1.4,
  multMedio: 1.5,
  multAvancado: 1.6,
  multExtrema: 1.8,
  maoObraFuncional: 20,
  maoObraFigure: 30,
  pinturaBasico: 35,
  pinturaMedio: 60,
  pinturaAvancado: 100,
  pinturaExtrema: 150
};

let SHAKAW_MATERIAIS = [];

function escolherImpressora(altura, tipo) {
  if (tipo === "Funcional") return "A1 Mini";
  if (altura <= 10) return "Mars 3 Pro";
  if (altura <= 18) return "Saturn 2";
  return "Saturn 4 Ultra";
}

function multiplicadorPintura(tipo, pintura) {
  if (tipo === "Funcional") return SHAKAW_CONFIG.multSemPintura;
  if (pintura === "Sem pintura") return SHAKAW_CONFIG.multSemPintura;
  if (pintura === "Básico") return SHAKAW_CONFIG.multBasico;
  if (pintura === "Médio") return SHAKAW_CONFIG.multMedio;
  if (pintura === "Avançado") return SHAKAW_CONFIG.multAvancado;
  if (pintura === "Extrema") return SHAKAW_CONFIG.multExtrema;
  return SHAKAW_CONFIG.multSemPintura;
}

function custoMaterialPreview(material) {
  const encontrado = SHAKAW_MATERIAIS.find(
    item => normalizarTexto(item.material) === normalizarTexto(material)
  );

  return encontrado ? Number(encontrado.custo_g || 0) : 0.10;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function calcularPreview(peso, tempo, tipo, pintura, material, ajusteManual = 0) {
  const pesoComPerda = Math.round((peso * (1 + SHAKAW_CONFIG.perdaPercent / 100)) * 100) / 100;

  const custoMaterial = pesoComPerda * custoMaterialPreview(material);
  const energia = Number(SHAKAW_CONFIG.energiaFixa || 0);
  const manutencao = tempo * Number(SHAKAW_CONFIG.manutencaoHora || 0);

  const maoObraBase =
    tipo === "Funcional"
      ? Number(SHAKAW_CONFIG.maoObraFuncional || 0)
      : Number(SHAKAW_CONFIG.maoObraFigure || 0);

  let maoObraPintura = 0;
  if (tipo !== "Funcional") {
    if (pintura === "Básico") maoObraPintura = Number(SHAKAW_CONFIG.pinturaBasico || 0);
    if (pintura === "Médio") maoObraPintura = Number(SHAKAW_CONFIG.pinturaMedio || 0);
    if (pintura === "Avançado") maoObraPintura = Number(SHAKAW_CONFIG.pinturaAvancado || 0);
    if (pintura === "Extrema") maoObraPintura = Number(SHAKAW_CONFIG.pinturaExtrema || 0);
  }

  const custoBase =
    custoMaterial +
    energia +
    manutencao +
    maoObraBase +
    maoObraPintura;

  const multiplicador = multiplicadorPintura(tipo, pintura);
  const valorCalculado = Math.round(custoBase * multiplicador);
  const valorFinal = Math.round((valorCalculado + ajusteManual) * 100) / 100;

  return {
    pesoComPerda,
    valorCalculado,
    valorFinal
  };
}

function atualizarPreview() {
  const altura = parseFloat(document.getElementById("altura").value) || 0;
  const tipo = document.getElementById("tipo").value;
  const material = document.getElementById("material").value;
  const peso = parseFloat(document.getElementById("peso").value) || 0;
  const tempo = parseFloat(document.getElementById("tempo").value) || 0;
  const pintura = document.getElementById("pintura").value;
  const ajusteManual = parseFloat(document.getElementById("ajusteManual").value) || 0;

  const impressora = escolherImpressora(altura, tipo);
  const calc = calcularPreview(peso, tempo, tipo, pintura, material, ajusteManual);

  document.getElementById("impressoraPreview").value = impressora;
  document.getElementById("valorPreview").value =
    "R$ " + calc.valorFinal.toFixed(2).replace(".", ",");
}

function enviar() {
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
  const ajusteManual = parseFloat(document.getElementById("ajusteManual").value) || 0;
  const motivoAjuste = document.getElementById("motivoAjuste").value.trim();

  if (!cliente) return alert("Informe o cliente.");
  if (!projeto) return alert("Informe o projeto.");
  if (peso <= 0) return alert("Informe o peso.");
  if (tempo <= 0) return alert("Informe o tempo.");

  const impressora = escolherImpressora(altura, tipo);
  const calc = calcularPreview(peso, tempo, tipo, pintura, material, ajusteManual);

  const form = document.getElementById("formAppsScript");
  form.action = SCRIPT_URL;

  document.getElementById("f_cliente").value = cliente;
  document.getElementById("f_projeto").value = projeto;
  document.getElementById("f_altura").value = altura;
  document.getElementById("f_tipo").value = tipo;
  document.getElementById("f_material").value = material;
  document.getElementById("f_peso").value = peso;
  document.getElementById("f_pesoComPerda").value = calc.pesoComPerda;
  document.getElementById("f_tempo").value = tempo;
  document.getElementById("f_impressora").value = impressora;
  document.getElementById("f_pintura").value = pintura;
  document.getElementById("f_linkSTL").value = linkSTL;
  document.getElementById("f_observacoes").value = observacoes;
  document.getElementById("f_scriptVersion").value = SCRIPT_VERSION;
  document.getElementById("f_ajusteManual").value = ajusteManual;
  document.getElementById("f_motivoAjuste").value = motivoAjuste;

  form.submit();

  alert(
    `Pedido enviado 🚀\n` +
    `Valor final: R$ ${calc.valorFinal.toFixed(2).replace(".", ",")}`
  );

  document.getElementById("cliente").value = "";
  document.getElementById("projeto").value = "";
  document.getElementById("altura").value = "";
  document.getElementById("peso").value = "";
  document.getElementById("tempo").value = "";
  document.getElementById("linkSTL").value = "";
  document.getElementById("observacoes").value = "";
  document.getElementById("ajusteManual").value = "0";
  document.getElementById("motivoAjuste").value = "";
  document.getElementById("tipo").value = "Figure";
  document.getElementById("material").selectedIndex = 0;
  document.getElementById("pintura").value = "Sem pintura";

  atualizarPreview();
}

function carregarConfigShakaw(payload) {
  if (!payload || !payload.ok) {
    console.error("Erro ao carregar Config:", payload);
    return;
  }

  SHAKAW_CONFIG = payload.config || SHAKAW_CONFIG;
  SHAKAW_MATERIAIS = payload.materiais || [];

  atualizarPreview();
}

function carregarConfigRemota() {
  const script = document.createElement("script");
  script.src = `${SCRIPT_URL}?action=config&callback=carregarConfigShakaw&_=${Date.now()}`;
  document.body.appendChild(script);
}

document.getElementById("altura").addEventListener("input", atualizarPreview);
document.getElementById("tipo").addEventListener("change", atualizarPreview);
document.getElementById("material").addEventListener("change", atualizarPreview);
document.getElementById("peso").addEventListener("input", atualizarPreview);
document.getElementById("tempo").addEventListener("input", atualizarPreview);
document.getElementById("pintura").addEventListener("change", atualizarPreview);
document.getElementById("ajusteManual").addEventListener("input", atualizarPreview);

atualizarPreview();
carregarConfigRemota();
