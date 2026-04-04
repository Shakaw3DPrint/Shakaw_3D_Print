const SCRIPT_VERSION = "V8-BACK-FORM-IFRAME";
const PLANILHA_ID = "https://script.google.com/macros/s/AKfycby-HwTYP1I3HqXGX5CLeMBC5kZU1DY9FUX-wIzuqIeQ6oSUJOnVl8sxY2JDGzrrMfbJSQ/exec";
const ABA_PEDIDOS = "Pedidos";
const ABA_ESTOQUE = "Estoque";
const ABA_CONFIG = "Config";

function doPost(e) {
  try {
    const planilha = SpreadsheetApp.openById(PLANILHA_ID);
    const pedidos = planilha.getSheetByName(ABA_PEDIDOS);

    const linha = primeiraLinhaVaziaColunaA(pedidos);
    const agora = new Date();
    const id = gerarNovoId_(pedidos);

    const cliente = String(e.parameter.cliente || "").trim();
    const projeto = String(e.parameter.projeto || "").trim();
    const altura = lerNumeroSeguro_(e.parameter.altura || 0);
    const tipo = String(e.parameter.tipo || "").trim();
    const material = String(e.parameter.material || "").trim();
    const peso = lerNumeroSeguro_(e.parameter.peso || 0);
    const pesoComPerdaRecebido = lerNumeroSeguro_(e.parameter.pesoComPerda || 0);
    const tempo = lerNumeroSeguro_(e.parameter.tempo || 0);
    const impressora = String(e.parameter.impressora || "").trim();
    const pintura = String(e.parameter.pintura || "Sem pintura").trim();
    const linkSTL = String(e.parameter.linkSTL || "").trim();
    const observacoes = String(e.parameter.observacoes || "").trim();
    const scriptVersionFront = String(e.parameter.scriptVersion || "").trim();

    const cfg = lerConfiguracoes_(planilha);
    const custoPorGrama = buscarCustoMaterial_(planilha, material);

    const pesoComPerda = arred2_(
      pesoComPerdaRecebido > 0
        ? pesoComPerdaRecebido
        : peso * (1 + cfg.perdaPercent / 100)
    );

    if (pesoComPerda <= 0) {
      throw new Error("Peso com perda inválido.");
    }

    const custoMaterial = arred2_(pesoComPerda * custoPorGrama);
    const energia = arred2_(cfg.energiaFixa);
    const manutencao = arred2_(tempo * cfg.manutencaoHora);

    const maoObraBase = arred2_(
      tipo === "Funcional" ? cfg.maoObraFuncional : cfg.maoObraFigure
    );

    const maoObraPintura = arred2_(calcularMaoObraPintura_(tipo, pintura, cfg));
    const custoBase = arred2_(custoMaterial + energia + manutencao + maoObraBase + maoObraPintura);
    const multiplicador = calcularMultiplicador_(tipo, pintura, cfg);
    const valorFinal = Math.round(custoBase * multiplicador);

    pedidos.getRange(linha, 1, 1, 11).setValues([[
      id, agora, cliente, projeto, altura, tipo, material, peso, tempo, impressora, pintura
    ]]);

    pedidos.getRange(linha, 12).setValue(pesoComPerda);     // L
    pedidos.getRange(linha, 13).setValue(custoMaterial);    // M
    pedidos.getRange(linha, 14).setValue(energia);          // N
    pedidos.getRange(linha, 15).setValue(manutencao);       // O
    pedidos.getRange(linha, 16).setValue(custoBase);        // P
    pedidos.getRange(linha, 17).setValue(multiplicador);    // Q
    pedidos.getRange(linha, 18).setValue(valorFinal);       // R

    pedidos.getRange(linha, 19).setValue("Orçamento");      // S
    pedidos.getRange(linha, 20).setValue("");               // T
    pedidos.getRange(linha, 21).setValue(linkSTL);          // U
    pedidos.getRange(linha, 22).setValue(observacoes);      // V
    pedidos.getRange(linha, 23).setValue("");               // W

    pedidos.getRange(linha, 24).setValue(maoObraBase);                 // X
    pedidos.getRange(linha, 25).setValue(maoObraPintura);              // Y
    pedidos.getRange(linha, 26).setValue(scriptVersionFront || SCRIPT_VERSION); // Z

    return ContentService
      .createTextOutput("OK")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (erro) {
    return ContentService
      .createTextOutput("ERRO: " + erro.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function primeiraLinhaVaziaColunaA(sheet) {
  const ultimaLinha = Math.max(sheet.getLastRow(), 2);
  const valores = sheet.getRange(2, 1, ultimaLinha - 1, 1).getValues();

  for (let i = 0; i < valores.length; i++) {
    if (!valores[i][0]) return i + 2;
  }
  return ultimaLinha + 1;
}

function gerarNovoId_(sheet) {
  const ultimaLinha = sheet.getLastRow();
  if (ultimaLinha < 2) return "OS-001";

  const ids = sheet.getRange(2, 1, ultimaLinha - 1, 1).getValues().flat();
  let maior = 0;

  ids.forEach(id => {
    const m = String(id || "").match(/^OS-(\d+)$/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maior) maior = n;
    }
  });

  return "OS-" + String(maior + 1).padStart(3, "0");
}

function lerConfiguracoes_(planilha) {
  const cfg = planilha.getSheetByName(ABA_CONFIG);

  return {
    perdaPercent: lerNumeroSeguro_(cfg.getRange("B4").getValue()) || 20,
    energiaFixa: lerNumeroSeguro_(cfg.getRange("B5").getValue()) || 5,
    manutencaoHora: lerNumeroSeguro_(cfg.getRange("B6").getValue()) || 1,
    multSemPintura: lerNumeroSeguro_(cfg.getRange("B7").getValue()) || 1.3,
    multBasico: lerNumeroSeguro_(cfg.getRange("B8").getValue()) || 1.4,
    multMedio: lerNumeroSeguro_(cfg.getRange("B9").getValue()) || 1.5,
    multAvancado: lerNumeroSeguro_(cfg.getRange("B10").getValue()) || 1.6,
    multExtrema: lerNumeroSeguro_(cfg.getRange("B11").getValue()) || 1.8,
    maoObraFuncional: lerNumeroSeguro_(cfg.getRange("B12").getValue()) || 20,
    maoObraFigure: lerNumeroSeguro_(cfg.getRange("B13").getValue()) || 30,
    pinturaBasico: lerNumeroSeguro_(cfg.getRange("B14").getValue()) || 35,
    pinturaMedio: lerNumeroSeguro_(cfg.getRange("B15").getValue()) || 60,
    pinturaAvancado: lerNumeroSeguro_(cfg.getRange("B16").getValue()) || 100,
    pinturaExtrema: lerNumeroSeguro_(cfg.getRange("B17").getValue()) || 150
  };
}

function buscarCustoMaterial_(planilha, material) {
  const estoque = planilha.getSheetByName(ABA_ESTOQUE);
  const ultimaLinha = estoque.getLastRow();
  const dados = estoque.getRange(2, 1, Math.max(ultimaLinha - 1, 1), 3).getValues();

  for (let i = 0; i < dados.length; i++) {
    const nome = String(dados[i][0] || "");
    const custo = lerNumeroSeguro_(dados[i][2]);

    if (compararMaterial_(nome, material)) {
      return custo;
    }
  }

  throw new Error(`Material "${material}" não encontrado na aba Estoque.`);
}

function calcularMultiplicador_(tipo, pintura, cfg) {
  if (tipo === "Funcional") return cfg.multSemPintura;
  if (pintura === "Sem pintura") return cfg.multSemPintura;
  if (pintura === "Básico") return cfg.multBasico;
  if (pintura === "Médio") return cfg.multMedio;
  if (pintura === "Avançado") return cfg.multAvancado;
  if (pintura === "Extrema") return cfg.multExtrema;
  return cfg.multSemPintura;
}

function calcularMaoObraPintura_(tipo, pintura, cfg) {
  if (tipo === "Funcional") return 0;
  if (pintura === "Sem pintura") return 0;
  if (pintura === "Básico") return cfg.pinturaBasico;
  if (pintura === "Médio") return cfg.pinturaMedio;
  if (pintura === "Avançado") return cfg.pinturaAvancado;
  if (pintura === "Extrema") return cfg.pinturaExtrema;
  return 0;
}

function onEdit(e) {
  try {
    if (!e || !e.range) return;

    const sheet = e.range.getSheet();
    if (sheet.getName() !== ABA_PEDIDOS) return;

    const linha = e.range.getRow();
    const coluna = e.range.getColumn();

    if (linha < 2 || coluna !== 19) return;

    const novoStatus = normalizarTexto_(e.range.getValue());
    if (novoStatus !== "IMPRIMINDO") return;

    baixarEstoqueDoPedido_(e.source, sheet, linha);

  } catch (erro) {
    Logger.log("Erro no onEdit: " + erro.message);
    try {
      SpreadsheetApp.getActive().toast("Erro no controle de estoque: " + erro.message, "Shakaw OS", 8);
    } catch (_) {}
  }
}

function baixarEstoqueDoPedido_(planilha, pedidos, linha) {
  const estoque = planilha.getSheetByName(ABA_ESTOQUE);

  const materialOriginal = String(pedidos.getRange(linha, 7).getDisplayValue()).trim();
  const pesoComPerda = lerNumeroSeguro_(pedidos.getRange(linha, 12).getValue());
  const baixaEstoque = normalizarTexto_(pedidos.getRange(linha, 23).getValue());

  if (baixaEstoque === "SIM") return;

  if (!materialOriginal || pesoComPerda <= 0) {
    pedidos.getRange(linha, 23).setValue("ERRO");
    SpreadsheetApp.getActive().toast(
      "Material ou peso com perda inválido para a linha " + linha,
      "Shakaw OS",
      6
    );
    return;
  }

  const ultimaLinhaEstoque = estoque.getLastRow();
  const dados = estoque.getRange(2, 1, Math.max(ultimaLinhaEstoque - 1, 1), 2).getValues();

  let linhaEstoque = -1;
  let quantidadeAtual = 0;

  for (let i = 0; i < dados.length; i++) {
    const materialEstoque = String(dados[i][0] || "");
    if (compararMaterial_(materialEstoque, materialOriginal)) {
      linhaEstoque = i + 2;
      quantidadeAtual = lerNumeroSeguro_(dados[i][1]);
      break;
    }
  }

  if (linhaEstoque === -1) {
    pedidos.getRange(linha, 23).setValue("MATERIAL NÃO ENCONTRADO");
    SpreadsheetApp.getActive().toast(
      `Material "${materialOriginal}" não encontrado no estoque.`,
      "Shakaw OS",
      8
    );
    return;
  }

  const novaQuantidade = arred2_(quantidadeAtual - pesoComPerda);
  estoque.getRange(linhaEstoque, 2).setValue(novaQuantidade);
  pedidos.getRange(linha, 23).setValue("SIM");

  if (novaQuantidade < 0) {
    SpreadsheetApp.getActive().toast(
      `Atenção: estoque negativo para ${materialOriginal}.`,
      "Shakaw OS",
      8
    );
  }
}

function compararMaterial_(a, b) {
  return normalizarTexto_(a) === normalizarTexto_(b);
}

function normalizarTexto_(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function lerNumeroSeguro_(valor) {
  if (typeof valor === "number") return valor;

  let texto = String(valor || "").trim();
  if (!texto) return 0;

  texto = texto
    .replace(/R\$/gi, "")
    .replace(/kg/gi, "")
    .replace(/g/gi, "")
    .replace(/\s+/g, "");

  if (texto.includes(",") && texto.includes(".")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  const n = parseFloat(texto);
  return isNaN(n) ? 0 : n;
}

function arred2_(valor) {
  return Math.round((Number(valor) || 0) * 100) / 100;
}

function limparFormulasAntigasPedidos_() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  const pedidos = planilha.getSheetByName(ABA_PEDIDOS);
  const ultimaLinha = pedidos.getLastRow();

  for (let linha = 2; linha <= ultimaLinha; linha++) {
    const id = pedidos.getRange(linha, 1).getValue();
    if (!id) {
      pedidos.getRange(linha, 12, 1, 7).clearContent();
      pedidos.getRange(linha, 24, 1, 3).clearContent();
    }
  }
}
