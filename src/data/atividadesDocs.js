// Catálogo dos documentos listados nos PDFs de exemplos da Prefeitura.
// As licenças (sanitária, ambiental, EIV e demais atos) NÃO ficam aqui:
// elas são decididas exclusivamente pelas tabelas oficiais de risco por CNAE.

export const ATIVIDADES_DOCS = [
  {
    id: 'supermercado',
    cnaes: ['4711301', '4711302', '4712100'],
    titulo: 'Supermercado e comércio alimentício',
    arquivoFonte: 'Supermercado.pdf',
    documentosExigidos: [
      { nome: 'Habite-se', detalhe: 'Documento de regularidade da edificação.' },
      { nome: 'Contrato de locação (se for locado)', detalhe: 'Autorização de ocupação do imóvel para a atividade.' },
      { nome: 'Contrato social', detalhe: 'Ato constitutivo ou documento equivalente.' },
      { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de inscrição e situação cadastral.' },
      { nome: 'PPCI ou certificado de conformidade', detalhe: 'Documento do Corpo de Bombeiros.' },
      { nome: 'Boletim de Informações Econômicas preenchido e assinado', detalhe: 'Formulário municipal.' },
      { nome: 'Cópia do documento dos sócios', detalhe: 'Documento oficial com foto dos sócios.' }
    ]
  },
  {
    id: 'restaurante',
    cnaes: ['5611201', '5611203', '5611204', '5611205'],
    titulo: 'Restaurantes, bares, lanchonetes e similares',
    arquivoFonte: 'Restaurantes e similares.pdf',
    documentosExigidos: [
      { nome: 'Habite-se', detalhe: 'Documento de regularidade da edificação.' },
      { nome: 'Contrato de locação (se for locado)', detalhe: 'Autorização de ocupação do imóvel para a atividade.' },
      { nome: 'Contrato social', detalhe: 'Ato constitutivo ou documento equivalente.' },
      { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de inscrição e situação cadastral.' },
      { nome: 'PPCI ou certificado de conformidade', detalhe: 'Documento do Corpo de Bombeiros.' },
      { nome: 'Boletim de Informações Econômicas preenchido e assinado', detalhe: 'Formulário municipal.' },
      { nome: 'Cópia do documento dos sócios', detalhe: 'Documento oficial com foto dos sócios.' }
    ]
  },
  {
    id: 'restaurante_area_gastronomica',
    cnaes: ['5611201', '5611203', '5611204', '5611205'],
    titulo: 'Restaurante em área gastronômica',
    arquivoFonte: 'Restaurantes sem EIV - Área Gastronômica.pdf',
    documentosExigidos: [
      { nome: 'Habite-se', detalhe: 'Documento de regularidade da edificação.' },
      { nome: 'Contrato de locação (se for locado)', detalhe: 'Autorização de ocupação do imóvel para a atividade.' },
      { nome: 'Contrato social', detalhe: 'Ato constitutivo ou documento equivalente.' },
      { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de inscrição e situação cadastral.' },
      { nome: 'PPCI ou certificado de conformidade', detalhe: 'Documento do Corpo de Bombeiros.' },
      { nome: 'Boletim de Informações Econômicas preenchido e assinado', detalhe: 'Formulário municipal.' },
      { nome: 'Cópia do documento dos sócios', detalhe: 'Documento oficial com foto dos sócios.' }
    ]
  },
  {
    id: 'padaria',
    cnaes: ['1091101', '1091102', '4721102'],
    titulo: 'Padaria e confeitaria',
    arquivoFonte: 'Padaria e confeitaria.pdf',
    documentosExigidos: [
      { nome: 'Habite-se', detalhe: 'Documento de regularidade da edificação.' },
      { nome: 'Contrato de locação (se for locado)', detalhe: 'Autorização de ocupação do imóvel.' },
      { nome: 'Contrato social', detalhe: 'Ato constitutivo ou documento equivalente.' },
      { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de inscrição e situação cadastral.' },
      { nome: 'PPCI ou certificado de conformidade', detalhe: 'Documento do Corpo de Bombeiros.' },
      { nome: 'Boletim de Informações Econômicas preenchido e assinado', detalhe: 'Formulário municipal.' },
      { nome: 'Cópia do documento dos sócios', detalhe: 'Documento oficial com foto dos sócios.' }
    ]
  },
  {
    id: 'escritorio',
    cnaes: ['6911701', '6920601', '7020400', '7112000', '7490104', '8211300', '4619200'],
    titulo: 'Escritórios e serviços profissionais',
    arquivoFonte: 'Escritório.pdf / Atividade de contabilidade.pdf',
    documentosExigidos: [
      { nome: 'Habite-se', detalhe: 'Regularidade da edificação e uso permitido.' },
      { nome: 'Contrato de locação (se for locado)', detalhe: 'Autorização de ocupação do imóvel.' },
      { nome: 'Contrato social', detalhe: 'Ato constitutivo ou documento equivalente.' },
      { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de inscrição e situação cadastral.' },
      { nome: 'PPCI ou certificado de conformidade', detalhe: 'Documento do Corpo de Bombeiros.' },
      { nome: 'Boletim de Informações Econômicas preenchido e assinado', detalhe: 'Formulário municipal.' },
      { nome: 'Cópia do documento dos sócios', detalhe: 'Documento oficial com foto dos sócios.' }
    ]
  },
  {
    id: 'vinicola',
    cnaes: ['1112700', '0132600', '4635402'],
    titulo: 'Vinícola e produção de bebidas',
    arquivoFonte: 'Vinicola - MAPA.pdf / Vinícola área Rural - bebidas alcoólicas MAPA e sanitária.pdf',
    documentosExigidos: [
      { nome: 'Habite-se, matrícula averbada ou laudo técnico', detalhe: 'Conforme Decreto Municipal nº 10.342/2019.' },
      { nome: 'Contrato de locação (se for locado)', detalhe: 'Autorização de ocupação do imóvel.' },
      { nome: 'Contrato social', detalhe: 'Ato constitutivo ou documento equivalente.' },
      { nome: 'Cartão do CNPJ', detalhe: 'Comprovante de inscrição e situação cadastral.' },
      { nome: 'PPCI ou certificado de conformidade', detalhe: 'Documento do Corpo de Bombeiros.' },
      { nome: 'Boletim de Informações Econômicas preenchido e assinado', detalhe: 'Formulário municipal.' },
      { nome: 'Cópia do documento dos sócios', detalhe: 'Documento oficial com foto dos sócios.' },
      { nome: 'Registro de estabelecimento no MAPA', detalhe: 'Quando exigido pela atividade de bebidas.' }
    ]
  }
];

export function obterDocsPorAtividade(cleanCodes) {
  const encontrados = [];
  const fontes = [];
  ATIVIDADES_DOCS.forEach((atividade) => {
    if (atividade.cnaes.some((cnae) => cleanCodes.includes(cnae))) {
      fontes.push(atividade.titulo);
      atividade.documentosExigidos.forEach((doc) => {
        if (!encontrados.some((item) => item.nome === doc.nome)) {
          encontrados.push({ ...doc, arquivoFonte: atividade.arquivoFonte });
        }
      });
    }
  });
  return { titulos: fontes, docs: encontrados };
}
