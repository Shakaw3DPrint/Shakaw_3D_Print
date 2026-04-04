const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdPBJ9mZBpN5p-_Cdx-zxjpcJKgxL-dF9xUMY0UyFPgwKLgl8Pb-jrFbxgKFMTAtPa/exec";

function enviar() {
  alert("JS NOVO RODANDO");

  const form = document.getElementById("formAppsScript");
  form.action = SCRIPT_URL;

  document.getElementById("f_cliente").value = "Teste Front";
  document.getElementById("f_projeto").value = "Teste Front";
  document.getElementById("f_altura").value = "1";
  document.getElementById("f_tipo").value = "Funcional";
  document.getElementById("f_material").value = "PLA Preto";
  document.getElementById("f_peso").value = "10";
  document.getElementById("f_pesoComPerda").value = "12";
  document.getElementById("f_tempo").value = "1";
  document.getElementById("f_impressora").value = "A1 Mini";
  document.getElementById("f_pintura").value = "Sem pintura";
  document.getElementById("f_linkSTL").value = "";
  document.getElementById("f_observacoes").value = "Teste do front";
  document.getElementById("f_scriptVersion").value = "TESTE-FRONT";
  document.getElementById("f_ajusteManual").value = "0";
  document.getElementById("f_motivoAjuste").value = "teste";

  form.submit();
  alert("FORM SUBMETIDO");
}
