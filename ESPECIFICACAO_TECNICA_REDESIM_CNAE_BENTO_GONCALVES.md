# Especificação Técnica — Consulta REDESIM por CNAE
## Município de Bento Gonçalves/RS

**Documento para a equipe de TI da Prefeitura**  
**Versão:** 1.0  
**Data:** 16/10/2026  
**Repositório de referência:** https://github.com/hateixeira/consulta-cnae

---

## 1. Objetivo

Construir um sistema municipal de consulta que, a partir do CNAE fiscal e das características do estabelecimento, informe:

- documentos necessários para abertura e licenciamento;
- necessidade ou dispensa de licença sanitária;
- necessidade ou dispensa de licenciamento ambiental;
- necessidade de EIV/EII;
- necessidade de PPCI/CLCB conforme os modelos documentais aplicáveis;
- risco por órgão licenciador;
- taxa TFLIF em URM e em reais;
- possibilidade de abertura automatizada em até uma hora;
- perguntas condicionais oficiais e suas declarações.

O sistema deve gerar uma **listagem final consolidada**, e não um checklist no qual o usuário escolhe quais documentos deseja solicitar.

---

## 2. Princípio central das regras

O sistema utiliza duas fontes de decisão diferentes:

### 2.1. PDFs de atividades: documentos

Os PDFs de exemplos definem quais documentos aparecem na listagem documental da atividade, como:

- Habite-se;
- contrato de locação;
- contrato social;
- cartão do CNPJ;
- PPCI ou certificado de conformidade;
- BIE;
- documento dos sócios;
- registro no MAPA, quando aplicável.

### 2.2. Tabelas oficiais: licenças e risco

As planilhas definem se a atividade precisa de determinado licenciamento e qual o nível de risco:

- Vigilância Sanitária — VISA;
- Secretaria Municipal de Meio Ambiente — SMMAM;
- TFLIF e classificação tributária;
- EIV/EII e enquadramento do Plano Diretor.

**Regra importante:** uma licença não deve ser incluída apenas porque aparece no PDF de outra atividade. A necessidade da licença é decidida pela tabela correspondente ao CNAE.

---

## 3. Fluxo funcional

### 3.1. Entradas do usuário

1. Tipo de endereço:
   - Ponto Fixo;
   - Ponto de Referência.
2. Condição de MEI.
3. CNAE principal.
4. CNAEs secundários.
5. Respostas às perguntas condicionais oficiais.

### 3.2. Processamento

1. Localizar todos os CNAEs na base consolidada.
2. Buscar risco VISA de cada CNAE.
3. Buscar risco ambiental SMMAM de cada CNAE.
4. Carregar perguntas relacionadas a cada CNAE.
5. Unificar perguntas equivalentes entre órgãos.
6. Aplicar respostas já informadas.
7. Para perguntas sem resposta, considerar o maior potencial de exigência.
8. Identificar CNAEs enquadrados no Anexo 9.1 de EIV.
9. Selecionar documentos dos PDFs aplicáveis.
10. Remover documentos duplicados.
11. Consolidar a maior exigência entre todos os CNAEs.
12. Calcular a TFLIF.
13. Apresentar a listagem final.

### 3.3. Saída

A saída deve apresentar:

- risco geral;
- risco VISA;
- risco SMMAM;
- situação de EIV/EII;
- valor da URM;
- quantidade de URMs da TFLIF;
- valor estimado em reais;
- documentos solicitados;
- dispensas identificadas;
- perguntas ainda pendentes;
- fontes de cada regra.

---

## 4. Ponto Fixo e Ponto de Referência

## 4.1. Ponto Fixo

É o estabelecimento com operação física no endereço, incluindo uma ou mais das situações abaixo:

- atendimento ao público;
- produção;
- estoque;
- funcionários;
- circulação de mercadorias;
- prestação efetiva de serviço no local.

Para Ponto Fixo são avaliados documentos imobiliários, bombeiros, licenças sanitárias, ambientais e urbanísticas conforme as tabelas e PDFs aplicáveis.

## 4.2. Ponto de Referência

É exclusivamente endereço fiscal ou de correspondência, sem:

- atendimento presencial;
- estoque;
- produção;
- circulação operacional;
- funcionamento da atividade no imóvel.

### Documentos do Ponto de Referência

Com base em `Ponto de Referência.pdf`:

