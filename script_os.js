const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdPBJ9mZBpN5p-_Cdx-zxjpcJKgxL-dF9xUMY0UyFPgwKLgl8Pb-jrFbxgKFMTAtPa/exec";
const SCRIPT_VERSION = "V10-LUME";

// =========================
// REGRAS
// =========================

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
    "PLA Azul": 0.10,
    "PLA Vermelho": 0.10,
    "PLA Verde": 0.10,
    "PLA Rosa": 0.10,
    "PLA Marrom": 0.10,
    "PLA Pele": 0.11,
    "PLA Azul Metálico": 0.12,
    "PLA Silk Azul": 0.12,
    "PLA Duo Verde": 0.16,
    "Filamento Dual Color Rosa": 0.16,
    "Filamento Dual Color Vermelho": 0.16,
    "PETG Preto": 0.11
  };
  return mapa[material] ?? 0.10;
}

// =========================
// CÁLCULO
// =========================

function calcularPreview(peso, tempo, tipo, pintura, material, ajusteManual = 0) {

  const pesoComPerda = Math.round((peso * 1.2) * 100) / 100;

  const custoMaterial = pesoComPerda * custoMaterialPreview(material);
  const energia = 5;
  const manutencao = tempo * 1;

  const maoObraBase = tipo === "Funcional" ? 20 : 30;

  let maoObraPintura = 0;
  if (tipo !== "Funcional") {
    if (pintura === "Básico") maoObraPintura = 35;
    if (pintura === "Médio") maoObraPintura = 60;
    if (pintura === "Avançado") maoObraPintura = 100;
    if (pintura === "Extrema") maoObraPintura = 150;
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

// =========================
// PREVIEW
// =========================

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

// =========================
// ENVIO
// =========================

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

  document.getElementById("formAppsScript").reset();
}
