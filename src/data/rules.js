// Motor de Regras de Documentação, Enquadramento e Cálculo Tributário (TFLIF / URM)
// Prefeitura Municipal de Bento Gonçalves / RS

import { obterDocsPorAtividade } from './atividadesDocs.js';

export const VALOR_URM_ATUAL = 187.03; // Definido oficialmente para Bento Gonçalves

export function calcularEnquadramento(
  cnaesSelecionados, 
  respostasPerguntas = {}, 
  tipoEstabelecimento = 'ponto_fixo',
  isMei = false
) {
  if (!cnaesSelecionados || cnaesSelecionados.length === 0) {
    return null;
  }

  const isPontoReferencia = tipoEstabelecimento === 'ponto_referencia';
  const cleanCodes = cnaesSelecionados.map(c => c.clean_code);

  // 1. Cálculo Tributário TFLIF (Art. 195 a 197 LC 183/2013)
  // Alíquota máxima entre as atividades selecionadas (§ 2° do Art. 197)
  let aliquotaTflif = 2.0;
  let setorDominante = 'Comércio/Serviços';
  let maiorGrauRiscoFiscal = 'Baixo Risco A';
  let cnaeMaiorTaxa = cnaesSelecionados[0];

  cnaesSelecionados.forEach((c) => {
    const aliq = c.aliquota_tflif !== undefined ? c.aliquota_tflif : 2.0;
    if (aliq > aliquotaTflif) {
      aliquotaTflif = aliq;
      setorDominante = c.setor || setorDominante;
      maiorGrauRiscoFiscal = c.grau_risco_fiscal || maiorGrauRiscoFiscal;
      cnaeMaiorTaxa = c;
    }
  });

  // Valor em Reais da TFLIF: (aliquota % * URM)
  // Nota: MEI é isento conforme Art. 196 da LC 183/2013
  // A alíquota na tabela municipal expressa o múltiplo de URM (ex: 2 = 200% = 2 URMs; 3 = 300% = 3 URMs)
  // Art. 197 LC 183/2013: Indústria, Comércio e Serviços = 200% (2 URMs); Construção/Postos = 300% (3 URMs)
  const qtdUrm = aliquotaTflif >= 10 ? (aliquotaTflif / 100) : aliquotaTflif;
  const percentualUrm = qtdUrm * 100;
  const valorTflifReais = isMei ? 0.0 : (qtdUrm * VALOR_URM_ATUAL);

  // 2. Análise de EIV (Anexo 9.1 do Plano Diretor)
  const eivItens = cnaesSelecionados
    .filter(c => c.eiv && c.eiv.sujeito)
    .map(c => ({
      cnae: c.cnae,
      descricao: c.descricao,
      enquadramento: c.eiv.enquadramento_legal,
      grauRisco: c.eiv.grau_risco
    }));

  const sujeitoEiv = eivItens.length > 0;

  // 3. Caso seja PONTO DE REFERÊNCIA
  if (isPontoReferencia) {
    return {
      tipoEstabelecimento: 'ponto_referencia',
      nivelRiscoGeral: 'I',
      tituloRisco: 'Baixo Risco (Nível I) - Ponto de Referência',
      elegivelUmaHora: true,
      descricaoRisco: 'Ponto de referência/endereço fiscal sem circulação de público e sem estoque. Dispensado de Habite-se comercial, PPCI, alvará sanitário e licenciamento ambiental no local. Elegível para abertura imediata em até 1 hora na REDESIM.',
      temRiscoIII_Visa: false,
      temRiscoII_Visa: false,
      temRiscoIII_Smmam: false,
      temRiscoII_Smmam: false,
      sujeitoEiv: false,
      eivItens: [],
      tributario: {
        valorUrm: VALOR_URM_ATUAL,
        aliquotaPercentual: percentualUrm,
        qtdUrm: qtdUrm,
        valorTflif: valorTflifReais,
        isMei,
        setor: setorDominante,
        cnaeBaseTaxa: cnaeMaiorTaxa.cnae,
        baseLegal: 'Art. 195 a 197 da LC 183/2013 e LC 123/2006 (MEI)'
      },
      orientacoesVisa: ['Dispensado de alvará sanitário no local por se tratar exclusivamente de ponto de referência/endereço fiscal.'],
      orientacoesSmmam: ['Dispensado de licenciamento ambiental por não haver atividade potencialmente poluidora no local.'],
      perguntasPendentes: [],
      documentos: [
        {
          categoria: 'Documentação Obrigatória - Ponto de Referência (Base Oficial)',
          obrigatorio: true,
          alerta: 'Base: Ponto de Referência.pdf - Sala do Empreendedor',
          itens: [
            { nome: 'Comprovante de Residência Atualizado', detalhe: 'Conta de água, luz ou telefone recente em nome do sócio ou proprietário do imóvel.' },
            { nome: 'Declaração de Ponto de Referência com Firma Reconhecida', detalhe: 'Atestando que o local servirá estritamente para correspondência e domicílio fiscal, sem atendimento presencial e sem depósito.' },
            { nome: 'Contrato Social / Requerimento de Empresário / CCMEI', detalhe: 'Registrado na Junta Comercial (JUCISRS) ou Cartório com as devidas atividades.' },
            { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de inscrição e de situação cadastral na Receita Federal.' },
            { nome: 'Boletim de Informações Econômicas (BIE)', detalhe: 'Preenchido e assinado pelo titular, sócio ou contador habilitado.' },
            { nome: 'Cópia do Documento dos Sócios', detalhe: 'Cópia de RG/CPF ou CNH válida de todos os sócios e administradores.' }
          ]
        },
        {
          categoria: 'Isenções e Desonerações (REDESIM)',
          obrigatorio: false,
          alerta: 'Desburocratização Automática',
          itens: [
            { nome: 'Dispensa de Habite-se Comercial e Contrato de Locação Comercial', detalhe: 'Por não haver estabelecimento aberto ao público no imóvel residencial/referencial.' },
            { nome: 'Dispensa de PPCI / Vistoria do Bombeiros no Endereço', detalhe: 'Conforme normas de domicílio fiscal do CBMRS.' },
            { nome: 'Dispensa de Licença Sanitária e Licença Ambiental no Local', detalhe: 'Atividade operacional exercida externamente ou digitalmente.' }
          ]
        }
      ]
    };
  }

  // --- SE FOR PONTO FIXO ---
  let temRiscoIII_Visa = false;
  let temRiscoII_Visa = false;
  let temRiscoIII_Smmam = false;
  let temRiscoII_Smmam = false;

  const orientacoesVisa = [];
  const orientacoesSmmam = [];
  const perguntasPendentes = [];
  const perguntasUnificadasMap = new Map();

  cnaesSelecionados.forEach((item) => {
    // 1. Processar VISA
    const vRisco = item.visa?.risco || 'NA';
    if (vRisco === 'III') {
      temRiscoIII_Visa = true;
    } else if (vRisco === 'II') {
      temRiscoII_Visa = true;
    } else if (vRisco === 'P') {
      const pergs = item.visa?.perguntas || [];
      pergs.forEach((p) => {
        // Verificar se é pergunta de área/porte que pode ser unificada
        const chaveUnificada = normalizarPergunta(p.pergunta);
        const respostaExistente = respostasPerguntas[chaveUnificada] || respostasPerguntas[`visa_${p.id}`];

        if (respostaExistente === undefined) {
          if (!perguntasUnificadasMap.has(chaveUnificada)) {
            perguntasUnificadasMap.set(chaveUnificada, {
              chave: chaveUnificada,
              idOriginal: `visa_${p.id}`,
              origem: 'Vigilância Sanitária',
              cnae: item.cnae,
              pergunta: p.pergunta,
              descritivo: p.descritivo,
              tipo: 'visa'
            });
          }
        } else {
          // Aplicar resposta
          const respUpper = respostaExistente.toUpperCase();
          const infoResp = p.respostas?.[respUpper];
          const grau = infoResp?.grau || (respUpper === 'SIM' ? 'III' : 'I');
          if (grau === 'III') temRiscoIII_Visa = true;
          else if (grau === 'II') temRiscoII_Visa = true;
        }
      });
    }

    if (item.visa?.orientacao && !orientacoesVisa.includes(item.visa.orientacao)) {
      orientacoesVisa.push(item.visa.orientacao);
    }

    // 2. Processar SMMAM
    const sRisco = item.smmam?.risco || 'NA';
    if (sRisco === 'III') {
      temRiscoIII_Smmam = true;
    } else if (sRisco === 'II') {
      temRiscoII_Smmam = true;
    } else if (sRisco === 'P') {
      const pergs = item.smmam?.perguntas || [];
      pergs.forEach((p) => {
        const chaveUnificada = normalizarPergunta(p.pergunta);
        const respostaExistente = respostasPerguntas[chaveUnificada] || respostasPerguntas[`smmam_${p.id}`];

        if (respostaExistente === undefined) {
          if (!perguntasUnificadasMap.has(chaveUnificada)) {
            perguntasUnificadasMap.set(chaveUnificada, {
              chave: chaveUnificada,
              idOriginal: `smmam_${p.id}`,
              origem: 'Meio Ambiente (SMMAM)',
              cnae: item.cnae,
              pergunta: p.pergunta,
              descritivo: p.descritivo,
              tipo: 'smmam'
            });
          }
        } else {
          const respUpper = respostaExistente.toUpperCase();
          const infoResp = p.respostas?.[respUpper];
          const grau = infoResp?.grau || (respUpper === 'SIM' ? 'III' : 'I');
          if (grau === 'III') temRiscoIII_Smmam = true;
          else if (grau === 'II') temRiscoII_Smmam = true;
        }
      });
    }

    if (item.smmam?.orientacao && !orientacoesSmmam.includes(item.smmam.orientacao)) {
      orientacoesSmmam.push(item.smmam.orientacao);
    }
  });

  perguntasUnificadasMap.forEach(val => perguntasPendentes.push(val));

  // Determinar Risco Geral Consolidado (Decreto 10.342/2019 / LLE)
  let nivelRiscoGeral = 'I';
  let tituloRisco = 'Baixo Risco (Nível I)';
  let elegivelUmaHora = true;
  let descricaoRisco = 'Ponto Fixo de Baixo Risco. Dispensado de alvará prévio e vistoria inicial. Abertura automatizada no portal da REDESIM em até 1 hora.';

  if (temRiscoIII_Visa || temRiscoIII_Smmam) {
    nivelRiscoGeral = 'III';
    tituloRisco = 'Alto Risco (Nível III)';
    elegivelUmaHora = false;
    descricaoRisco = 'Ponto Fixo com atividade de Alto Risco em órgão licenciador. Exige vistorias prévias e licenças definitivas antes do início de operação.';
  } else if (temRiscoII_Visa || temRiscoII_Smmam) {
    nivelRiscoGeral = 'II';
    tituloRisco = 'Médio Risco (Nível II)';
    elegivelUmaHora = false;
    descricaoRisco = 'Ponto Fixo de Médio Risco. Permite alvará provisório ou licenças simplificadas com fiscalização a posteriori.';
  }

  // 4. Montagem das Categorias de Documentos
  const docsAtividades = obterDocsPorAtividade(cleanCodes);

  const documentos = [
    {
      categoria: 'Cadastro e Imobiliário (Base: Ponto Fixo Padrão.pdf)',
      obrigatorio: true,
      alerta: 'Exigência Documental Municipal Básica',
      itens: [
        { nome: 'Habite-se Comercial, Matrícula Averbada ou Laudo Técnico (Dec. 10.342/2019)', detalhe: 'Comprovante oficial de conclusão e regularidade da construção para a finalidade comercial pretendida.' },
        { nome: 'Contrato de Locação (se locado) ou Matrícula Atualizada do Imóvel', detalhe: 'Documento que autorize a ocupação do imóvel com firmas reconhecidas em cartório.' },
        { nome: 'Contrato Social / Requerimento de Empresário / CCMEI', detalhe: 'Ato constitutivo ou de alteração registrado na JUCISRS ou Cartório competente.' },
        { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de Inscrição e Situação Cadastral atualizado emitido pela Receita Federal.' },
        { nome: 'Boletim de Informações Econômicas (BIE)', detalhe: 'Requerimento padrão do Município de Bento Gonçalves preenchido e assinado.' },
        { nome: 'Cópia de Documento de Identificação dos Sócios', detalhe: 'RG/CPF ou CNH válida de todos os integrantes do quadro societário.' }
      ]
    },
    {
      categoria: 'Prevenção Contra Incêndio (CBMRS / Bombeiros)',
      obrigatorio: true,
      alerta: 'Segurança contra Incêndio',
      itens: [
        { 
          nome: 'Plano de Prevenção e Combate Contra Incêndio (PPCI) ou Certificado de Conformidade (CLCB)', 
          detalhe: 'Protocolo de aprovação ou alvará do CBMRS com ART/RRT de projeto e execução.' 
        }
      ]
    }
  ];

  // Adicionar Documentos Específicos da Atividade extraídos dos PDFs
  if (docsAtividades.docs.length > 0) {
    documentos.push({
      categoria: `Documentos Específicos da Atividade (${docsAtividades.titulos.join(' / ')})`,
      obrigatorio: true,
      alerta: 'Mapeado dos modelos específicos em PDF da Prefeitura',
      itens: docsAtividades.docs.map(d => ({
        nome: d.nome,
        detalhe: `${d.detalhe} (Fonte: ${d.arquivoFonte})`
      }))
    });
  }

  // Vigilância Sanitária
  if (temRiscoIII_Visa) {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: true,
      alerta: 'Alto Risco Sanitário - Alvará Sanitário Prévio Obrigatório',
      itens: [
        { nome: 'Alvará de Autorização Sanitária (AAS)', detalhe: 'Vistoria sanitária prévia com processo integrado municipal antes do início das atividades.' },
        { nome: 'Anotação de Responsabilidade Técnica (ART/CRT)', detalhe: 'Registro do profissional responsável perante o conselho de classe competente.' },
        { nome: 'Manual de Boas Práticas e Procedimentos Operacionais Padronizados (POP)', detalhe: 'Instruções higiênico-sanitárias de manipulação e controle.' },
        { nome: 'Laudo de Controle de Pragas e Vetores', detalhe: 'Certificado de dedetização e desratização emitido por empresa licenciada.' },
        { nome: 'Laudo de Limpeza de Caixa d\'Água', detalhe: 'Comprovante semestral de desinfecção de reservatórios de água.' }
      ]
    });
  } else if (temRiscoII_Visa) {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: false,
      alerta: 'Médio Risco Sanitário - Alvará Provisório / Fiscalização Posterior',
      itens: [
        { nome: 'Declaração Eletrônica de Ciência e Responsabilidade Sanitária', detalhe: 'Emitida na viabilidade REDESIM com validade de até 12 meses.' },
        { nome: 'Laudo de Controle de Pragas e Limpeza de Reservatórios', detalhe: 'Apresentado na vistoria de rotina da fiscalização sanitária.' }
      ]
    });
  } else {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: false,
      alerta: 'Baixo Risco Sanitário - Dispensado de Alvará Prévio',
      itens: [
        { nome: 'Dispensa Automática de Licenciamento Sanitário', detalhe: 'Atividade sem risco sanitário ou de baixo risco dispensada pela Lei da Liberdade Econômica.' }
      ]
    });
  }

  // Meio Ambiente (SMMAM / FEPAM)
  if (temRiscoIII_Smmam) {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM / FEPAM)',
      obrigatorio: true,
      alerta: 'Alto Risco Ambiental - Licença Ambiental Obrigatória (CONSEMA 372/2018)',
      itens: [
        { nome: 'Licença de Operação (LO) ou Licença Prévia/Instalação (LP/LI)', detalhe: 'Protocolado no Portal do Cidadão de Bento Gonçalves ou na FEPAM conforme competência de impacto.' },
        { nome: 'Plano de Controle Ambiental (PCA) com ART', detalhe: 'Projeto técnico de tratamento de efluentes, resíduos e controle de emissões.' },
        { nome: 'Certidão de Zoneamento e Uso do Solo para fins Ambientais', detalhe: 'Expedida pelo IPURB.' }
      ]
    });
  } else if (temRiscoII_Smmam) {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM)',
      obrigatorio: false,
      alerta: 'Médio Risco Ambiental - Licença Simplificada (LAS)',
      itens: [
        { nome: 'Licença Ambiental Simplificada (LAS) ou Declaração de Não Passível', detalhe: 'Solicitação eletrônica com autodeclaração de porte e atendimento a condicionantes.' }
      ]
    });
  } else {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM)',
      obrigatorio: false,
      alerta: 'Baixo Risco Ambiental - Dispensado',
      itens: [
        { nome: 'Dispensa Automática de Licença Ambiental', detalhe: 'Atividade dispensada de atos autorizativos ambientais.' }
      ]
    });
  }

  // EIV - Estudo de Impacto de Vizinhança
  if (sujeitoEiv) {
    documentos.push({
      categoria: 'Planejamento Urbano e Zoneamento (IPURB / EIV)',
      obrigatorio: true,
      alerta: 'Atividade Sujeita a Análise de Impacto de Vizinhança (Anexo 9.1)',
      itens: [
        { 
          nome: 'EIV/EII (Estudo do Impacto da Vizinhança/Inovação) APROVADO com ART', 
          detalhe: `Atividades relacionadas no Plano Diretor: ${eivItens.map(e => `${e.cnae} (${e.enquadramento})`).join('; ')}. O estudo deve ser elaborado por Arquiteto ou Engenheiro e aprovado pelo IPURB.` 
        }
      ]
    });
  }

  return {
    tipoEstabelecimento: 'ponto_fixo',
    nivelRiscoGeral,
    tituloRisco,
    elegivelUmaHora,
    descricaoRisco,
    temRiscoIII_Visa,
    temRiscoII_Visa,
    temRiscoIII_Smmam,
    temRiscoII_Smmam,
    sujeitoEiv,
    eivItens,
    tributario: {
      valorUrm: VALOR_URM_ATUAL,
      aliquotaPercentual: percentualUrm,
        qtdUrm: qtdUrm,
      valorTflif: valorTflifReais,
      isMei,
      setor: setorDominante,
      cnaeBaseTaxa: cnaeMaiorTaxa.cnae,
      baseLegal: 'Art. 195 a 197 da LC 183/2013 e LC 123/2006 (MEI)'
    },
    orientacoesVisa,
    orientacoesSmmam,
    perguntasPendentes,
    documentos
  };
}

// Normalizador de perguntas para evitar duplicação entre VISA e SMMAM
function normalizarPergunta(texto) {
  if (!texto) return '';
  const limpo = texto.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Equivalências comuns de área
  if (limpo.includes('1000') && (limpo.includes('area') || limpo.includes('artesanal'))) {
    return 'area_util_1000m2_artesanal';
  }
  if (limpo.includes('2500') && limpo.includes('area')) {
    return 'area_construida_2500m2';
  }
  if (limpo.includes('250') && limpo.includes('area')) {
    return 'area_util_250m2';
  }
  if (limpo.includes('500') && (limpo.includes('supermercado') || limpo.includes('shopping'))) {
    return 'area_util_supermercado_500m2';
  }
  if (limpo.includes('produto artesanal') && !limpo.includes('1000')) {
    return 'produto_artesanal_diferente';
  }

  return limpo;
}