1. Comprovante de residência atualizado;
2. Declaração de Ponto de Referência com firma reconhecida;
3. Contrato social, requerimento de empresário ou CCMEI;
4. Cartão do CNPJ;
5. Boletim de Informações Econômicas preenchido e assinado;
6. Cópia dos documentos dos sócios.

### Dispensas no Ponto de Referência

Enquanto não houver atividade física no endereço, o sistema indica a dispensa de:

- Habite-se comercial no endereço de referência;
- PPCI/CLCB para operação inexistente no local;
- licença sanitária no endereço;
- licenciamento ambiental no endereço;
- EIV relacionado à operação física naquele imóvel.

O sistema deve exibir alerta quando o CNAE normalmente pressupõe estabelecimento físico, estoque ou atendimento. O usuário não deve utilizar Ponto de Referência para ocultar operação efetiva no endereço.

---

## 5. TFLIF e URM

## 5.1. Valor da URM

Valor utilizado na aplicação:

```text
URM = R$ 187,03
```

O valor deve ser mantido em configuração anual, com:

- ano de vigência;
- valor da URM;
- ato normativo ou fonte;
- data de início;
- data de atualização.

Não se deve gravar o valor diretamente no código em um sistema de produção municipal.

## 5.2. Interpretação da tabela tributária

Na base utilizada, o campo da planilha representa múltiplo de URM:

| Valor da tabela | Interpretação | Percentual | Valor com URM de R$ 187,03 |
|---:|---:|---:|---:|
| 2 | 2 URMs | 200% | R$ 374,06 |
| 3 | 3 URMs | 300% | R$ 561,09 |
| 60 | 60 URMs | 6.000% | R$ 11.221,80 |

### Fórmula

```text
quantidade_URM = valor_da_tabela
valor_TFLIF = quantidade_URM × valor_URM_vigente
```

Para MEI:

```text
valor_TFLIF = R$ 0,00
```

conforme a regra de isenção indicada na base legal municipal utilizada.

## 5.3. Múltiplos CNAEs

Quando há mais de um CNAE, aplicar a maior quantidade de URMs entre as atividades selecionadas, conforme a regra de maior valor da LC 183/2013.

---

## 6. Risco sanitário — VISA

Fonte principal:

```text
Tabela_Licenc_v5B_-_VISA_Bento_Gonçalves.xlsx
```

### Campos utilizados

A aba `CNAE X RISCO` fornece:

- CNAE;
- descrição;
- risco sanitário;
- IDs de perguntas;
- declarações relacionadas;
- validade para Nível II;
- validade para Nível III.

A aba `PERGUNTAS` fornece:

- ID;
- pergunta;
- descritivo;
- indicação de domicílio fiscal;
- ordem.

A aba `RESPOSTAS` fornece:

- ID da pergunta;
- resposta;
- grau de risco resultante;
- declaração.

### Interpretação

| Risco | Regra de saída |
|---|---|
| NA | Não se aplica ou não há interesse sanitário indicado |
| I | Baixo risco/dispensa ou procedimento sem licença sanitária prévia, conforme orientação vigente |
| II | Licenciamento sanitário simplificado/provisório conforme tabela |
| III | Alvará de Autorização Sanitária/licença prévia antes da operação |
| P | Pergunta condicional; sem resposta, usar maior potencial |

A equipe de TI deve manter a resposta original e o grau resultante como dados auditáveis.

---

## 7. Risco ambiental — SMMAM

Fonte principal:

```text
Tabela Licenciamento Ambiental - SMMAM.xlsx
```

### Campos utilizados

A aba `CNAE X RISCO` fornece:

- CNAE;
- descrição;
- risco ambiental;
- IDs das perguntas.

A aba `PERGUNTAS` fornece:

- ID;
- pergunta;
- descritivo;
- ordem.

A aba `RESPOSTAS` fornece:

- ID da pergunta;
- resposta;
- grau resultante;
- declaração.

### Interpretação

| Risco | Regra de saída |
|---|---|
| NA | Não se aplica ou não há interesse ambiental indicado |
| I | Baixo risco/dispensa ambiental conforme tabela |
| II | Licença Ambiental Simplificada ou ato equivalente conforme tabela |
| III | Licença ambiental aplicável antes da operação, na SMMAM ou FEPAM conforme competência |
| P | Pergunta condicional; sem resposta, usar maior potencial |

