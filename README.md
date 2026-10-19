# Consulta CNAE - REDESIM Bento Gonçalves

Sistema web interativo para consulta de CNAE fiscal e identificação automática da documentação e licenças necessárias para abertura e regularização de empresas no município de **Bento Gonçalves / RS**.

O sistema está alinhado às diretrizes da **REDESIM**, da **Lei da Liberdade Econômica** (Lei Federal nº 13.874/2019 e Decreto Municipal nº 10.342/2019) e ao objetivo municipal de desburocratização e abertura de empresas de baixo risco em **até 1 hora**.

---

## 🚀 Funcionalidades

- **Busca Rápida de CNAE:** por código numérico ou palavra-chave (mais de 1.300 atividades econômicas mapeadas).
- **Enquadramento Multi-CNAE:** suporte a CNAE Principal + CNAEs Secundários, calculando o risco consolidado da empresa.
- **Perguntas de Condicionamento:** refinamento interativo para atividades com risco condicionado pela Vigilância Sanitária (VISA) ou Meio Ambiente (SMMAM).
- **Classificação de Risco Consolidada:**
  - **Nível I (Baixo Risco):** dispensa de atos públicos prévios e elegibilidade para abertura em até 1h.
  - **Nível II (Médio Risco):** alvará provisório / fiscalização posterior.
  - **Nível III (Alto Risco):** licenciamento prévio obrigatório.
- **Checklist Dinâmico de Documentação:**
  - Cadastro e Fazenda Municipal (Habite-se, Contrato Social, CNPJ, Locação, Sócios, BIE).
  - Prevenção Contra Incêndio (PPCI / Certificado de Conformidade do Bombeiros).
  - Vigilância Sanitária (Alvará Sanitário, ART, Manuais de Boas Práticas, PGRSS).
  - Meio Ambiente (Licenciamento SMMAM / FEPAM, PCA, Certidão de Uso do Solo).
- **Exportação e Compartilhamento:**
  - Cópia formatada para WhatsApp / e-mail com 1 clique.
  - Impressão otimizada ou salvamento em PDF.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**

---

## 📦 Como Executar Localmente

```bash
# Clone o repositório
git clone https://github.com/hateixeira/consulta-cnae.git

# Acesse o diretório
cd consulta-cnae

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em seu navegador: `http://localhost:5173`

---

## 🏢 Realização e Apoio

- **Prefeitura Municipal de Bento Gonçalves**
