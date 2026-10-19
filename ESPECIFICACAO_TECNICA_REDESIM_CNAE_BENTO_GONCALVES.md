

---

## 21. Simulação de licenciamento ambiental e CODRAM

Foi integrado ao projeto o catálogo da calculadora ambiental anterior, contendo **299 atividades CODRAM** extraídas da fonte `AtividadesPassíveisdeLicenciamentoAmbiental (última atualização CONSEMA 556).pdf`.

A grafia normativa utilizada é **CODRAM — Código Ramo**. Caso o usuário escreva “coreano”, “codran” ou outra variação, a interface deve orientar que o código oficial é CODRAM.

### Arquivos da integração

- `src/data/codram.json`: catálogo com código, nome, unidade de medida, potencial poluidor, faixas de porte e página de fonte;
- `src/data/ambiental.js`: matriz de taxas e funções de enquadramento;
- `src/components/AmbientalSimulator.jsx`: interface de sugestão, seleção e simulação.

### Ativação

O simulador aparece somente quando o resultado do CNAE indica necessidade ambiental:

```text
risco ambiental VISA/SMMAM = Nível II ou Nível III
```

Se a classificação ambiental for condicional e a pergunta ainda não tiver resposta, a regra do maior potencial ativa o simulador para evitar subestimação.

### Funcionamento

1. O usuário seleciona um ou mais CNAEs.
2. Se houver necessidade ambiental, o sistema abre o módulo de simulação.
3. O sistema sugere CODRAMs por aproximação textual entre a descrição dos CNAEs e o catálogo ambiental.
4. O usuário também pode pesquisar qualquer código ou descrição entre os 299 CODRAMs.
5. O usuário escolhe o CODRAM aplicável.
6. O sistema apresenta a unidade normativa da métrica, por exemplo:
   - Área útil (m²);
   - Área da bacia de acumulação (ha);
   - Número de cabeças;
   - Poligonal útil (ha).
7. O usuário informa a área ou métrica declarada.
8. O sistema classifica o porte segundo as faixas oficiais.
9. O usuário seleciona LP, LI, LO ou DECL.
10. O sistema calcula a quantidade de URMs e o valor em reais.

A sugestão automática é apenas apoio. A confirmação do CODRAM, do porte e da taxa pertence à análise ambiental oficial.

### Porte

As faixas do CONSEMA 556 são interpretadas sequencialmente:

```text
Não Incidência → Mínimo → Pequeno → Médio → Grande → Excepcional
```

O sistema não inventa faixa quando:

- não existe limite numérico suficiente;
- o valor ultrapassa a última faixa publicada;
- a fonte determina conferência manual.

Nesses casos, o resultado é `Conferir norma` ou `Fora da faixa tabelada`, com taxa calculada igual a zero até a conferência oficial.

### Matriz ambiental importada

Os valores são múltiplos de URM:

- LP: de 1,85 a 53,43 URM, conforme porte e potencial;
- LI: de 5,03 a 183,82 URM, conforme porte e potencial;
- LO: de 2,51 a 123,51 URM, conforme porte e potencial;
- DECL: 0,63 URM;
- PRONAF: possui valores específicos por tipo de licença.

A fórmula é:

```text
valor_taxa_ambiental = quantidade_de_URM × URM_vigente
```

Na versão atual, a URM usada é R$ 187,03, mas deve ser parametrizada por exercício em produção.

### Taxa sanitária

Quando a tabela VISA indicar necessidade sanitária, Nível II ou Nível III, o sistema informa:

```text
Taxa sanitária base = 1 URM
Taxa sanitária estimada = 1 × URM vigente
```

Com URM de R$ 187,03:

```text
Taxa sanitária estimada = R$ 187,03
```

A taxa é apresentada separadamente da TFLIF e da taxa ambiental. Para classificação VISA I/NA, a interface informa que a taxa sanitária não foi indicada pela tabela consultada.

### Homologação necessária

Antes de cobrança ou emissão oficial, a Prefeitura deve confirmar:

- versão vigente da CONSEMA 556;
- matriz de taxas vigente;
- valor anual da URM;
- competência SMMAM/FEPAM;
- CODRAM correspondente à atividade real;
- unidade de medida e faixa de porte;
- hipótese de não incidência;
- regra de PRONAF;
- base municipal da taxa sanitária de 1 URM.
