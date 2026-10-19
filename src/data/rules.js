// Motor de consolidação da REDESIM — Bento Gonçalves/RS
// Regra central: os PDFs definem documentos; as tabelas definem a necessidade e o nível das licenças.
import { obterDocsPorAtividade } from './atividadesDocs.js';
import cnaeAmbientalData from './cnaeAmbiental.json';

export const VALOR_URM_ATUAL = 187.03;

const RISCO = { NA: 0, I: 1, II: 2, III: 3, P: 3 };

function normalizarPergunta(texto = '') {
  const s = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  if (s.includes('1000') && s.includes('area')) return 'area_1000m2';
  if (s.includes('2500') && s.includes('area')) return 'area_2500m2';
  if (s.includes('250') && s.includes('area')) return 'area_250m2';
  if (s.includes('500') && (s.includes('supermercado') || s.includes('shopping'))) return 'area_supermercado_500m2';
  if (s.includes('produto artesanal')) return 'produto_artesanal';
  return s;
}

function respostaDaPergunta(perguntas, respostas, fallbackSource) {
  return perguntas.map((p) => {
    const chave = normalizarPergunta(p.pergunta);
    const resposta = respostas[chave] ?? respostas[`${fallbackSource}_${p.id}`];
    if (resposta === undefined) return { ...p, chave, resposta: undefined, risco: 3, maiorPotencial: true };
    const valor = String(resposta).toUpperCase();
    const grau = p.respostas?.[valor]?.grau || (valor === 'SIM' ? 'III' : 'I');
    return { ...p, chave, resposta: valor, risco: RISCO[grau] ?? 1, grau, maiorPotencial: false };
  });
}

function inserirUnico(lista, item) {
  if (!lista.some((x) => x.nome === item.nome)) lista.push(item);
}

function categoriaDocumento(nome, detalhe, obrigatorio = true, fonte = '') {
  return { nome, detalhe, obrigatorio, fonte };
}

