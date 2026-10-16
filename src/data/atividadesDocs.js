// Catálogo de Documentação e Requisitos Específicos por Tipo de Atividade
// Extraído dos arquivos oficiais em PDF do Município de Bento Gonçalves

export const ATIVIDADES_DOCS = [
  {
    id: 'supermercado',
    palavrasChave: ['supermercado', 'hipermercado', 'minimercado', 'mercearia'],
    cnaes: ['4711301', '4711302', '4712100'],
    titulo: 'Supermercado e Comércio Alimentício de Grande Porte',
    arquivoFonte: 'Supermercado.pdf',
    documentosExigidos: [
      { nome: 'Habite-se Comercial com Averbacao ou Laudo Tecnico', detalhe: 'Nos termos do Decreto Municipal nº 10.342/2019.' },
      { nome: 'Plano de Prevenção e Combate Contra Incêndio (PPCI) / CLCB', detalhe: 'Com ART/RRT de projeto e execução aprovado no CBMRS.' },
      { nome: 'Contrato Social e Cartão do CNPJ', detalhe: 'Registrado na JUCISRS com as atividades de comércio varejista de alimentos.' },
      { nome: 'Licenciamento Sanitário Municipal (Alvará Sanitário)', detalhe: 'Processo único municipal com apresentação de laudo de limpeza de caixa d\'água e controle de pragas.' },
      { nome: 'Licença Ambiental / Manifestação SMMAM', detalhe: 'Verificar faixa do CODRAM 4140,00 se área útil superior a 500m².' },
      { nome: 'EIV/EII (Estudo de Impacto de Vizinhança) APROVADO com ART', detalhe: 'Previsto no Anexo 9.1 para supermercados conforme porte e zoneamento.' },
      { nome: 'Laudo de Controle de Pragas e Vetores', detalhe: 'Apresentado na vistoria da Vigilância Sanitária.' },
      { nome: 'Laudo de Limpeza e Higienização de Reservatórios de Água', detalhe: 'Obrigatório para estabelecimentos com serviços de alimentação.' }
    ]
  },
  {
    id: 'restaurante',
    palavrasChave: ['restaurante', 'lanchonete', 'bar', 'refeicoes', 'alimentacao'],
    cnaes: ['5611201', '5611203', '5611204', '5611205'],
    titulo: 'Restaurantes, Bares, Lanchonetes e Similares',
    arquivoFonte: 'Restaurantes e similares.pdf / Restaurante sem EIV - Área Gastronômica.pdf',
    documentosExigidos: [
      { nome: 'Habite-se, Matrícula com averbação ou Laudo Técnico (Dec. 10.342/2019)', detalhe: 'Autorização municipal de ocupação da edificação.' },
      { nome: 'Contrato de Locação ou Escritura/Matrícula do Imóvel', detalhe: 'Autorizando a ocupação para fins comerciais.' },
      { nome: 'Plano de Prevenção e Combate Contra Incêndio (PPCI) ou CLCB', detalhe: 'Com ART/RRT de projeto e execução no Corpo de Bombeiros.' },
      { nome: 'Contrato Social / CCMEI e Cartão do CNPJ', detalhe: 'Comprovante de regularidade da empresa.' },
      { nome: 'Licença Sanitária (Processo Integrado Municipal)', detalhe: 'Instruída com Laudo de Pragas e Laudo de Caixa d\'Água.' },
      { nome: 'Laudo de Potabilidade da Água (se aplicável)', detalhe: 'Exigido se localizado em área sem abastecimento público da CORSAN.' },
      { nome: 'EIV/EII ou Declaração de Área Gastronômica (se aplicável)', detalhe: 'Dispensado de EIV se localizado em Área Gastronômica delimitada pelo Município.' },
      { nome: 'Parecer do Conselho Distrital (se localizado no Interior/Distritos)', detalhe: 'Solicitado junto ao IPURB.' }
    ]
  },
  {
    id: 'padaria',
    palavrasChave: ['padaria', 'confeitaria', 'panificacao'],
    cnaes: ['1091101', '1091102', '4721102'],
    titulo: 'Padaria e Confeitaria',
    arquivoFonte: 'Padaria e confeitaria.pdf',
    documentosExigidos: [
      { nome: 'Habite-se da Edificação Comercial', detalhe: 'Comprovação de regularidade construtiva da área de produção e atendimento.' },
      { nome: 'PPCI / Alvará de Prevenção Contra Incêndio', detalhe: 'Dimensionado com base nos fornos e fontes térmicas de energia.' },
      { nome: 'Alvará Sanitário da Vigilância Municipal', detalhe: 'Com Manual de Boas Práticas de Manipulação de Alimentos.' },
      { nome: 'Laudo de Controle de Pragas e Vetores Urbanos', detalhe: 'Realizado por empresa especializada licenciada.' },
      { nome: 'Contrato Social, CNPJ e BIE', detalhe: 'Documentação cadastral padrão da Fazenda Municipal.' }
    ]
  },
  {
    id: 'escritorio_servico',
    palavrasChave: ['escritorio', 'contabilidade', 'advocacia', 'consultoria', 'engenharia', 'arquitetura', 'representacao'],
    cnaes: ['6911701', '6920601', '7020400', '7112000', '7490104', '8211300', '4619200'],
    titulo: 'Escritórios Administrativos e Serviços Profissionais',
    arquivoFonte: 'Escritório.pdf / Atividade de contabilidade.pdf',
    documentosExigidos: [
      { nome: 'Habite-se do Imóvel Comercial', detalhe: 'Atestando uso de serviços permitido no zoneamento (LC 200/2018).' },
      { nome: 'Contrato de Locação (se imóvel locado)', detalhe: 'Em nome da empresa ou sócios com firmas reconhecidas.' },
      { nome: 'PPCI ou Certificado de Conformidade (CLCB)', detalhe: 'Emitido pelo Corpo de Bombeiros Militar do RS.' },
      { nome: 'Contrato Social / CCMEI e Cartão CNPJ', detalhe: 'Comprovante do ato constitutivo.' },
      { nome: 'Boletim de Informações Econômicas (BIE)', detalhe: 'Preenchido e assinado.' },
      { nome: 'Registro no Conselho de Classe (CRC, OAB, CREA, CAU, CORE)', detalhe: 'Quando exigível para a atividade profissional regulamentada.' }
    ]
  },
  {
    id: 'industria',
    palavrasChave: ['industria', 'fabricacao', 'metalica', 'usinagem', 'moveis'],
    cnaes: ['2511000', '2539001', '3101200', '3102100', '3103900'],
    titulo: 'Indústria e Fabricação Metalmecânica / Moveleira',
    arquivoFonte: 'Industria adequada - Com ambiental - interior.pdf / Montagem Metalicas.pdf',
    documentosExigidos: [
      { nome: 'Habite-se Industrial ou Certidão de Uso e Ocupação do Solo (IPURB)', detalhe: 'Certificando zona industrial ou adequação ao Plano Diretor.' },
      { nome: 'Licenciamento Ambiental Municipal (SMMAM) ou Estadual (FEPAM)', detalhe: 'Licença de Instalação (LI) e Licença de Operação (LO) com PCA e ART.' },
      { nome: 'Plano de Prevenção e Combate Contra Incêndio (PPCI)', detalhe: 'Aprovado pelo Corpo de Bombeiros com carga de incêndio industrial.' },
      { nome: 'Plano de Gerenciamento de Resíduos Sólidos Industriais (PGRS)', detalhe: 'Com ART de engenheiro responsável pela destinação de resíduos.' },
      { nome: 'EIV/EII (quando enquadrado no Anexo 9.1)', detalhe: 'Conforme porte de edificação e capacidade produtiva.' }
    ]
  },
  {
    id: 'vinicola',
    palavrasChave: ['vinicola', 'vinho', 'bebidas alcoolicas', 'uva'],
    cnaes: ['1112700', '0132600', '4635402'],
    titulo: 'Vinícola e Cantina de Vinhos',
    arquivoFonte: 'Vinicola - MAPA.pdf / Vinícola área Rural - bebida alcoolicas MAPA e sanitária.pdf',
    documentosExigidos: [
      { nome: 'Registro de Estabelecimento no MAPA (Ministério da Agricultura)', detalhe: 'Exigência federal para produtor e padronizador de vinhos e bebidas.' },
      { nome: 'Licença de Operação Ambiental (SMMAM / FEPAM)', detalhe: 'Acompanhada de projeto de tratamento de efluentes da vindima/bagaço.' },
      { nome: 'Habite-se / Certidão de Edificação Rural ou Urbana', detalhe: 'Averbada com responsabilidade técnica.' },
      { nome: 'PPCI Aprovado no CBMRS', detalhe: 'Adequado para armazenamento e fermentação alcoólica.' },
      { nome: 'Anotação de Responsabilidade Técnica (ART) do Enólogo / Químico', detalhe: 'Responsável técnico pelo controle enológico e laboratorial.' }
    ]
  }
];

export function obterDocsPorAtividade(cleanCodes) {
  const docsEncontrados = [];
  const titulos = [];

  ATIVIDADES_DOCS.forEach(cat => {
    const match = cat.cnaes.some(c => cleanCodes.includes(c));
    if (match) {
      titulos.push(cat.titulo);
      cat.documentosExigidos.forEach(doc => {
        if (!docsEncontrados.some(d => d.nome === doc.nome)) {
          docsEncontrados.push({
            ...doc,
            origemAtividade: cat.titulo,
            arquivoFonte: cat.arquivoFonte
          });
        }
      });
    }
  });

  return { titulos, docs: docsEncontrados };
}
