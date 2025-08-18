# 📱 Recipe Book App

![React Native](https://img.shields.io/badge/React%20Native-0.72+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Complete-success.svg)

Um aplicativo móvel completo de livro de receitas desenvolvido em React Native com TypeScript, oferecendo uma experiência rica para descobrir, organizar e compartilhar receitas culinárias.

## ✨ Funcionalidades Principais

### 🍳 Gerenciamento de Receitas
- ✅ **Criação e edição** de receitas com interface intuitiva
- ✅ **Upload de múltiplas imagens** com preview
- ✅ **Categorização automática** e manual
- ✅ **Sistema de tags** personalizáveis
- ✅ **Informações nutricionais** detalhadas
- ✅ **Níveis de dificuldade** e tempos de preparo

### 🔍 Busca e Descoberta
- ✅ **Busca avançada** por ingredientes, categorias e tags
- ✅ **Filtros inteligentes** por tempo, dificuldade e tipo
- ✅ **Busca por voz** integrada
- ✅ **Sugestões automáticas** baseadas em preferências
- ✅ **Busca por ingredientes disponíveis**

### ⭐ Sistema de Avaliações
- ✅ **Avaliação com estrelas** (1-5)
- ✅ **Anotações pessoais** com tipos (dica, modificação, atenção)
- ✅ **Histórico de versões** de receitas
- ✅ **Versões derivadas** para experimentações
- ✅ **Controle de privacidade** para anotações

### 📅 Planejamento de Refeições
- ✅ **Calendário interativo** semanal e mensal
- ✅ **Planejamento por tipo** (café, almoço, jantar, lanche)
- ✅ **Ajuste de porções** automático
- ✅ **Geração de listas de compras** a partir do planejamento
- ✅ **Visualização de progresso** das compras

### 📋 Listas Personalizadas
- ✅ **Criação de listas** customizadas
- ✅ **Organização por categorias**
- ✅ **Compartilhamento** de listas
- ✅ **Sincronização** entre dispositivos
- ✅ **Listas de compras** inteligentes

### 📥 Importação de Receitas
- ✅ **Importação via URL** de sites populares
- ✅ **Importação de redes sociais** (Instagram, TikTok, YouTube)
- ✅ **Importação via texto** com parsing inteligente
- ✅ **Validação automática** de URLs
- ✅ **Preview antes de salvar**

### 👥 Recursos Sociais
- ✅ **Perfis de usuário** personalizáveis
- ✅ **Compartilhamento** de receitas
- ✅ **Sistema de favoritos**
- ✅ **Comentários e avaliações**
- ✅ **Feed de atividades**

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React Native** 0.72+ para desenvolvimento mobile multiplataforma
- **TypeScript** para type safety e melhor experiência de desenvolvimento
- **React Native Paper** para componentes Material Design
- **React Navigation** 6.x para navegação entre telas
- **Redux Toolkit** para gerenciamento de estado global
- **RTK Query** para cache e sincronização de dados
- **Redux Persist** para persistência local

### Recursos Nativos
- **React Native Voice** para busca por voz
- **React Native Image Picker** para upload de imagens
- **React Native Share** para compartilhamento
- **AsyncStorage** para armazenamento local

### Desenvolvimento
- **ESLint** + **Prettier** para qualidade de código
- **Jest** para testes unitários
- **TypeScript** strict mode para máxima type safety

## 📁 Estrutura do Projeto

```
RecipeBookApp/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── auth/           # Componentes de autenticação
│   │   ├── common/         # Componentes genéricos
│   │   ├── lists/          # Componentes de listas
│   │   ├── planning/       # Componentes de planejamento
│   │   ├── recipe/         # Componentes de receitas
│   │   └── search/         # Componentes de busca
│   ├── screens/            # Telas da aplicação
│   │   ├── auth/          # Telas de autenticação
│   │   ├── community/     # Telas sociais
│   │   ├── favorites/     # Telas de favoritos
│   │   ├── home/          # Tela inicial
│   │   ├── lists/         # Telas de listas
│   │   ├── planning/      # Telas de planejamento
│   │   ├── recipe/        # Telas de receitas
│   │   └── search/        # Telas de busca
│   ├── services/          # APIs e serviços
│   ├── store/             # Redux store e slices
│   ├── types/             # Definições TypeScript
│   ├── utils/             # Utilitários e helpers
│   ├── hooks/             # Custom hooks
│   ├── navigation/        # Configuração de navegação
│   └── constants/         # Constantes da aplicação
├── android/               # Código nativo Android
├── ios/                   # Código nativo iOS
└── __tests__/            # Testes automatizados
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS, apenas macOS)
- CocoaPods (para iOS)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/recipe-book-app.git
cd recipe-book-app
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Para iOS (apenas macOS)**
```bash
cd ios && pod install && cd ..
```

4. **Execute o Metro bundler**
```bash
npm start
# ou
yarn start
```

5. **Execute no dispositivo/emulador**

**Android:**
```bash
npm run android
# ou
yarn android
```

**iOS:**
```bash
npm run ios
# ou
yarn ios
```

## 📱 Scripts Disponíveis

- `npm start` - Inicia o Metro bundler
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run lint` - Executa o ESLint
- `npm run format` - Formata código com Prettier
- `npm run type-check` - Verifica tipos TypeScript
- `npm test` - Executa testes unitários

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

## 📊 Status do Desenvolvimento

### ✅ Funcionalidades Implementadas
- Sistema completo de gerenciamento de receitas
- Busca avançada com filtros e busca por voz
- Sistema de avaliações e anotações com histórico
- Planejamento de refeições com calendário
- Listas personalizadas e listas de compras
- Importação de receitas via URLs e redes sociais
- Recursos sociais e perfis de usuário
- Autenticação completa
- Interface Material Design responsiva

### 🔄 Arquitetura Implementada
- ✅ Redux Toolkit para gerenciamento de estado
- ✅ RTK Query para cache e sincronização
- ✅ React Navigation 6 para navegação
- ✅ TypeScript strict mode
- ✅ Estrutura modular e escalável
- ✅ Componentes reutilizáveis
- ✅ Custom hooks para lógica compartilhada

## 🎯 Roadmap Futuro

### Próximas Funcionalidades
- [ ] **Modo offline** completo
- [ ] **Sincronização em nuvem**
- [ ] **Reconhecimento de imagem** para ingredientes
- [ ] **Assistente de cozinha** com IA
- [ ] **Integração com dispositivos IoT**
- [ ] **Modo escuro** personalizado
- [ ] **Suporte a múltiplos idiomas**

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- Use **TypeScript** para type safety
- Siga os padrões do **ESLint** e **Prettier**
- Escreva **testes** para novas funcionalidades
- Use **conventional commits**
- Documente **APIs** e componentes complexos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

## 🙏 Agradecimentos

- [React Native Community](https://reactnative.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- Todos os contribuidores e testadores

---

⭐ **Se este projeto te ajudou, deixe uma estrela!** ⭐