export function calcularEnquadramento(cnaesSelecionados, respostasPerguntas = {}, tipoEstabelecimento = 'ponto_fixo', isMei = false) {
  if (!cnaesSelecionados?.length) return null;
  const pontoReferencia = tipoEstabelecimento === 'ponto_referencia';
  const cleanCodes = cnaesSelecionados.map((c) => c.clean_code);
  const ambientalOficial = cnaesSelecionados.flatMap((cnae) => cnaeAmbientalData.filter((item) => item.cnae === cnae.clean_code));
  const classesAmbientais = ambientalOficial.map((item) => item.meioAmbiente).filter(Boolean);
  const nivelOficial = classesAmbientais.length ? Math.max(...classesAmbientais.map((classe) => classe === 'M1' ? 2 : ['M', 'M2', 'IBAMA'].includes(classe) ? 3 : 0)) : null;

  // TFLIF: a coluna da planilha usa múltiplos de URM (2 = 200% = 2 URMs).
  const cnaeTaxa = cnaesSelecionados.reduce((maior, c) => (Number(c.aliquota_tflif ?? 2) > Number(maior.aliquota_tflif ?? 2) ? c : maior), cnaesSelecionados[0]);
  const qtdUrm = Number(cnaeTaxa.aliquota_tflif ?? 2) >= 10 ? Number(cnaeTaxa.aliquota_tflif) / 100 : Number(cnaeTaxa.aliquota_tflif ?? 2);
  const valorTflif = isMei ? 0 : qtdUrm * VALOR_URM_ATUAL;

  if (pontoReferencia) {
    return {
      tipoEstabelecimento: 'ponto_referencia', nivelRiscoGeral: 'I', tituloRisco: 'Ponto de Referência — documentação reduzida', elegivelUmaHora: true,
      descricaoRisco: 'Endereço fiscal/correspondência sem atendimento, estoque ou operação no local.',
      temRiscoIII_Visa: false, temRiscoII_Visa: false, temRiscoIII_Smmam: false, temRiscoII_Smmam: false,
      sujeitoEiv: false, eivItens: [], perguntasPendentes: [], orientacoesVisa: [], orientacoesSmmam: [],
      tributario: { valorUrm: VALOR_URM_ATUAL, qtdUrm, aliquotaPercentual: qtdUrm * 100, valorTflif, isMei, setor: cnaeTaxa.setor, cnaeBaseTaxa: cnaeTaxa.cnae, baseLegal: 'Art. 195 a 197 da LC 183/2013; MEI conforme Art. 196' },
      documentos: [{ categoria: 'Ponto de Referência — PDF oficial', alerta: 'Documentos necessários', itens: [
        categoriaDocumento('Comprovante de residência atualizado', 'Em nome do responsável/proprietário, conforme o modelo oficial.', true, 'Ponto de Referência.pdf'),
        categoriaDocumento('Declaração de Ponto de Referência com firma reconhecida', 'Declaração de ausência de atendimento, estoque e operação no endereço.', true, 'Ponto de Referência.pdf'),
        categoriaDocumento('Contrato social / requerimento de empresário / CCMEI', 'Ato constitutivo da empresa.', true, 'Ponto de Referência.pdf'),
        categoriaDocumento('Cartão do CNPJ', 'Comprovante de inscrição e situação cadastral.', true, 'Ponto de Referência.pdf'),
        categoriaDocumento('Boletim de Informações Econômicas preenchido e assinado', 'Formulário municipal.', true, 'Ponto de Referência.pdf'),
        categoriaDocumento('Cópia dos documentos dos sócios', 'RG/CPF ou CNH.', true, 'Ponto de Referência.pdf')
      ] }]
    };
  }

  const perguntas = new Map();
  const visaResultados = [];
  const smmamResultados = [];
  const orientacoesVisa = [];
  const orientacoesSmmam = [];

  cnaesSelecionados.forEach((cnae) => {
    const v = cnae.visa || { risco: 'NA', perguntas: [] };
    const s = cnae.smmam || { risco: 'NA', perguntas: [] };
    const vr = v.risco === 'P' ? respostaDaPergunta(v.perguntas || [], respostasPerguntas, 'visa') : [{ risco: RISCO[v.risco] ?? 0, grau: v.risco, resposta: 'TABELA' }];
    const sr = s.risco === 'P' ? respostaDaPergunta(s.perguntas || [], respostasPerguntas, 'smmam') : [{ risco: RISCO[s.risco] ?? 0, grau: s.risco, resposta: 'TABELA' }];
    vr.forEach((p) => { visaResultados.push({ ...p, cnae: cnae.cnae }); if (p.resposta === undefined) perguntas.set(p.chave, { ...p, origem: 'VISA', cnae: cnae.cnae }); });
    sr.forEach((p) => { smmamResultados.push({ ...p, cnae: cnae.cnae }); if (p.resposta === undefined && !perguntas.has(p.chave)) perguntas.set(p.chave, { ...p, origem: 'SMMAM', cnae: cnae.cnae }); });
    if (v.orientacao) inserirUnico(orientacoesVisa, { nome: cnae.cnae, detalhe: v.orientacao });
    if (s.orientacao) inserirUnico(orientacoesSmmam, { nome: cnae.cnae, detalhe: s.orientacao });
  });

  const maiorVisa = Math.max(0, ...visaResultados.map((p) => p.risco));
  const maiorSmmamTabela = Math.max(0, ...smmamResultados.map((p) => p.risco));
  // A planilha FINAL_atualiza... passa a ser a fonte principal quando houver registro oficial para o CNAE.
  const maiorSmmam = nivelOficial === null ? maiorSmmamTabela : nivelOficial;
  const perguntasPendentes = [...perguntas.values()];
  const eivItens = cnaesSelecionados.filter((c) => c.eiv?.sujeito).map((c) => ({ cnae: c.cnae, descricao: c.descricao, enquadramento: c.eiv.enquadramento_legal, grauRisco: c.eiv.grau_risco }));

  const documentos = [];
  const docsAtividade = obterDocsPorAtividade(cleanCodes);
  const docsPdf = docsAtividade.docs.map((d) => categoriaDocumento(d.nome, `${d.detalhe} Fonte: ${d.arquivoFonte}`, true, d.arquivoFonte));
  // Para CNAE sem PDF específico, usa somente a lista-base do PDF Ponto Fixo Padrão.
  if (!docsPdf.length) {
    ['Habite-se', 'Contrato de locação (se for locado)', 'Contrato social', 'Cartão do CNPJ', 'PPCI ou certificado de conformidade', 'Boletim de Informações Econômicas preenchido e assinado', 'Cópia do documento dos sócios'].forEach((nome) => docsPdf.push(categoriaDocumento(nome, 'Documento listado no modelo Ponto Fixo Padrão.pdf.', true, 'Ponto Fixo Padrão.pdf')));
  }
  documentos.push({ categoria: `Documentos dos PDFs de atividade${docsAtividade.titulos.length ? ` — ${docsAtividade.titulos.join(' / ')}` : ''}`, alerta: 'Lista final consolidada — sem seleção individual', itens: docsPdf });

  // As tabelas decidem se há licença. A listagem usa o maior potencial quando uma pergunta não foi respondida.
  if (maiorVisa >= 3) documentos.push({ categoria: 'Vigilância Sanitária — Nível III', alerta: 'Licença obrigatória antes da operação', itens: [categoriaDocumento('Alvará de Autorização Sanitária (AAS)', 'Licença sanitária prévia conforme maior risco da tabela VISA.', true, 'Tabela_Licenc_v5B_-_VISA_Bento_Gonçalves.xlsx'), categoriaDocumento('Documentos sanitários complementares do PDF da atividade', 'Ex.: controle de pragas, limpeza de caixa d’água ou potabilidade, somente quando constarem do PDF aplicável.', true, 'PDF da atividade')] });
  else if (maiorVisa === 2) documentos.push({ categoria: 'Vigilância Sanitária — Nível II', alerta: 'Licenciamento provisório/regular conforme tabela', itens: [categoriaDocumento('Licença/Alvará Sanitário conforme procedimento de Nível II', 'A validade e o procedimento seguem a tabela VISA; não presumir AAS definitivo.', true, 'Tabela VISA'), categoriaDocumento('Declarações e respostas sanitárias aplicáveis', 'Geradas a partir das perguntas oficiais respondidas.', true, 'Tabela VISA')] });
  else documentos.push({ categoria: 'Vigilância Sanitária — Nível I/NA', alerta: 'Sem licença sanitária prévia pela classificação da tabela', itens: [categoriaDocumento('Dispensa/baixo risco sanitário', 'Resultado da tabela VISA; manter obrigações sanitárias gerais aplicáveis.', false, 'Tabela VISA')] });

  if (maiorSmmam >= 3) documentos.push({ categoria: 'Meio Ambiente — Nível III', alerta: 'Licença ambiental obrigatória antes da operação', itens: [categoriaDocumento('Licença ambiental aplicável (LO/LP/LI)', 'Protocolar na SMMAM ou FEPAM conforme competência indicada pela tabela e pela Resolução CONSEMA nº 372/2018.', true, 'Tabela Licenciamento Ambiental - SMMAM.xlsx'), categoriaDocumento('Estudos, projetos e ART exigidos no processo ambiental', 'Somente os documentos definidos pelo órgão no licenciamento do CNAE/porte.', true, 'Tabela SMMAM')] });
  else if (maiorSmmam === 2) documentos.push({ categoria: 'Meio Ambiente — Nível II', alerta: 'Licenciamento ambiental aplicável conforme porte/área', itens: [categoriaDocumento('Licenciamento Ambiental Municipal (LP / LI / LO / Declaração)', 'O município de Bento Gonçalves adota LP, LI, LO, LOR ou Declaração/Isenção conforme Decreto 10.819/2021 e LC 183/2013 (não há LAS).', true, 'Decreto Municipal 10.819/2021 e LC 183/2013')] });
  else documentos.push({ categoria: 'Meio Ambiente — Nível I/NA', alerta: 'Sem licença ambiental prévia pela classificação da tabela', itens: [categoriaDocumento('Dispensa/baixo risco ambiental', 'Resultado da tabela SMMAM; não substitui obrigações ambientais gerais.', false, 'Tabela SMMAM')] });

  if (eivItens.length) documentos.push({ categoria: 'Urbanismo — EIV/EII', alerta: 'Atividade listada no Anexo 9.1; análise urbanística necessária', itens: [categoriaDocumento('EIV/EII com ART — conforme análise do IPURB', `CNAEs enquadrados: ${eivItens.map((e) => `${e.cnae} (${e.enquadramento})`).join('; ')}. A exigência final depende da regra de porte, localização e zoneamento.`, true, 'Ferramenta_Tributaria_Bento_Goncalves.xlsx / LC 200/2018')] });
  else documentos.push({ categoria: 'Urbanismo — EIV/EII', alerta: 'Sem enquadramento específico na tabela EIV', itens: [categoriaDocumento('EIV/EII', 'Não solicitado para os CNAEs selecionados pela tabela consultada.', false, 'Tabela Cnae X EIV')] });

  const nivel = Math.max(maiorVisa, maiorSmmam);
  const nivelRiscoGeral = nivel >= 3 ? 'III' : nivel === 2 ? 'II' : 'I';
  return {
    tipoEstabelecimento: 'ponto_fixo', nivelRiscoGeral, tituloRisco: nivelRiscoGeral === 'III' ? 'Alto Risco (Nível III)' : nivelRiscoGeral === 'II' ? 'Médio Risco (Nível II)' : 'Baixo Risco (Nível I)',
    elegivelUmaHora: nivelRiscoGeral === 'I' && perguntasPendentes.length === 0,
    descricaoRisco: perguntasPendentes.length ? 'A listagem abaixo considera o maior potencial enquanto existem perguntas sem resposta. Responda-as para reduzir a exigência, quando permitido pela tabela.' : 'Listagem final consolidada conforme o maior risco entre os órgãos licenciadores.',
    temRiscoIII_Visa: maiorVisa >= 3, temRiscoII_Visa: maiorVisa === 2, temRiscoIII_Smmam: maiorSmmam >= 3, temRiscoII_Smmam: maiorSmmam === 2,
    ambientalOficial, nivelAmbientalOficial: nivelOficial,
    sujeitoEiv: eivItens.length > 0, eivItens, perguntasPendentes, orientacoesVisa, orientacoesSmmam,
    tributario: { valorUrm: VALOR_URM_ATUAL, qtdUrm, aliquotaPercentual: qtdUrm * 100, valorTflif, isMei, setor: cnaeTaxa.setor, cnaeBaseTaxa: cnaeTaxa.cnae, baseLegal: 'Art. 195 a 197 da LC 183/2013; MEI conforme Art. 196' },
    documentos
  };
}