A correlação CNAE/CODRAM é um balizador. O processo municipal deve manter a responsabilidade de verificar a Resolução CONSEMA nº 372/2018 e suas alterações.

---

## 8. Perguntas compartilhadas

Uma pergunta não deve ser repetida apenas porque aparece nas tabelas da VISA e da SMMAM.

### Regra de unificação

1. Normalizar o texto:
   - converter para minúsculas;
   - remover acentos;
   - remover pontuação;
   - reduzir espaços.
2. Aplicar chaves semânticas para perguntas equivalentes, especialmente:
   - área útil de 1.000 m²;
   - área construída de 2.500 m²;
   - área útil de 250 m²;
   - área de supermercado/centro comercial superior a 500 m²;
   - produto artesanal.
3. Exibir uma única pergunta.
4. Gravar a resposta uma única vez.
5. Reaplicar a mesma resposta a todos os órgãos e CNAEs relacionados.

### Pergunta sem resposta

Se a pergunta for condicional e estiver sem resposta:

- ela deve aparecer na seção de perguntas pendentes;
- a listagem final deve usar o maior potencial de risco;
- a documentação não deve ser subestimada.

Quando o usuário responder “Não”, o sistema pode reduzir a exigência se a tabela permitir.

---

## 9. EIV/EII e urbanismo

Fonte principal:

```text
Ferramenta_Tributaria_Bento_Goncalves.xlsx
```

A aba `Cnae X EIV` fornece:

- CNAE;
- descrição;
- grau de risco fiscal;
- enquadramento legal no Anexo 9.1.

### Regra

Se qualquer CNAE selecionado constar na tabela EIV:

1. marcar o empreendimento como enquadrado no Anexo 9.1;
2. informar o fundamento legal encontrado;
3. apresentar EIV/EII com ART como exigência de análise urbanística;
4. permitir que a regra de porte, zoneamento e localização determine o resultado definitivo;
5. não afirmar dispensa automática apenas pela escolha do CNAE.

Para CNAE não encontrado na tabela, informar que não há enquadramento específico na base consultada, sem afirmar que a atividade é imune a análise urbanística.

---

## 10. PPCI/CLCB

A tabela de risco utilizada no sistema não substitui a avaliação do Corpo de Bombeiros.

Para Ponto Fixo, os PDFs de atividade normalmente incluem:

- PPCI; ou
- Certificado de Conformidade/CLCB.

Portanto, o documento aparece quando consta no PDF de atividade aplicável. Para CNAE sem PDF específico, deve aparecer com a indicação:

> PPCI/CLCB conforme exigência do CBMRS e características da ocupação.

Para Ponto de Referência sem operação física, o sistema indica a dispensa no endereço de referência, desde que a declaração corresponda à realidade.

---

## 11. Catálogo de documentos dos PDFs

O arquivo de implementação correspondente é:

```text
src/data/atividadesDocs.js
```

### 11.1. Supermercado

Fonte: `Supermercado.pdf`

Documentos:

1. Habite-se;
2. contrato de locação, se for locado;
3. contrato social;
4. cartão do CNPJ;
5. PPCI ou certificado de conformidade;
6. BIE preenchido e assinado;
7. cópia do documento dos sócios.

A licença ambiental, sanitária e o EIV não devem ser incluídos apenas pelo PDF; são definidos pelas tabelas do CNAE.

### 11.2. Restaurantes e similares

Fonte: `Restaurantes e similares.pdf`

Documentos:

1. Habite-se;
2. contrato de locação, se for locado;
3. contrato social;
4. cartão do CNPJ;
5. PPCI ou certificado de conformidade;
6. BIE preenchido e assinado;
7. cópia do documento dos sócios.

### 11.3. Restaurante em Área Gastronômica

Fonte: `Restaurantes sem EIV - Área Gastronômica.pdf`

Documentos:

1. Habite-se;
2. contrato de locação, se for locado;
3. contrato social;
4. cartão do CNPJ;
5. PPCI ou certificado de conformidade;
6. BIE preenchido e assinado;
7. cópia do documento dos sócios.

A eventual dispensa ou não exigência de EIV precisa ser confirmada por regra de localização/zoneamento, não apenas pelo nome do PDF.

### 11.4. Padaria e confeitaria

Fonte: `Padaria e confeitaria.pdf`

Documentos:

1. Habite-se;
2. contrato de locação, se for locado;
3. contrato social;
4. cartão do CNPJ;
5. PPCI ou certificado de conformidade;
6. BIE preenchido e assinado;
7. cópia do documento dos sócios.

### 11.5. Escritórios e serviços profissionais

Fontes:

- `Escritório.pdf`;
- `Atividade de contabilidade.pdf`.

Documentos:

1. Habite-se;
2. contrato de locação, se for locado;
3. contrato social;
4. cartão do CNPJ;
5. PPCI ou certificado de conformidade;
6. BIE preenchido e assinado;
7. cópia do documento dos sócios.

Se houver atividade regulamentada, o sistema pode indicar registro em conselho profissional como informação complementar, desde que a fonte municipal aplicável seja cadastrada.

### 11.6. Vinícola e produção de bebidas

Fontes:

- `Vinicola - MAPA.pdf`;
- `Vinícola área Rural - bebidas alcoólicas MAPA e sanitária.pdf`.

Documentos:

1. Habite-se, matrícula averbada ou laudo técnico;
2. contrato de locação, se for locado;
3. contrato social;
4. cartão do CNPJ;
5. PPCI ou certificado de conformidade;
6. BIE preenchido e assinado;
7. cópia do documento dos sócios;
8. registro de estabelecimento no MAPA, quando exigido pela atividade.

Licenciamento ambiental e sanitário devem ser definidos pelas tabelas e pelas respostas, não somente pelo PDF.

---

## 12. Documentos básicos de Ponto Fixo sem PDF específico

Quando não houver PDF de atividade cadastrado, usar o modelo `Ponto Fixo Padrão.pdf` como base:

1. Habite-se, matrícula averbada ou laudo técnico;
2. contrato de locação, se for locado, ou documento que autorize a ocupação;
3. contrato social/requerimento de empresário/CCMEI;
4. cartão do CNPJ;
5. PPCI ou certificado de conformidade;
6. BIE preenchido e assinado;
7. cópia dos documentos dos sócios.

As licenças, entretanto, continuam sendo calculadas pelas tabelas.

---

## 13. Regra de consolidação por maior potencial

Para cada grupo de documentos e licenças:

```text
resultado_final = união_sem_duplicidade(
  documentos_de_todos_os_CNAEs,
  licença_de_maior_risco_VISA,
  licença_de_maior_risco_SMMAM,
  EIV_se_qualquer_CNAE_estiver_enquadrado,
  maior_TFLIF
)
```

### Exemplo de precedência de risco

```text
Nível III > Nível II > Nível I > NA
```

O status `P` é tratado como maior potencial até que as perguntas sejam respondidas.

### Não duplicação

Documentos iguais devem aparecer uma única vez, mesmo quando exigidos por dois CNAEs. A fonte deve listar todos os PDFs ou tabelas relevantes quando necessário.

---

## 14. Exemplos de resultado

## 14.1. CNAE 4711-3/02 — Supermercado

Dados da base:

- setor: Comércio;
- TFLIF da tabela: 2 URMs;
- TFLIF com URM de R$ 187,03: R$ 374,06;
- VISA: Nível II;
- SMMAM: condicionado pela pergunta ambiental correspondente;
- EIV: enquadrado como supermercado no Anexo 9.1.

A listagem deve conter os documentos do `Supermercado.pdf` e, pelas tabelas:

- procedimento sanitário de Nível II;
- resultado ambiental da pergunta;
- EIV/EII conforme análise do IPURB;
- TFLIF de 2 URMs, salvo MEI.

Se a pergunta ambiental estiver sem resposta, a listagem deve usar o maior potencial ambiental e exibir a pergunta pendente.

## 14.2. CNAE 5611-2/01 — Restaurantes e similares

Dados da base:

- setor: Serviço;
- TFLIF da tabela: 2 URMs;
- TFLIF com URM de R$ 187,03: R$ 374,06;
- VISA: Nível I;
- SMMAM: Nível I;
- EIV: listado no Anexo 9.1 como restaurante/bar/assemelhado.

A listagem deve conter os documentos do `Restaurantes e similares.pdf`, além de:

- resultado sanitário de Nível I/baixo risco conforme tabela;
- resultado ambiental de Nível I/baixo risco conforme tabela;
- indicação de análise de EIV/EII por enquadramento urbanístico;
- TFLIF de 2 URMs, salvo MEI.

---

