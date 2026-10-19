import React, { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, CheckCircle2, Leaf, Search } from 'lucide-react';
import codrams from '../data/codram.json';
import { calcularTaxaAmbiental, classificarPorteAmbiental } from '../data/ambiental.js';

const normalizar = (texto = '') => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ');
const codramPorCodigo = new Map(codrams.map((item) => [item.cod.replace(',', '-'), item]));

export default function AmbientalSimulator({ ativo, correlacoes = [], urm = 187.03 }) {
  const [buscaCodram, setBuscaCodram] = useState('');
  const [codramSelecionado, setCodramSelecionado] = useState(null);
  const [metrica, setMetrica] = useState('');
  const [tipoLicenca, setTipoLicenca] = useState('LO');
  const [pronaf, setPronaf] = useState(false);

  const vinculados = useMemo(() => {
    const unicos = new Map();
    correlacoes.forEach((relacao) => relacao.codrans.forEach((codigo) => {
      const atividade = codramPorCodigo.get(codigo);
      const chave = `${relacao.cnae}:${codigo}`;
      if (atividade && !unicos.has(chave)) unicos.set(chave, { ...atividade, cnae: relacao.cnae, descricaoCnae: relacao.descricaoPlanilha, meioAmbiente: relacao.meioAmbiente, codranOriginal: relacao.codranOriginal });
    }));
    return [...unicos.values()];
  }, [correlacoes]);

  const sugestoes = useMemo(() => {
    const termo = normalizar(buscaCodram.trim());
    if (!termo) return vinculados;
    return vinculados.filter((item) => normalizar(`${item.cod} ${item.nome} ${item.unidade} ${item.cnae} ${item.descricaoCnae}`).includes(termo));
  }, [buscaCodram, vinculados]);

  const resultado = useMemo(() => {
    if (!codramSelecionado || !metrica || Number(metrica) <= 0) return null;
    const enquadramento = classificarPorteAmbiental(Number(metrica), codramSelecionado.faixas);
    const taxa = calcularTaxaAmbiental({ tipoLicenca, porte: enquadramento.porte, potencial: codramSelecionado.pot, pronaf, urm });
    return { ...enquadramento, ...taxa };
  }, [codramSelecionado, metrica, tipoLicenca, pronaf, urm]);

  if (!ativo) return null;
  const classes = [...new Set(correlacoes.map((item) => item.meioAmbiente).filter(Boolean))];
  const temCompetenciaExterna = classes.includes('M2') || classes.includes('IBAMA');

  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50/60 p-5 shadow-sm print:hidden">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-teal-700 p-2 text-white"><Leaf className="h-5 w-5" /></div>
        <div><h3 className="text-lg font-bold text-slate-900">Licenciamento ambiental — correlação CNAE/CODRAM</h3><p className="mt-1 text-xs leading-relaxed text-slate-600">Os códigos abaixo foram vinculados diretamente pela aba CnaeXRisco da planilha municipal. Se a atividade for M1, informe a área para apoiar o enquadramento por porte.</p></div>
      </div>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><AlertTriangle className="mr-1 inline h-4 w-4" />A coluna da planilha é denominada CODRAN; os códigos são tratados aqui como CODRAM — Código Ramo. A confirmação do código, competência, porte e valor depende da análise oficial.</div>
      <div className="mt-3 flex flex-wrap gap-2">{classes.map(classe => <span key={classe} className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-900">Meio Ambiente: {classe}</span>)}</div>
      {temCompetenciaExterna && <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">A classificação inclui M2/IBAMA. A competência pode ser estadual/federal; a simulação abaixo é apenas referencial e não confirma taxa municipal.</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-lg border border-teal-100 bg-white p-4">
          <label className="text-xs font-bold text-slate-800">CODRAMs vinculados oficialmente ao CNAE</label>
          <div className="relative mt-2"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={buscaCodram} onChange={e => setBuscaCodram(e.target.value)} placeholder="Filtrar por código ou atividade..." className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /></div>
          <p className="mt-2 text-[11px] text-slate-500">Esta lista não é uma aproximação textual: cada item abaixo veio da relação CNAE–CODRAN da planilha recebida.</p>
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {sugestoes.map(item => <button type="button" key={`${item.cnae}-${item.cod}`} onClick={() => { setCodramSelecionado(item); setMetrica(''); }} className={`w-full rounded-lg border p-2.5 text-left transition ${codramSelecionado?.cod === item.cod && codramSelecionado?.cnae === item.cnae ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}><div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-bold text-teal-800">{item.cod}</span><span className="text-[10px] font-semibold text-slate-500">CNAE {item.cnae} · {item.meioAmbiente}</span></div><p className="mt-1 text-xs font-medium text-slate-800">{item.nome}</p><p className="mt-1 text-[10px] text-slate-500">Unidade: {item.unidade} · Potencial: {item.pot} · Fonte: CONSEMA 556, p. {item.fontePagina}</p></button>)}
            {!sugestoes.length && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">O CNAE possui classificação ambiental, mas não há CODRAM preenchido para esta linha, ou o filtro não encontrou correspondência.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Calculator className="h-4 w-4 text-teal-700" />Simulação da taxa</div>
          {!codramSelecionado ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">Selecione um CODRAM relacionado ao CNAE para informar a área/métrica e calcular.</p> : <>
            <div className="mt-3 rounded-lg bg-teal-50 p-3"><p className="font-mono text-xs font-bold text-teal-800">{codramSelecionado.cod}</p><p className="mt-1 text-xs font-semibold text-slate-800">{codramSelecionado.nome}</p><p className="mt-1 text-[11px] text-slate-600">CNAE relacionado: {codramSelecionado.cnae} · {codramSelecionado.meioAmbiente}</p><p className="mt-1 text-[11px] text-slate-600">{codramSelecionado.unidade}</p></div>
            <label className="mt-4 block text-xs font-bold text-slate-800">Informe a área/métrica ({codramSelecionado.unidade})</label>
            <input type="number" min="0" step="any" value={metrica} onChange={e => setMetrica(e.target.value)} placeholder="Ex.: 250" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
            <label className="mt-4 block text-xs font-bold text-slate-800">Tipo de licença a simular</label>
            <select value={tipoLicenca} onChange={e => setTipoLicenca(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="LO">Licença de Operação (LO)</option><option value="LI">Licença de Instalação (LI)</option><option value="LP">Licença Prévia (LP)</option><option value="DECL">Declaração/Autorização/Isenção</option></select>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={pronaf} onChange={e => setPronaf(e.target.checked)} /> Agricultura familiar/PRONAF</label>
          </>}
          {resultado && <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-teal-900"><CheckCircle2 className="h-4 w-4" />Resultado da simulação</div><dl className="mt-3 space-y-1.5 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-600">Porte enquadrado</dt><dd className="font-bold text-slate-900">{resultado.porte}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-600">Faixa</dt><dd className="text-right font-semibold text-slate-900">{resultado.faixa}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-600">Taxa ambiental</dt><dd className="font-bold text-teal-900">{resultado.status === 'Calculada' ? `${resultado.quantidadeUrm.toFixed(2)} URM · R$ ${resultado.valorReais.toFixed(2)}` : resultado.status}</dd></div></dl></div>}
        </div>
      </div>
      <p className="mt-3 text-[10px] text-slate-500">Fonte da correlação: FINAL_atualiza__o_TABELA_CNAES_BG.xlsx, aba CnaeXRisco. Fonte das faixas/taxas: CONSEMA 556. URM utilizada: R$ {urm.toFixed(2)}.</p>
    </section>
  );
}
