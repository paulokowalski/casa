# Kowalski House - Sistema de Gestão Financeira

Um sistema moderno e premium para gestão financeira pessoal, desenvolvido com React, TypeScript e Material-UI.

## 🎨 Design Moderno e Premium

O projeto foi completamente reestilizado com um design contemporâneo que inclui:

### ✨ Características do Design
- **Glassmorphism**: Efeitos de vidro fosco com backdrop-filter
- **Gradientes Modernos**: Paleta de cores sofisticada com gradientes suaves
- **Animações Fluidas**: Transições suaves e animações de entrada
- **Tipografia Inter**: Fonte moderna e legível
- **Responsividade**: Design adaptável para todos os dispositivos
- **Efeitos Hover**: Interações visuais elegantes

### 🎯 Componentes Modernos
- **Cards com Glassmorphism**: Efeito de vidro fosco com bordas suaves
- **Navegação Intuitiva**: Sidebar moderna com ícones e descrições
- **Loading States**: Skeletons animados com efeito shimmer
- **Botões Gradientes**: Ações com gradientes e animações
- **Indicadores Visuais**: Chips coloridos e badges informativos

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Material-UI (MUI)** - Biblioteca de componentes React
- **Styled Components** - CSS-in-JS para estilos dinâmicos
- **React Router** - Roteamento da aplicação

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/casa.git

# Entre no diretório
cd casa

# Instale as dependências
npm install

# Execute o projeto
npm start
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Card/           # Card moderno com glassmorphism
│   ├── Layout/         # Layout principal com sidebar
│   ├── LoadingSkeleton/ # Skeletons de carregamento
│   └── ui/             # Componentes de interface
├── views/              # Páginas da aplicação
│   ├── Home/           # Dashboard principal
│   └── Financa/        # Gestão financeira
├── styles/             # Estilos globais e tema
│   ├── global.ts       # Estilos CSS globais
│   └── theme.ts        # Tema do Material-UI
├── contexts/           # Contextos React
├── hooks/              # Hooks personalizados
├── services/           # Serviços de API
└── types/              # Definições de tipos TypeScript
```

## 🎨 Paleta de Cores

### Cores Principais
- **Azul Primário**: `#667eea` → `#764ba2` (gradiente)
- **Azul Secundário**: `#36d1dc` → `#5b86e5` (gradiente)
- **Azul Info**: `#4facfe` → `#00f2fe` (gradiente)
- **Verde Sucesso**: `#4facfe` → `#00f2fe` (gradiente)
- **Vermelho Erro**: `#ff6b6b` → `#ee5a24` (gradiente)
- **Amarelo Aviso**: `#feca57` → `#ff9ff3` (gradiente)

### Cores de Texto
- **Texto Primário**: `#2c3e50`
- **Texto Secundário**: `#7f8c8d`

## 🔧 Configuração do Tema

O tema foi configurado com:

```typescript
// src/styles/theme.ts
export const theme = createTheme({
  palette: {
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    // ... outras configurações
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          // ... outros estilos
        },
      },
    },
    // ... outros componentes
  },
});
```

## 📱 Responsividade

O design é totalmente responsivo com breakpoints:

- **xs**: < 600px (mobile)
- **sm**: 600px - 900px (tablet)
- **md**: 900px - 1200px (desktop pequeno)
- **lg**: 1200px - 1536px (desktop)
- **xl**: > 1536px (desktop grande)

## 🎭 Animações

### Animações Globais
- **fade-in**: Aparição suave
- **fade-in-up**: Aparição de baixo para cima
- **slide-in-left**: Deslizamento da esquerda
- **hover-lift**: Elevação no hover

### Efeitos de Transição
- **cubic-bezier(0.4, 0, 0.2, 1)**: Curva de animação suave
- **backdrop-filter**: Efeito de blur para glassmorphism
- **transform**: Transformações 3D suaves

## 🎨 Componentes Principais

### Card Moderno
```typescript
<Card
  title="Título do Card"
  description="Descrição do card"
  icon={<IconComponent />}
  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  badge="Novo"
  badgeColor="success"
>
  {/* Conteúdo do card */}
</Card>
```

### Loading Skeleton
```typescript
<LoadingSkeleton 
  variant="summary" 
  count={5} 
/>
```

## 🚀 Deploy

```bash
# Build para produção
npm run build

# Deploy no Netlify/Vercel
npm run deploy
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para seu-email@exemplo.com ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ e muito café ☕**