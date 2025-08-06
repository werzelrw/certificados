# PWA - Sistema de Check-in para Coletores de Dados

## 📱 **O que é a PWA?**

A PWA (Progressive Web App) é uma versão otimizada do sistema para dispositivos móveis, especialmente coletores de dados. Funciona offline e pode ser instalada como um app nativo.

## 🎯 **Características da PWA**

### ✅ **Funcionalidades:**
- **Interface simplificada** para check-in/check-out
- **Funciona offline** (dados sincronizados quando online)
- **Instalável** como app nativo
- **Responsiva** para qualquer dispositivo
- **Busca rápida** por código do participante
- **Feedback visual** em tempo real

### 📱 **Otimizada para:**
- Coletores de dados móveis
- Tablets
- Smartphones
- Dispositivos com tela touch

## 🚀 **Como Acessar**

### **URL da PWA:**
```
http://localhost:5173/pwa
```

### **Em Produção:**
```
https://seu-dominio.com/pwa
```

## 📋 **Como Usar**

### 1. **Acessar a PWA**
- Abra o navegador no dispositivo móvel
- Acesse a URL `/pwa`
- Clique em "Instalar" quando aparecer o prompt

### 2. **Realizar Check-in/Check-out**
1. **Digite o código** do participante no campo de busca
2. **Pressione Enter** ou clique em buscar
3. **Confirme os dados** do participante
4. **Clique em Check-in** (verde) ou **Check-out** (azul)

### 3. **Interface da PWA**
```
┌─────────────────────────┐
│    Check-in/Check-out   │
│  [WiFi] Online          │
├─────────────────────────┤
│ [CÓDIGO] [🔍]          │
│                         │
│ ┌─────────────────────┐ │
│ │   João Silva        │ │
│ │   joao@email.com    │ │
│ │                     │ │
│ │ Tipo: Participante  │ │
│ │ Código: ABC123      │ │
│ │                     │ │
│ │ Status: Ausente     │ │
│ │ Tempo: 0.0h         │ │
│ │                     │ │
│ │ [CHECK-IN]          │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## 🔧 **Configuração para Coletores**

### **Dispositivos Recomendados:**
- **Smartphones** Android/iOS
- **Tablets** com tela 7" ou maior
- **Coletores de dados** com Android

### **Navegadores Suportados:**
- Chrome (Android)
- Safari (iOS)
- Edge (Windows)
- Firefox (Android)

## 📊 **Vantagens da PWA**

### **Para o Operador:**
- ✅ Interface simples e rápida
- ✅ Funciona sem internet
- ✅ Instalação fácil
- ✅ Acesso rápido como app

### **Para o Evento:**
- ✅ Múltiplos dispositivos simultâneos
- ✅ Sincronização em tempo real
- ✅ Dados seguros na nuvem
- ✅ Relatórios automáticos

## 🔄 **Funcionamento Offline**

### **Quando Online:**
- Dados salvos diretamente no Firebase
- Sincronização imediata
- Relatórios em tempo real

### **Quando Offline:**
- Dados salvos localmente
- Sincronização automática quando online
- Interface continua funcionando

## 📱 **Instalação no Dispositivo**

### **Android (Chrome):**
1. Acesse a PWA no Chrome
2. Clique em "Instalar" no prompt
3. Ou vá em Menu → "Adicionar à tela inicial"

### **iOS (Safari):**
1. Acesse a PWA no Safari
2. Clique em "Compartilhar"
3. Selecione "Adicionar à tela inicial"

### **Coletores de Dados:**
1. Configure o navegador padrão
2. Acesse a URL da PWA
3. Instale como app nativo

## 🎨 **Personalização**

### **Cores e Tema:**
- Cores adaptáveis ao tema do sistema
- Modo escuro automático
- Interface otimizada para touch

### **Funcionalidades:**
- Busca por código único
- Validação automática
- Feedback sonoro (opcional)
- Vibração (opcional)

## 🔒 **Segurança**

### **Dados:**
- Criptografados em trânsito
- Armazenados no Firebase
- Backup automático
- Acesso controlado

### **Dispositivo:**
- Sem permissões especiais
- Funciona em modo sandbox
- Dados locais seguros

## 📈 **Monitoramento**

### **Uso:**
- Acesse o Firebase Console
- Monitore check-ins em tempo real
- Veja estatísticas de uso
- Relatórios automáticos

### **Performance:**
- Carregamento rápido
- Cache inteligente
- Sincronização eficiente
- Baixo consumo de dados

## 🎯 **Próximos Passos**

1. **Teste a PWA** em diferentes dispositivos
2. **Configure o Firebase** para produção
3. **Personalize** cores e logo se necessário
4. **Treine** os operadores
5. **Monitore** o uso durante o evento

## 📞 **Suporte**

Para dúvidas sobre a PWA:
- Teste em diferentes dispositivos
- Verifique a conectividade
- Monitore o Firebase Console
- Consulte a documentação do Firebase 