## 15. Modelo de dados recomendado para produção

### Tabela `cnae`

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador interno |
| codigo | varchar | CNAE formatado |
| codigo_limpo | varchar | CNAE sem pontuação |
| descricao | text | Descrição oficial |
| ativo | boolean | Controle de vigência |
| fonte_id | UUID | Fonte principal |

### Tabela `cnae_risco_orgao`

| Campo | Tipo | Descrição |
|---|---|---|
| cnae_id | UUID | CNAE relacionado |
| orgao | enum | VISA, SMMAM, IPURB, TRIBUTOS |
| risco | enum | NA, I, II, III, P |
| validade | varchar | Validade quando aplicável |
| observacao | text | Orientação oficial |
| vigencia_inicio | date | Início da regra |
| vigencia_fim | date | Fim da regra |

### Tabela `pergunta`

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador interno |
| id_origem | varchar | ID da planilha |
| texto | text | Pergunta oficial |
| descritivo | text | Explicação |
| chave_unificada | varchar | Chave de deduplicação |
| ordem | integer | Ordem de exibição |

### Tabela `pergunta_resposta`

| Campo | Tipo | Descrição |
|---|---|---|
| pergunta_id | UUID | Pergunta |
| resposta | varchar | SIM/NÃO ou valor oficial |
| risco_resultante | enum | I, II, III |
| declaracao | text | Declaração oficial |

### Tabela `documento_modelo`

| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador |
| nome | varchar | Nome do documento |
| descricao | text | Explicação |
| fonte_arquivo | varchar | PDF de origem |
| obrigatoriedade | enum | obrigatório, condicional, informativo |

### Tabela `atividade_documento`

| Campo | Tipo | Descrição |
|---|---|---|
| cnae_id | UUID | CNAE |
| documento_id | UUID | Documento |
| condicao | text | Condição de aplicação |
| prioridade | integer | Ordem de precedência |

### Tabela `urm`

| Campo | Tipo | Descrição |
|---|---|---|
| ano | integer | Ano de referência |
| valor | decimal | Valor da URM |
| ato_legal | varchar | Decreto/ato de atualização |
| vigencia_inicio | date | Início |
| vigencia_fim | date | Fim |

---

## 16. Pseudocódigo principal

```text
consultar(cnaes, tipo_endereco, respostas, mei):

    se tipo_endereco == PONTO_REFERENCIA:
        retornar documentos_do_pdf_ponto_referencia()

    documentos = []
    risco_visa = I
    risco_smmam = I
    sujeito_eiv = falso
    perguntas_pendentes = []

    para cada cnae em cnaes:
        documento_pdf = localizar_pdf_por_cnae(cnae)
        documentos += documentos_do_pdf(documento_pdf)

        risco_v = risco_da_tabela(cnae, VISA)
        risco_s = risco_da_tabela(cnae, SMMAM)

        se risco_v == P:
            pergunta = localizar_pergunta(cnae, VISA)
            chave = unificar_pergunta(pergunta)
            se resposta não existe:
                risco_v = III
                perguntas_pendentes += pergunta
            senão:
                risco_v = resposta_da_tabela(pergunta, resposta)

        se risco_s == P:
            pergunta = localizar_pergunta(cnae, SMMAM)
            chave = unificar_pergunta(pergunta)
            se resposta já foi informada:
                reutilizar resposta
            senão se resposta não existe:
                risco_s = III
                perguntas_pendentes += pergunta
            senão:
                risco_s = resposta_da_tabela(pergunta, resposta)

        risco_visa = maior(risco_visa, risco_v)
        risco_smmam = maior(risco_smmam, risco_s)

        se cnae está na tabela EIV:
            sujeito_eiv = verdadeiro

    documentos += licença_sanitária(risco_visa)
    documentos += licença_ambiental(risco_smmam)
    documentos += eiv(sujeito_eiv)
    documentos = remover_duplicados(documentos)

    tflif = calcular_maior_tflif(cnaes, urm_vigente, mei)

    retornar listagem_final(documentos, riscos, perguntas_pendentes, tflif)
```

---

## 17. Fontes utilizadas na implementação atual

### 17.1. Planilhas

1. `Tabela_Licenc_v5B_-_VISA_Bento_Gonçalves.xlsx`
   - CNAE x risco sanitário;
   - perguntas VISA;
   - respostas VISA;
   - orientações VISA;
   - declarações.
