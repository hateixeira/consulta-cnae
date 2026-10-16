// Motor de Regras de Documentação e Enquadramento - REDESIM Bento Gonçalves
// Extraído diretamente dos modelos oficiais 'Ponto Fixo Padrão.pdf' e 'Ponto de Referência.pdf'

export function calcularEnquadramento(cnaesSelecionados, respostasPerguntas = {}, tipoEstabelecimento = 'ponto_fixo') {
  if (!cnaesSelecionados || cnaesSelecionados.length === 0) {
    return null;
  }

  const isPontoReferencia = tipoEstabelecimento === 'ponto_referencia';

  // Se for Ponto de Referência:
  if (isPontoReferencia) {
    return {
      tipoEstabelecimento: 'ponto_referencia',
      nivelRiscoGeral: 'I',
      tituloRisco: 'Baixo Risco (Nível I) - Ponto de Referência',
      elegivelUmaHora: true,
      descricaoRisco: 'Ponto de referência/endereço fiscal sem atendimento ao público e sem estoque. Dispensado de Habite-se, PPCI, alvará sanitário e licenciamento ambiental no local. Elegível para abertura imediata em até 1 hora na REDESIM.',
      temRiscoIII_Visa: false,
      temRiscoII_Visa: false,
      temRiscoIII_Smmam: false,
      temRiscoII_Smmam: false,
      orientacoesVisa: ['Dispensado de controle sanitário in loco por se tratar exclusivamente de ponto de referência/endereço fiscal.'],
      orientacoesSmmam: ['Dispensado de licenciamento ambiental por não haver atividade poluidora ou instalação física operacional no local.'],
      perguntasPendentes: [],
      documentos: [
        {
          categoria: 'Documentação Obrigatória - Ponto de Referência (Conforme Modelo Oficial)',
          obrigatorio: true,
          alerta: 'Base: Ponto de Referência.pdf - Sala do Empreendedor',
          itens: [
            { nome: 'Comprovante de Residência', detalhe: 'Conta de água, luz ou telefone recente em nome do responsável ou proprietário do imóvel.' },
            { nome: 'Declaração de Ponto de Referência com Firma Reconhecida', detalhe: 'Declaração formal atestando que o local servirá apenas para correspondência e contato, sem atendimento ao público e sem depósito de mercadorias.' },
            { nome: 'Contrato Social / Requerimento de Empresário / CCMEI', detalhe: 'Ato constitutivo registrado na Junta Comercial (JUCISRS) ou Cartório.' },
            { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de Inscrição e Situação Cadastral emitido pela Receita Federal.' },
            { nome: 'Boletim de Informações Econômicas (BIE)', detalhe: 'Preenchido e assinado pelo responsável legal ou contador habilitado.' },
            { nome: 'Cópia do Documento dos Sócios', detalhe: 'Cópia legível de RG/CPF ou CNH de todos os sócios/administradores.' }
          ]
        },
        {
          categoria: 'Isenções Aplicáveis ao Ponto de Referência',
          obrigatorio: false,
          alerta: 'Desburocratização REDESIM',
          itens: [
            { nome: 'Dispensa de Habite-se Comercial e Contrato de Locação Comercial', detalhe: 'Por não haver estabelecimento aberto ao público no imóvel.' },
            { nome: 'Dispensa de PPCI no Endereço Fiscal', detalhe: 'Conforme diretrizes de endereço de referência do CBMRS.' },
            { nome: 'Dispensa de Alvará Sanitário e Licença Ambiental no Local', detalhe: 'Atividade operacional exercida externamente ou digitalmente.' }
          ]
        }
      ]
    };
  }

  // --- SE FOR PONTO FIXO PADRÃO ---
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
  let descricaoRisco = 'Ponto Fixo enquadrado em Baixo Risco. Dispensado de vistorias e atos públicos de liberação prévia. Abertura automatizada no portal da REDESIM em até 1 hora.';

  if (temRiscoIII_Visa || temRiscoIII_Smmam) {
    nivelRiscoGeral = 'III';
    tituloRisco = 'Alto Risco (Nível III)';
    elegivelUmaHora = false;
    descricaoRisco = 'Ponto Fixo com atividade de Alto Risco. Exige vistorias, laudos e licenças prévias obrigatórias antes do início das atividades.';
  } else if (temRiscoII_Visa || temRiscoII_Smmam) {
    nivelRiscoGeral = 'II';
    tituloRisco = 'Médio Risco (Nível II)';
    elegivelUmaHora = false;
    descricaoRisco = 'Ponto Fixo de Médio Risco. Permite emissão de alvará provisório ou licenças simplificadas com vistoria a posteriori.';
  }

  // Documentos Oficiais para PONTO FIXO PADRÃO
  const documentos = [
    {
      categoria: 'Cadastro e Imobiliário (Base: Ponto Fixo Padrão.pdf)',
      obrigatorio: true,
      alerta: 'Exigência Documental Padrão Municipal',
      itens: [
        { nome: 'Habite-se da Edificação', detalhe: 'Carta de Habite-se aprovada pelo Município de Bento Gonçalves para o imóvel onde o estabelecimento funcionará.' },
        { nome: 'Contrato de Locação (se for locado) ou Matrícula Atualizada', detalhe: 'Contrato de locação com firmas reconhecidas ou certidão de matrícula do Registro de Imóveis.' },
        { nome: 'Contrato Social / Requerimento de Empresário / CCMEI', detalhe: 'Ato constitutivo registrado na Junta Comercial (JUCISRS) ou Cartório.' },
        { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de Inscrição e Situação Cadastral atualizado emitido pela Receita Federal.' },
        { nome: 'Boletim de Informações Econômicas (BIE)', detalhe: 'Preenchido e assinado pelo responsável legal ou contador responsável.' },
        { nome: 'Cópia do Documento dos Sócios', detalhe: 'Cópia de RG/CPF ou CNH de todos os sócios e administradores.' }
      ]
    },
    {
      categoria: 'Prevenção Contra Incêndio (CBMRS / Bombeiros)',
      obrigatorio: true,
      alerta: 'Segurança contra Incêndio Obrigatória',
      itens: [
        { 
          nome: 'Plano de Prevenção e Combate Contra Incêndio (PPCI) ou Certificado de Conformidade (CLCB)', 
          detalhe: 'Alvará do Corpo de Bombeiros Militar do RS (APPCI) ou Certificado de Licenciamento (CLCB) vigente para o local.' 
        }
      ]
    }
  ];

  // Adicionar Licença Sanitária (conforme modelo Ponto Fixo Padrão)
  if (temRiscoIII_Visa) {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: true,
      alerta: 'Licença Sanitária Obrigatória (Alto Risco)',
      itens: [
        { nome: 'Alvará de Autorização Sanitária (AAS)', detalhe: 'Licença Sanitária expedida pela VISA após vistoria prévia.' },
        { nome: 'Anotação de Responsabilidade Técnica (ART/CRT)', detalhe: 'Registro do Responsável Técnico perante o Conselho de Classe profissional.' },
        { nome: 'Manual de Boas Práticas e Procedimentos Operacionais Padronizados (POP)', detalhe: 'Manuais técnicos de controle higiênico-sanitário.' }
      ]
    });
  } else if (temRiscoII_Visa) {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: false,
      alerta: 'Médio Risco Sanitário - Alvará Provisório',
      itens: [
        { nome: 'Declaração Eletrônica de Cumprimento das Exigências Sanitárias', detalhe: 'Termo de ciência e responsabilidade emitido na viabilidade da REDESIM.' }
      ]
    });
  } else {
    documentos.push({
      categoria: 'Vigilância Sanitária Municipal (VISA)',
      obrigatorio: false,
      alerta: 'Baixo Risco Sanitário - Dispensado',
      itens: [
        { nome: 'Dispensa Automática de Licença Sanitária', detalhe: 'Atividade sem risco sanitário ou de baixo risco dispensada pela Lei da Liberdade Econômica.' }
      ]
    });
  }

  // Adicionar Licença Ambiental (conforme modelo Ponto Fixo Padrão)
  if (temRiscoIII_Smmam) {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM / FEPAM)',
      obrigatorio: true,
      alerta: 'Licenciamento Ambiental (Licença de Operação - LO)',
      itens: [
        { nome: 'Licença de Operação (LO) ou Licença Prévia/Instalação (LP/LI)', detalhe: 'Licenciamento Ambiental protocolado no Portal do Cidadão de Bento Gonçalves ou FEPAM conforme CONSEMA 372/2018.' },
        { nome: 'Plano de Controle Ambiental (PCA) com ART do Responsável Técnico', detalhe: 'Elaborado por engenheiro devidamente habilitado.' }
      ]
    });
  } else if (temRiscoII_Smmam) {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM)',
      obrigatorio: false,
      alerta: 'Médio Risco Ambiental - Licença Simplificada',
      itens: [
        { nome: 'Licença Ambiental Simplificada (LAS) ou Certidão de Não Passível', detalhe: 'Protocolada eletronicamente perante a SMMAM Bento Gonçalves.' }
      ]
    });
  } else {
    documentos.push({
      categoria: 'Secretaria Municipal de Meio Ambiente (SMMAM)',
      obrigatorio: false,
      alerta: 'Baixo Risco Ambiental - Dispensado',
      itens: [
        { nome: 'Dispensa Automática de Licenciamento Ambiental', detalhe: 'Atividade dispensada conforme resolução CONSEMA e normas municipais.' }
      ]
    });
  }

  // EIV - Estudo de Impacto de Vizinhança (constante no Ponto Fixo Padrão.pdf)
  if (temRiscoIII_Smmam || temRiscoIII_Visa) {
    documentos.push({
      categoria: 'Planejamento Urbano / Zoneamento (IPURB)',
      obrigatorio: true,
      alerta: 'Base: Lei Complementar 200/2018 e Lei Municipal 6.300/2017',
      itens: [
        { nome: 'EIV (Estudo do Impacto da Vizinhança) APROVADO com ART', detalhe: 'Exigido para atividades de porte ou impacto no tráfego/vizinhança conforme zoneamento municipal.' }
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
    orientacoesVisa,
    orientacoesSmmam,
    perguntasPendentes,
    documentos
  };
}
