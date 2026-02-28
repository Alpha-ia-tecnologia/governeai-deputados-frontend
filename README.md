# Frontend - Sistema de Vereadores

Aplicativo móvel desenvolvido com React Native e Expo.

## 🚀 Como executar

### No Windows PowerShell

```powershell
cd frontend

# Instalar dependências
npm install --legacy-peer-deps

# Iniciar o Expo
npx expo start
```

### Opções de execução

- **`npx expo start`** - Inicia o Metro bundler
- **`npx expo start --web`** - Abre no navegador
- **`npx expo start --tunnel`** - Usa tunnel (útil para redes complexas)

## 📱 Executar no dispositivo

1. Instale o app **Expo Go** no seu celular
2. Escaneie o QR Code que aparece no terminal
3. Ou pressione `w` para abrir no navegador

## 🔧 Tecnologias

- **React Native** - Framework mobile
- **Expo** - Toolchain e runtime
- **Expo Router** - Navegação baseada em arquivos
- **TypeScript** - Tipagem estática
- **Axios** - Cliente HTTP
- **Zustand** - Gerenciamento de estado
- **NativeWind** - Styling com Tailwind CSS

## 📦 Estrutura

```
frontend/
├── app/              # Rotas (file-based routing)
├── assets/           # Imagens e ícones
├── components/       # Componentes reutilizáveis
├── contexts/         # Context providers
├── services/         # API integration
├── types/            # TypeScript definitions
└── package.json
```

## 🔗 Conectar ao Backend

O backend deve estar rodando em `http://localhost:3000`

Para configurar a URL da API, edite `services/api.ts`
