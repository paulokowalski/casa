# Sistema de Gestão Financeira

## Descrição
Sistema para gerenciamento de finanças pessoais, permitindo o controle de despesas, compras parceladas e análise de gastos através de gráficos e relatórios.

## Funcionalidades Principais
- Cadastro e gerenciamento de compras
- Controle de parcelas
- Visualização de despesas por período
- Gráficos de análise financeira
- Filtros personalizados
- Suporte a múltiplos cartões
- Acessibilidade integrada

## Tecnologias Utilizadas
- React
- TypeScript
- Material-UI
- Recharts
- Jest (Testes)
- React Testing Library

## Estrutura do Projeto
```
src/
├── components/          # Componentes reutilizáveis
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
├── services/           # Serviços e chamadas API
├── views/              # Componentes de página
└── functions/          # Funções utilitárias
```

## Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação
1. Clone o repositório
```bash
git clone [URL_DO_REPOSITORIO]
```

2. Instale as dependências
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações

4. Execute o projeto
```bash
npm start
# ou
yarn start
```

## Testes
Para executar os testes:
```bash
npm test
# ou
yarn test
```

## Acessibilidade
O projeto inclui diversas features de acessibilidade:
- Suporte a leitores de tela
- Controle de tamanho de fonte
- Modo de alto contraste
- Navegação por teclado
- Redução de movimento

## Manutenção
### Convenções de Código
- Utilize TypeScript para todos os arquivos
- Siga o padrão de nomes CamelCase para funções e PascalCase para componentes
- Mantenha os componentes pequenos e focados
- Use hooks customizados para lógica reutilizável
- Documente funções e componentes complexos

### Performance
- Utilize React.memo para componentes que recebem props estáveis
- Implemente virtualização para listas longas
- Use lazy loading para rotas
- Otimize imagens e assets

### Testes
- Mantenha cobertura de testes acima de 80%
- Teste comportamentos, não implementação
- Use mocks para serviços externos
- Inclua testes de integração para fluxos críticos

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.