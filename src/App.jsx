import React, { useState, useMemo } from 'react';
import cnaesData from './data/cnaes.json';
import { calcularEnquadramento, VALOR_URM_ATUAL } from './data/rules.js';
import { 
  Search, 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Copy, 
  X, 
  ChevronRight, 
  Info, 
  MapPin, 
  Phone,
  Store,
  Compass,
  Coins,
  Scale
} from 'lucide-react';

export default function App() {
  const [busca, setBusca] = useState('');
  const [cnaesSelecionados, setCnaesSelecionados] = useState([]);
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState('ponto_fixo'); // 'ponto_fixo' ou 'ponto_referencia'
  const [isMei, setIsMei] = useState(false);
  const [respostasPerguntas, setRespostasPerguntas] = useState({});
  const [copiado, setCopiado] = useState(false);

  // Filtragem de CNAEs
  const cnaesFiltrados = useMemo(() => {
    if (!busca || busca.trim().length < 2) return [];
    const termo = busca.toLowerCase().trim();
    const cleanTermo = termo.replace(/\D/g, '');

    return cnaesData.filter((item) => {
      const codigo = String(item.clean_code ?? '');
      const descricao = String(item.descricao ?? '');
      const matchCodigo = cleanTermo.length > 0 && codigo.includes(cleanTermo);
      const matchDesc = descricao.toLowerCase().includes(termo);
      return matchCodigo || matchDesc;
    }).slice(0, 15);
  }, [busca]);

  // Adicionar CNAE à seleção
  const adicionarCnae = (cnae) => {
    if (cnaesSelecionados.some(c => c.clean_code === cnae.clean_code)) return;
    setCnaesSelecionados(prev => [...prev, cnae]);
    setBusca('');
  };

  // Remover CNAE
  const removerCnae = (cleanCode) => {
    setCnaesSelecionados(prev => prev.filter(c => c.clean_code !== cleanCode));
  };

  // Definir como principal
  const definirPrincipal = (index) => {
    if (index === 0) return;
    const item = cnaesSelecionados[index];
    const restantes = cnaesSelecionados.filter((_, i) => i !== index);
    setCnaesSelecionados([item, ...restantes]);
  };

  // Responder pergunta condicional (compartilhada entre órgãos)
  const responderPergunta = (chave, resposta) => {
    setRespostasPerguntas(prev => ({
      ...prev,
      [chave]: resposta
    }));
  };


  // Cálculo de enquadramento
  const diagnostico = useMemo(() => {
    return calcularEnquadramento(cnaesSelecionados, respostasPerguntas, tipoEstabelecimento, isMei);
  }, [cnaesSelecionados, respostasPerguntas, tipoEstabelecimento, isMei]);

  // Copiar relatório
  const copiarRelatorio = () => {
    if (!diagnostico) return;

    let texto = `*CONSULTA DE DOCUMENTAÇÃO E ENQUADRAMENTO - REDESIM BENTO GONÇALVES*\n\n`;
    texto += `*Modalidade:* ${tipoEstabelecimento === 'ponto_fixo' ? 'PONTO FIXO (Com estabelecimento físico)' : 'PONTO DE REFERÊNCIA (Apenas endereço fiscal)'}\n`;
    texto += `*Classificação Geral:* ${diagnostico.tituloRisco}\n`;
    texto += `*Elegível a Abertura em 1h:* ${diagnostico.elegivelUmaHora ? 'SIM (Baixo Risco Automático)' : 'NÃO (Requer análise/vistoria prévia)'}\n`;
    texto += `*Enquadramento Tributário:* TFLIF ${diagnostico.tributario.isMei ? 'ISENTO (MEI)' : `R$ ${diagnostico.tributario.valorTflif.toFixed(2)} (${diagnostico.tributario.qtdUrm || 2} URMs / ${diagnostico.tributario.aliquotaPercentual}% da URM R$ ${diagnostico.tributario.valorUrm.toFixed(2)})`}\n`;
    if (diagnostico.sujeitoEiv) {
      texto += `*Impacto Urbano (EIV):* SIM - Atividade listada no Anexo 9.1 do Plano Diretor\n`;
    }
    
    texto += `\n*Atividades Selecionadas:*\n`;
    cnaesSelecionados.forEach((c, idx) => {
      texto += `- ${idx === 0 ? '[PRINCIPAL] ' : ''}${c.cnae} - ${c.descricao}\n`;
    });

    texto += `\n*DOCUMENTAÇÃO EXIGIDA (OFICIAL):*\n`;
    diagnostico.documentos.forEach((cat) => {
      texto += `\n📂 ${cat.categoria.toUpperCase()}${cat.alerta ? ` (${cat.alerta})` : ''}\n`;
      cat.itens.forEach((it) => {
        texto += `  • ${it.nome}: ${it.detalhe}\n`;
      });
    });

    texto += `\n---\nSala do Empreendedor de Bento Gonçalves - Tel: (54) 3055-7032`;

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="bg-emerald-800 text-white shadow-md border-b border-emerald-900 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Bento Gonçalves / RS
                </span>
                <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Meta REDESIM: Até 1 hora
                </span>
                <span className="bg-emerald-900 text-emerald-200 text-xs font-mono px-2 py-0.5 rounded-full border border-emerald-700">
                  URM: R$ {VALOR_URM_ATUAL.toFixed(2)}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
                <Building2 className="w-7 h-7 text-emerald-300" />
                Consulta de Documentação por CNAE Fiscal
              </h1>
              <p className="text-emerald-100 text-sm mt-0.5">
                Enquadramento automatizado (Ponto Fixo vs Referência), tributação TFLIF/URM, EIV e regras sanitárias/ambientais de Bento Gonçalves.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-emerald-100 bg-emerald-900/60 p-3 rounded-lg border border-emerald-700/50">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <p className="font-semibold text-white">Sala do Empreendedor</p>
                <p>Rua 10 de Novembro, 190, fundos - Cidade Alta</p>
                <p className="flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> (54) 3055-7032</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna Esquerda: Configurações, Busca e Seleção de CNAEs */}
          <div className="lg:col-span-5 space-y-6 print:hidden">
            
            {/* Modalidade de Estabelecimento e MEI */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-emerald-700" />
                Tipo de Estabelecimento no Município
              </label>
              <p className="text-xs text-slate-500 mb-3">
                A modalidade do endereço altera substancialmente a documentação exigida:
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setTipoEstabelecimento('ponto_fixo')}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                    tipoEstabelecimento === 'ponto_fixo'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className={`w-4 h-4 ${tipoEstabelecimento === 'ponto_fixo' ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-900">Ponto Fixo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Com atendimento, produção ou estoque. Exige <strong>Habite-se</strong> e <strong>PPCI</strong>.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoEstabelecimento('ponto_referencia')}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                    tipoEstabelecimento === 'ponto_referencia'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Compass className={`w-4 h-4 ${tipoEstabelecimento === 'ponto_referencia' ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-slate-900">Ponto de Referência</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Apenas domicílio fiscal / correspondência. <strong>Dispensado de Habite-se e PPCI</strong>.
                  </p>
                </button>
              </div>

              {/* Opção MEI */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800">É Microempreendedor Individual (MEI)?</span>
                  <p className="text-[11px] text-slate-500">Isento de taxa TFLIF (Art. 196 LC 183/2013)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isMei} 
                    onChange={(e) => setIsMei(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Card de Busca de CNAEs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-700" />
                Adicionar Atividades (CNAEs)
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Digite o código CNAE (ex: <code className="bg-slate-100 px-1 py-0.5 rounded">4711-3/02</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">5611-2/01</code>) ou o nome da atividade (ex: <em>supermercado</em>, <em>restaurante</em>, <em>escritório</em>).
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Pesquisar código ou descrição..."
                  className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                {busca && (
                  <button 
                    onClick={() => setBusca('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Lista de Resultados da Busca */}
              {cnaesFiltrados.length > 0 && (
                <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 overflow-y-auto divide-y divide-slate-100 z-20">
                  {cnaesFiltrados.map((item) => (
                    <button
                      key={item.clean_code}
                      onClick={() => adicionarCnae(item)}
                      className="w-full text-left p-3 hover:bg-emerald-50 transition flex items-start justify-between gap-2 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                            {item.cnae}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            TFLIF: {item.aliquota_tflif >= 10 ? (item.aliquota_tflif/100) : item.aliquota_tflif} URM ({item.aliquota_tflif >= 10 ? item.aliquota_tflif : (item.aliquota_tflif*100)}%)
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 font-medium group-hover:text-emerald-900">
                          {item.descricao}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CNAEs Selecionados */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Atividades Selecionadas ({cnaesSelecionados.length})
                </h3>
                {cnaesSelecionados.length > 0 && (
                  <button
                    onClick={() => {
                      setCnaesSelecionados([]);
                      setRespostasPerguntas({});
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>

              {cnaesSelecionados.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Nenhum CNAE selecionado ainda.</p>
                  <p className="text-xs text-slate-400 mt-1">Busque acima para enquadrar a empresa.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cnaesSelecionados.map((item, idx) => (
                    <div 
                      key={item.clean_code}
                      className={`p-3 rounded-lg border transition ${
                        idx === 0 
                          ? 'border-emerald-300 bg-emerald-50/50' 
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {item.cnae}
                            </span>
                            {idx === 0 ? (
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                PRINCIPAL
                              </span>
                            ) : (
                              <button
                                onClick={() => definirPrincipal(idx)}
                                className="text-[10px] text-slate-500 hover:text-emerald-700 underline"
                              >
                                Tornar principal
                              </button>
                            )}
                            <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded">
                              TFLIF: {item.aliquota_tflif >= 10 ? (item.aliquota_tflif/100) : item.aliquota_tflif} URM ({item.aliquota_tflif >= 10 ? item.aliquota_tflif : (item.aliquota_tflif*100)}%)
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                            {item.descricao}
                          </p>
                        </div>
                        <button
                          onClick={() => removerCnae(item.clean_code)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remover atividade"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Badges de Risco Sanitário, Ambiental e EIV */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px] flex-wrap">
                        <span className="text-slate-500">VISA:</span>
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${
                          item.visa?.risco === 'III' ? 'bg-rose-100 text-rose-800' :
                          item.visa?.risco === 'II' ? 'bg-amber-100 text-amber-800' :
                          item.visa?.risco === 'P' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {item.visa?.risco === 'P' ? 'Condicionado' : item.visa?.risco || 'NA'}
                        </span>

                        <span className="text-slate-500 ml-1">SMMAM:</span>
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${
                          item.smmam?.risco === 'III' ? 'bg-rose-100 text-rose-800' :
                          item.smmam?.risco === 'II' ? 'bg-amber-100 text-amber-800' :
                          item.smmam?.risco === 'P' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {item.smmam?.risco === 'P' ? 'Condicionado' : item.smmam?.risco || 'NA'}
                        </span>

                        {item.eiv?.sujeito && (
                          <span className="ml-1 bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                            EIV (Anexo 9.1)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Perguntas Condicionais Compartilhadas (se houver e for Ponto Fixo) */}
            {tipoEstabelecimento === 'ponto_fixo' && diagnostico?.perguntasPendentes && diagnostico.perguntasPendentes.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Perguntas de Condicionamento ({diagnostico.perguntasPendentes.length})
                </div>
                <p className="text-xs text-amber-800 mb-4">
                  Perguntas unificadas entre os órgãos licenciadores (respostas compartilhadas automaticamente entre Meio Ambiente e Vigilância Sanitária):
                </p>

                <div className="space-y-4">
                  {diagnostico.perguntasPendentes.map((perg) => (
                    <div key={perg.chave} className="bg-white p-3 rounded-lg border border-amber-200 text-xs">
                      <div className="text-[10px] font-bold text-amber-700 uppercase mb-1">
                        {perg.origem} • CNAE {perg.cnae}
                      </div>
                      <p className="text-slate-800 font-medium mb-1.5">
                        {perg.pergunta}
                      </p>
                      {perg.descritivo && (
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                          {perg.descritivo}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => responderPergunta(perg.chave, 'SIM')}
                          className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition ${
                            respostasPerguntas[perg.chave] === 'SIM'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => responderPergunta(perg.chave, 'NAO')}
                          className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition ${
                            respostasPerguntas[perg.chave] === 'NAO'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          Não
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Diagnóstico Consolidado, Tributário e Checklist */}
          <div className="lg:col-span-7 space-y-6">
            
            {!diagnostico ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">Selecione ao menos um CNAE</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  O sistema calculará a taxa TFLIF com base na URM de Bento Gonçalves (R$ 187,03), analisará o risco sanitário/ambiental e listará os documentos oficiais.
                </p>
              </div>
            ) : (
              <>
                {/* Banner de Diagnóstico e Risco */}
                <div className={`rounded-xl border p-6 shadow-sm ${
                  diagnostico.nivelRiscoGeral === 'I' 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : diagnostico.nivelRiscoGeral === 'II'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                          diagnostico.nivelRiscoGeral === 'I'
                            ? 'bg-emerald-200 text-emerald-900'
                            : diagnostico.nivelRiscoGeral === 'II'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}>
                          {diagnostico.nivelRiscoGeral === 'I' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          {diagnostico.tituloRisco}
                        </span>
                        <span className="bg-slate-200 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                          {tipoEstabelecimento === 'ponto_fixo' ? 'Ponto Fixo' : 'Ponto de Referência'}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 mt-2">
                        {diagnostico.elegivelUmaHora ? 'Abertura Rápida em até 1 Hora' : 'Abertura com Licenciamento Prévio'}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                        {diagnostico.descricaoRisco}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 print:hidden shrink-0">
                      <button
                        onClick={copiarRelatorio}
                        className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        <Copy className="w-4 h-4" />
                        {copiado ? 'Copiado!' : 'Copiar'}
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir
                      </button>
                    </div>
                  </div>

                  {/* Card Tributário - TFLIF e URM */}
                  <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        Taxa TFLIF Calculada:
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-1">
                        {diagnostico.tributario.isMei ? (
                          <span className="text-emerald-700">ISENTO (MEI)</span>
                        ) : (
                          `R$ ${diagnostico.tributario.valorTflif.toFixed(2)}`
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Alíquota: {diagnostico.tributario.qtdUrm || 2} URM ({diagnostico.tributario.aliquotaPercentual}%)
                      </p>
                    </div>

                    <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-emerald-600" />
                        Valor Oficial da URM:
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-1">
                        R$ {diagnostico.tributario.valorUrm.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Bento Gonçalves / RS
                      </p>
                    </div>

                    <div className="bg-white/90 p-3 rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-700">Estudo de Vizinhança (EIV):</span>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {diagnostico.sujeitoEiv ? (
                          <span className="text-purple-700">Sujeito ao Anexo 9.1</span>
                        ) : (
                          <span className="text-slate-600">Não Previsto no Anexo 9.1</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Conforme LC 200/2018
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist de Documentação Exigida */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        Listagem Final de Documentos ({tipoEstabelecimento === 'ponto_fixo' ? 'Ponto Fixo' : 'Ponto de Referência'})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Lista consolidada automaticamente. Os PDFs definem os documentos; as tabelas definem se EIV, PPCI, licenciamento ambiental e sanitário são necessários. Quando há pergunta sem resposta, a lista considera o maior potencial.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {diagnostico.documentos.map((categoria, catIdx) => (
                      <div key={catIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                            {categoria.categoria}
                          </span>
                          {categoria.alerta && (
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              {categoria.alerta}
                            </span>
                          )}
                        </div>

                        <div className="p-3 divide-y divide-slate-100">
                          {categoria.itens.map((doc, docIdx) => (
                            <div
                              key={docIdx}
                              className="flex items-start gap-3 py-2.5 px-2 rounded transition"
                            >
                              <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${doc.obrigatorio === false ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                                {doc.obrigatorio === false ? 'i' : '✓'}
                              </span>
                              <div className="text-xs">
                                <span className={`font-semibold ${doc.obrigatorio === false ? 'text-slate-600' : 'text-slate-800'}`}>
                                  {doc.nome}{doc.obrigatorio === false ? ' (não solicitado)' : ''}
                                </span>
                                <p className="mt-0.5 leading-relaxed text-slate-500">
                                  {doc.detalhe}
                                </p>
                                {doc.fonte && <p className="mt-0.5 text-[10px] text-slate-400">Fonte: {doc.fonte}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orientações Regulamentares */}
                {tipoEstabelecimento === 'ponto_fixo' && (diagnostico.orientacoesVisa.length > 0 || diagnostico.orientacoesSmmam.length > 0) && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-emerald-700" />
                      Orientações Regulamentares dos Órgãos
                    </h3>
                    
                    <div className="space-y-3 text-xs text-slate-600">
                      {diagnostico.orientacoesVisa.map((ori, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                          <strong className="text-slate-800 block mb-1">Vigilância Sanitária:</strong>
                          {ori}
                        </div>
                      ))}

                      {diagnostico.orientacoesSmmam.map((ori, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                          <strong className="text-slate-800 block mb-1">Meio Ambiente (SMMAM):</strong>
                          {ori}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <p>Prefeitura Municipal de Bento Gonçalves • Secretaria de Desenvolvimento Econômico • Sala do Empreendedor</p>
        <p className="mt-1">Sistema Integrado à REDESIM, Lei da Liberdade Econômica e Código Tributário Municipal (LC 183/2013)</p>
      </footer>
    </div>
  );
}
