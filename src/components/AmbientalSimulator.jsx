import React, { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, CheckCircle2, Leaf, Search } from 'lucide-react';
import codrams from '../data/codram.json';
import { calcularTaxaAmbiental, classificarPorteAmbiental } from '../data/ambiental.js';

const normalizar = (texto = '') => texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ');

export default function AmbientalSimulator({ ativo, cnaesSelecionados = [], urm = 187.03 }) {
  const [buscaCodram, setBuscaCodram] = useState('');
  const [codramSelecionado, setCodramSelecionado] = useState(null);
  const [metrica, setMetrica] = useState('');
  const [tipoLicenca, setTipoLicenca] = useState('LO');
  const [pronaf, setPronaf] = useState(false);

  const termosCnae = useMemo(() => normalizar(cnaesSelecionados.map(c => c.descricao || '').join(' ')).split(/\s+/).filter(t => t.length >= 4), [cnaesSelecionados]);

  const sugestoes = useMemo(() => {
    const termoBusca = normalizar(buscaCodram.trim());
    const palavrasBusca = termoBusca.split(/\s+/).filter(Boolean);
    const ranqueados = codrams
      .map((item) => {
        const texto = normalizar(`${item.cod} ${item.nome} ${item.unidade}`);
        const scoreCnae = termosCnae.reduce((soma, termo) => soma + (texto.includes(termo) ? 1 : 0), 0);
        const scoreBusca = palavrasBusca.reduce((soma, termo) => soma + (texto.includes(termo) ? 3 : 0), 0);
        return { item, score: scoreCnae + scoreBusca };
      })
      .filter(({ item, score }) => {
        const texto = normalizar(`${item.cod} ${item.nome} ${item.unidade}`);
        return (!palavrasBusca.length || palavrasBusca.every(p => texto.includes(p))) && (score > 0 || !termosCnae.length);
      })
      .sort((a, b) => b.score - a.score || a.item.cod.localeCompare(b.item.cod));
    if (!ranqueados.length && !palavrasBusca.length) {
      return codrams.filter(item => normalizar(item.unidade).includes('area')).slice(0, 12);
    }
    return ranqueados.slice(0, 12).map(({ item }) => item);
  }, [buscaCodram, termosCnae]);

  const resultado = useMemo(() => {
    if (!codramSelecionado || !metrica || Number(metrica) <= 0) return null;
    const enquadramento = classificarPorteAmbiental(Number(metrica), codramSelecionado.faixas);
    const taxa = calcularTaxaAmbiental({ tipoLicenca, porte: enquadramento.porte, potencial: codramSelecionado.pot, pronaf, urm });
    return { ...enquadramento, ...taxa };
  }, [codramSelecionado, metrica, tipoLicenca, pronaf, urm]);

  if (!ativo) return null;

  return (
    <section className="rounded-xl border border-teal-200 bg-teal-50/60 p-5 shadow-sm print:hidden">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-teal-700 p-2 text-white"><Leaf className="h-5 w-5" /></div>
        <div><h3 className="text-lg font-bold text-slate-900">Simulação do licenciamento ambiental</h3><p className="mt-1 text-xs leading-relaxed text-slate-600">A tabela ambiental indicou necessidade de licenciamento. Informe a área ou a métrica da atividade para sugerir o CODRAM e simular a taxa ambiental.</p></div>
      </div>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><AlertTriangle className="mr-1 inline h-4 w-4" />A sugestão de CODRAM é um apoio à consulta. A confirmação do código, porte, licença e valor depende da análise oficial e da norma vigente.</div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-lg border border-teal-100 bg-white p-4">
          <label className="text-xs font-bold text-slate-800">Buscar ou selecionar CODRAM sugerido</label>
          <div className="relative mt-2"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={buscaCodram} onChange={e => setBuscaCodram(e.target.value)} placeholder="Código ou descrição da atividade..." className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" /></div>
          <p className="mt-2 text-[11px] text-slate-500">Sugestões geradas por aproximação entre o CNAE selecionado e o catálogo oficial de CODRAMs. Você pode pesquisar qualquer um dos 299 códigos.</p>
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {sugestoes.map(item => <button type="button" key={item.cod} onClick={() => { setCodramSelecionado(item); setMetrica(''); }} className={`w-full rounded-lg border p-2.5 text-left transition ${codramSelecionado?.cod === item.cod ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}><div className="flex items-center justify-between gap-2"><span className="font-mono text-xs font-bold text-teal-800">{item.cod}</span><span className="text-[10px] font-semibold text-slate-500">Potencial {item.pot}</span></div><p className="mt-1 text-xs font-medium text-slate-800">{item.nome}</p><p className="mt-1 text-[10px] text-slate-500">Unidade: {item.unidade} · Fonte: CONSEMA 556, p. {item.fontePagina}</p></button>)}
            {!sugestoes.length && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Nenhum CODRAM encontrado. Refine a busca pelo código ou descrição.</p>}
          </div>
        </div>

        <div className="rounded-lg border border-teal-100 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><Calculator className="h-4 w-4 text-teal-700" />Simulação da taxa</div>
          {!codramSelecionado ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-500">Selecione um CODRAM para informar a área/métrica e calcular.</p> : <>
            <div className="mt-3 rounded-lg bg-teal-50 p-3"><p className="font-mono text-xs font-bold text-teal-800">{codramSelecionado.cod}</p><p className="mt-1 text-xs font-semibold text-slate-800">{codramSelecionado.nome}</p><p className="mt-1 text-[11px] text-slate-600">{codramSelecionado.unidade}</p></div>
            <label className="mt-4 block text-xs font-bold text-slate-800">Informe a área/métrica ({codramSelecionado.unidade})</label>
            <input type="number" min="0" step="any" value={metrica} onChange={e => setMetrica(e.target.value)} placeholder="Ex.: 250" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
            <label className="mt-4 block text-xs font-bold text-slate-800">Tipo de licença a simular</label>
            <select value={tipoLicenca} onChange={e => setTipoLicenca(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="LO">Licença de Operação (LO)</option><option value="LI">Licença de Instalação (LI)</option><option value="LP">Licença Prévia (LP)</option><option value="DECL">Declaração/Autorização/Isenção</option></select>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={pronaf} onChange={e => setPronaf(e.target.checked)} /> Agricultura familiar/PRONAF</label>
          </>}
          {resultado && <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4"><div className="flex items-center gap-2 text-sm font-bold text-teal-900"><CheckCircle2 className="h-4 w-4" />Resultado da simulação</div><dl className="mt-3 space-y-1.5 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-600">Porte enquadrado</dt><dd className="font-bold text-slate-900">{resultado.porte}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-600">Faixa</dt><dd className="text-right font-semibold text-slate-900">{resultado.faixa}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-600">Taxa ambiental</dt><dd className="font-bold text-teal-900">{resultado.status === 'Calculada' ? `${resultado.quantidadeUrm.toFixed(2)} URM · R$ ${resultado.valorReais.toFixed(2)}` : resultado.status}</dd></div></dl></div>}
        </div>
      </div>
      <p className="mt-3 text-[10px] text-slate-500">Fonte importada: Atividades Passíveis de Licenciamento Ambiental — CONSEMA 556. A URM utilizada é a configurada no sistema: R$ {urm.toFixed(2)}.</p>
    </section>
  );
}
