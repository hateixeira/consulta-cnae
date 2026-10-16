// Motor de Regras de Documentação e Enquadramento - REDESIM Bento Gonçalves

export function calcularEnquadramento(cnaesSelecionados, respostasPerguntas = {}) {
  if (!cnaesSelecionados || cnaesSelecionados.length === 0) {
    return null;
  }

  let temRiscoIII_Visa = false;
  let temRiscoII_Visa = false;
  let temRiscoIII_Smmam = false;
  let temRiscoII_Smmam = false;

  const orientacoesVisa = [];
  const orientacoesSmmam = [];
  const perguntasPendentes = [];

  cnaesSelecionados.forEach((item) => {
    // Avaliar VISA
    const vRisco = item.visa?.risco || 'NA';
    if (vRisco === 'III') {
      temRiscoIII_Visa = true;
    } else if (vRisco === 'II') {
      temRiscoII_Visa = true;
    } else if (vRisco === 'P') {
      // Avaliar respostas do usuário se houver perguntas
      const perguntas = item.visa?.perguntas || [];
      perguntas.forEach((p) => {
        const resp = respostasPerguntas[`visa_${p.id}`];
        if (resp === undefined) {
          perguntasPendentes.push({
            id: `visa_${p.id}`,
            origem: 'Vigilância Sanitária',
            cnae: item.cnae,
            descricao: item.descricao,
            texto: p.texto
          });
        } else if (resp === 'sim') {
          temRiscoIII_Visa = true;
        } else {
          temRiscoII_Visa = true;
        }
      });
    }

    if (item.visa?.orientacao && !orientacoesVisa.includes(item.visa.orientacao)) {
      orientacoesVisa.push(item.visa.orientacao);
    }

    // Avaliar SMMAM
    const sRisco = item.smmam?.risco || 'NA';
    if (sRisco === 'III') {
      temRiscoIII_Smmam = true;
    } else if (sRisco === 'II') {
      temRiscoII_Smmam = true;
    } else if (sRisco === 'P') {
      const perguntas = item.smmam?.perguntas || [];
      perguntas.forEach((p) => {
        const resp = respostasPerguntas[`smmam_${p.id}`];
        if (resp === undefined) {
          perguntasPendentes.push({
            id: `smmam_${p.id}`,
            origem: 'Meio Ambiente (SMMAM)',
            cnae: item.cnae,
            descricao: item.descricao,
            texto: p.texto
          });
        } else if (resp === 'sim') {
          temRiscoIII_Smmam = true;
        } else {
          temRiscoII_Smmam = true;
        }
      });
    }

    if (item.smmam?.orientacao && !orientacoesSmmam.includes(item.smmam.orientacao)) {
      orientacoesSmmam.push(item.smmam.orientacao);
    }
  });

  // Determinar Risco Geral Consolidado (Decreto 10.342/2019 / LLE)
  let nivelRiscoGeral = 'I';
  let tituloRisco = 'Baixo Risco (Nível I)';
  let elegivelUmaHora = true;
  let descricaoRisco = 'Dispensado de atos públicos de liberação prévia (alvarás e licenças prévias). Abertura automatizada no portal da REDESIM em até 1 hora.';

  if (temRiscoIII_Visa || temRiscoIII_Smmam) {
    nivelRiscoGeral = 'III';
    tituloRisco = 'Alto Risco (Nível III)';
    elegivelUmaHora = false;
    descricaoRisco = 'Exige vistoria e licenciamento prévio obrigatório pelos órgãos competentes antes do início das atividades.';
  } else if (temRiscoII_Visa || temRiscoII_Smmam) {
    nivelRiscoGeral = 'II';
    tituloRisco = 'Médio Risco (Nível II)';
    elegivelUmaHora = false;
    descricaoRisco = 'Permite emissão de alvará provisório ou licenças simplificadas com vistoria a posteriori.';
  }

  // Lista de Documentos Estruturados
  const documentos = [
    {
      categoria: 'Cadastro e Fazenda Municipal (Geral)',
      obrigatorio: true,
      itens: [
        { nome: 'Habite-se do imóvel ou Certidão de Edificação Averbada', detalhe: 'Comprova regularidade da construção onde a empresa será instalada.' },
        { nome: 'Contrato de Locação ou Matrícula Atualizada do Imóvel', detalhe: 'Se locado, contrato com reconhecimento de firmas; se próprio, certidão de matrícula recente.' },
        { nome: 'Contrato Social / Requerimento de Empresário / CCMEI', detalhe: 'Ato constitutivo registrado na Junta Comercial (JUCISRS) ou Cartório.' },
        { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de Inscrição e de Situação Cadastral emitido pela Receita Federal.' },
        { nome: 'Documento de Identificação dos Sócios e Administradores', detalhe: 'Cópia de RG/CPF ou CNH válida.' },
        { nome: 'Boletim de Informações Econômicas (BIE)', detalhe: 'Preenchido e assinado pelo responsável legal ou contador credenciado.' }
      ]
    },
    {
      categoria: 'Prevenção Contra Incêndio (CBMRS / Bombeiros)',
      obrigatorio: true,
      itens: [
        { 
          nome: 'Plano de Prevenção e Combate Contra Incêndio (PPCI) ou Certificado de Conformidade (CLCB)', 
          detalhe: nivelRiscoGeral === 'I' 
            ? 'Para atividades de baixo risco/baixo potencial sem circulação de público, pode ser emitido Certificado de Licenciamento do Corpo de Bombeiros simplificado.' 
            : 'Protocolo de aprovação ou alvará do Corpo de Bombeiros Militar do RS.'
        }
      ]
    }
  ];

  // Adicionar Documentos da Vigilância Sanitária
  if (temRiscoIII_Visa) {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: true,
      alerta: 'Alto Risco Sanitário - Licenciamento Prévio Obrigatório',
      itens: [
        { nome: 'Alvará de Autorização Sanitária (AAS)', detalhe: 'Vistoria sanitária prévia antes de iniciar o atendimento.' },
        { nome: 'Anotação de Responsabilidade Técnica (ART/CRT)', detalhe: 'Registro do Responsável Técnico perante o Conselho de Classe (CRF, CRM, CRBio, CRQ, etc.).' },
        { nome: 'Manual de Boas Práticas e Procedimentos Operacionais Padronizados (POP)', detalhe: 'Documentação técnica de controle higiênico-sanitário.' },
        { nome: 'Plano de Gerenciamento de Resíduos de Serviços de Saúde (PGRSS)', detalhe: 'Exigido se houver geração de resíduos infectantes ou biológicos.' }
      ]
    });
  } else if (temRiscoII_Visa) {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: false,
      alerta: 'Médio Risco Sanitário - Alvará Provisório / Fiscalização Posterior',
      itens: [
        { nome: 'Declaração de Cumprimento das Exigências Sanitárias', detalhe: 'Termo de responsabilidade assinado informando cumprimento das normas de saúde.' },
        { nome: 'Comprovante de Higienização de Reservatórios de Água e Controle de Pragas', detalhe: 'Laudo de limpeza de caixa d\'água e desinsetização atualizados.' }
      ]
    });
  } else {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: false,
      alerta: 'Dispensado de Licenciamento Sanitário Prévio (Lei da Liberdade Econômica)',
      itens: [
        { nome: 'Declaração Eletrônica de Baixo Risco Sanitário', detalhe: 'Gerada automaticamente na viabilidade da REDESIM.' }
      ]
    });
  }

  // Adicionar Documentos de Meio Ambiente (SMMAM)
  if (temRiscoIII_Smmam) {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM / FEPAM)',
      obrigatorio: true,
      alerta: 'Alto Risco Ambiental - Licença Ambiental Obrigatória (Resolução CONSEMA 372/2018)',
      itens: [
        { nome: 'Requerimento de Licenciamento Ambiental Municipal ou FEPAM', detalhe: 'Protocolado no Portal do Cidadão de Bento Gonçalves ou FEPAM (se competência estadual).' },
        { nome: 'Certidão de Zoneamento e Uso do Solo para fins Ambientais', detalhe: 'Expedida pelo Instituto de Pesquisa e Planejamento Urbano (IPURB).' },
        { nome: 'Estudo / Plano de Controle Ambiental (PCA) com ART', detalhe: 'Elaborado por engenheiro ambiental/químico habilitado.' },
        { nome: 'Outorga ou Dispensa de Outorga de Uso da Água (DRH/SEMA)', detalhe: 'Se utilizar poço artesiano ou captação superficial.' }
      ]
    });
  } else if (temRiscoII_Smmam) {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM)',
      obrigatorio: false,
      alerta: 'Médio Risco Ambiental - Licenciamento Simplificado ou Declaração',
      itens: [
        { nome: 'Certidão de Não Passível de Licenciamento ou Licença Ambiental Simplificada (LAS)', detalhe: 'Solicitação digital via protocolo do município com declaração de porte e atividade.' }
      ]
    });
  } else {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM)',
      obrigatorio: false,
      alerta: 'Dispensado de Licenciamento Ambiental Municipal',
      itens: [
        { nome: 'Dispensa Automática de Licença Ambiental', detalhe: 'Atividade sem impacto ambiental significativo cadastrada no sistema REDESIM.' }
      ]
    });
  }

  return {
    nivelRiscoGeral,
    tituloRisco,
    elegivelUmaHora,
    descricaoRisco,
    temRiscoIII_Visa,
    temRiscoII_Visa,
    temRiscoIII_Smmam,
    temRiscoII_Smmam,
    orientacoesVisa,
    orientacoesSmmam,
    perguntasPendentes,
    documentos
  };
}