2. `Tabela Licenciamento Ambiental - SMMAM.xlsx`
   - CNAE x risco ambiental;
   - perguntas SMMAM;
   - respostas SMMAM;
   - orientações ambientais.
3. `Ferramenta_Tributaria_Bento_Goncalves.xlsx`
   - CNAE x TFLIF;
   - CNAE x EIV;
   - regras tributárias;
   - setores e graus de risco fiscal.
4. `tabela_apoio_v2.20.1.xlsm`
   - classificação geral de risco: I, II, III, NA e G;
   - usada como referência de nomenclatura de risco.

### 17.2. PDFs de documentação utilizados

1. `Ponto Fixo Padrão.pdf`;
2. `Ponto de Referência.pdf`;
3. `Supermercado.pdf`;
4. `Restaurantes e similares.pdf`;
5. `Restaurantes sem EIV - Área Gastronômica.pdf`;
6. `Padaria e confeitaria.pdf`;
7. `Escritório.pdf`;
8. `Atividade de contabilidade.pdf`;
9. `Vinicola - MAPA.pdf`;
10. `Vinícola área Rural - bebidas alcoólicas MAPA e sanitária.pdf`.

### 17.3. Legislação e documentos normativos de referência

1. `LC 183_2013 - SISTEMA TRIBUTÁRIO MUNICIPAL.pdf`;
2. `DECRETO 10342.2019 - REGULAMENTA LEI LIBERDADE ECONOMICA.doc`;
3. `lei_2019_6536 - Bento.pdf`;
4. `LC 200/2018` e anexos do Plano Diretor, conforme material compartilhado;
5. `DECRETO MUNICIPAL 8890 - MEIO AMBIENTE.pdf`;
6. Resolução CONSEMA nº 372/2018, indicada nas orientações ambientais;
7. `Lei Municipal nº 2193_1992 Taxa Fiscalização Sanitária.docx`, como referência sanitária municipal.

---

## 18. Arquivos atuais do protótipo

| Arquivo | Função |
|---|---|
| `src/App.jsx` | Interface, busca, seleção de CNAE, perguntas e listagem final |
| `src/data/cnaes.json` | Base consolidada e otimizada de CNAEs |
| `src/data/rules.js` | Motor de regras, maior potencial, riscos, licenças, EIV e TFLIF |
| `src/data/atividadesDocs.js` | Catálogo de documentos extraídos dos PDFs |
| `vite.config.js` | Configuração do build e do GitHub Pages |
| `.github/workflows/deploy.yml` | Publicação automática |

---

## 19. Pontos que devem ser homologados antes do uso oficial

O protótipo é uma base técnica e deve passar por homologação dos órgãos municipais. Antes de entrar em produção, a Prefeitura deve:

1. validar cada CNAE com o órgão responsável;
2. confirmar o valor da URM a cada exercício;
3. confirmar a tabela de TFLIF vigente;
4. revisar a equivalência entre CNAE e CODRAM;
5. confirmar os requisitos do CBMRS para PPCI/CLCB;
6. validar os enquadramentos de EIV por porte e zoneamento;
7. revisar todos os PDFs de atividades;
8. cadastrar vigência das regras;
9. manter histórico de alterações;
10. exigir justificativa e usuário responsável por cada alteração;
11. registrar a fonte e a página do documento oficial;
12. submeter a regra final à Secretaria responsável antes da publicação.

O sistema deve exibir claramente que a consulta é orientativa até que as regras sejam formalmente homologadas.

---

## 20. Critérios de aceite

A implementação da equipe de TI será considerada equivalente quando:

- uma busca por CNAE não travar o navegador;
- o sistema permitir CNAE principal e secundários;
- perguntas equivalentes aparecerem apenas uma vez;
- uma resposta for reutilizada entre VISA e SMMAM;
- perguntas sem resposta usarem o maior potencial;
- documentos vierem dos PDFs cadastrados;
- licenças vierem das tabelas, não de PDFs de outras atividades;
- documentos duplicados forem removidos;
- EIV for informado pela tabela de EIV;
- TFLIF usar múltiplos de URM, e não percentual decimal;
- MEI receber tratamento de isenção quando aplicável;
- o resultado final for uma listagem consolidada;
- cada item mostrar sua fonte;
- o resultado poder ser impresso e exportado;
- toda regra possuir vigência e fonte em produção.
