// Matriz de taxas ambientais conforme Lei Complementar Municipal nº 183/2013 (Art. 235).
// Valores fixados em múltiplos de URM (Unidade de Referência Municipal).
export const TAXAS_AMBIENTAIS = {
  LP: {
    'Mínimo': { Baixo: 1.85, Médio: 2.20, Alto: 2.97 },
    'Pequeno': { Baixo: 3.60, Médio: 4.40, Alto: 5.80 },
    'Médio': { Baixo: 6.44, Médio: 8.95, Alto: 13.20 },
    'Grande': { Baixo: 10.36, Médio: 16.34, Alto: 26.24 },
    'Excepcional': { Baixo: 22.63, Médio: 37.71, Alto: 53.43 },
    PRONAF: 0.48
  },
  LI: {
    'Mínimo': { Baixo: 5.03, Médio: 6.13, Alto: 7.84 },
    'Pequeno': { Baixo: 8.48, Médio: 10.53, Alto: 13.51 },
    'Médio': { Baixo: 17.28, Médio: 23.23, Alto: 33.37 },
    'Grande': { Baixo: 33.37, Médio: 45.56, Alto: 71.96 },
    'Excepcional': { Baixo: 67.00, Médio: 114.40, Alto: 183.82 },
    PRONAF: 1.58
  },
  LO: {
    'Mínimo': { Baixo: 2.51, Médio: 4.24, Alto: 6.60 },
    'Pequeno': { Baixo: 5.03, Médio: 8.63, Alto: 13.51 },
    'Médio': { Baixo: 8.80, Médio: 16.33, Alto: 28.60 },
    'Grande': { Baixo: 15.08, Médio: 31.73, Alto: 61.60 },
    'Excepcional': { Baixo: 23.56, Médio: 57.20, Alto: 123.51 },
    PRONAF: 1.10
  },
  DECL: 0.63
};

export function parseLimiteFaixa(texto) {
  if (!texto) return null;
  if (/demais|todos os portes|único/i.test(texto)) return Infinity;
  const numeros = texto.match(/\d[\d.,]*/g);
  if (!numeros?.length) return null;
  const ultimo = numeros[numeros.length - 1];
  const normalizado = ultimo.includes(',') ? ultimo.replace(/\./g, '').replace(',', '.') : ultimo.replace(/\./g, '');
  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

export function classificarPorteAmbiental(valor, faixas, limiteMunicipalTexto = null) {
  const portes = ['Não Incidência', 'Mínimo', 'Pequeno', 'Médio', 'Grande', 'Excepcional'];
  let encontrouFaixaNumerica = false;
  let porteEncontrado = null;
  let faixaEncontrada = null;

  for (let index = 0; index < (faixas || []).length; index += 1) {
    const faixa = faixas[index];
    if (!faixa || /observar a descrição/i.test(faixa)) continue;
    const limite = parseLimiteFaixa(faixa);
    if (limite === null) continue;
    if (limite === Infinity || valor <= limite) {
      porteEncontrado = portes[index];
      faixaEncontrada = faixa;
      break;
    }
    encontrouFaixaNumerica = true;
  }

  if (!porteEncontrado) {
    if (encontrouFaixaNumerica) {
      porteEncontrado = 'Excepcional';
      faixaEncontrada = 'Acima da última faixa delimitada';
    } else {
      return {
        porte: 'Conferir norma',
        faixa: 'A fonte oficial orienta conferir a descrição da atividade.',
        competencia: 'Municipal (SMMAM)',
        excedeMunicipal: false
      };
    }
  }

  // Verifica competência municipal de Bento Gonçalves (Decreto 10.819/2021)
  let excedeMunicipal = false;
  let competencia = 'Municipal (SMMAM)';
  if (limiteMunicipalTexto) {
    const limiteMun = parseLimiteFaixa(limiteMunicipalTexto);
    if (limiteMun !== null && limiteMun !== Infinity && valor > limiteMun) {
      excedeMunicipal = true;
      competencia = 'Estadual (FEPAM - acima da delegação municipal)';
    }
  }

  return {
    porte: porteEncontrado,
    faixa: faixaEncontrada,
    competencia,
    excedeMunicipal,
    limiteMunicipalTexto
  };
}

export function calcularTaxaAmbiental({ tipoLicenca, porte, potencial, pronaf = false, urm = 187.03 }) {
  if (porte === 'Não Incidência' || porte === 'Conferir norma') {
    return { quantidadeUrm: 0, valorReais: 0, status: porte };
  }

  const quantidadeUrm = tipoLicenca === 'DECL'
    ? TAXAS_AMBIENTAIS.DECL
    : pronaf
      ? TAXAS_AMBIENTAIS[tipoLicenca]?.PRONAF
      : TAXAS_AMBIENTAIS[tipoLicenca]?.[porte]?.[potencial];

  if (typeof quantidadeUrm !== 'number') {
    return { quantidadeUrm: 0, valorReais: 0, status: 'Conferir norma' };
  }

  return {
    quantidadeUrm,
    valorReais: quantidadeUrm * urm,
    status: 'Calculada'
  };
}
