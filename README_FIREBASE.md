# Migração para Firebase - Sistema de Check-in

## 🚀 Por que Firebase?

O Firebase é a melhor opção para este projeto porque oferece:

- **Simplicidade**: Não precisa configurar servidor
- **Escalabilidade**: Cresce automaticamente com o uso
- **Tempo Real**: Sincronização em tempo real entre dispositivos
- **Offline**: Funciona mesmo sem internet
- **Segurança**: Regras de acesso configuráveis
- **Custo**: Plano gratuito generoso

## 📋 Passos para Configuração

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Digite um nome para o projeto (ex: "sistema-checkin")
4. Siga os passos de configuração

### 2. Configurar Firestore Database

1. No console do Firebase, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Escolha a localização mais próxima (ex: us-central1)

### 3. Configurar Regras de Segurança

No Firestore, vá em "Regras" e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todos (modo desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Para produção, use regras mais restritivas:
    // match /ticketTypes/{document} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

### 4. Obter Credenciais

1. No console, vá em "Project Settings" (ícone de engrenagem)
2. Na aba "General", role até "Your apps"
3. Clique em "Add app" e escolha "Web"
4. Digite um nome para o app
5. Copie as credenciais do objeto `firebaseConfig`

### 5. Configurar o Projeto

1. Abra `src/services/firebase.ts`
2. Substitua as credenciais de exemplo pelas suas:

```typescript
const firebaseConfig = {
  apiKey: "sua-api-key-real",
  authDomain: "seu-projeto-real.firebaseapp.com",
  projectId: "seu-projeto-real-id",
  storageBucket: "seu-projeto-real.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id-real"
};
```

## 🔧 Estrutura do Banco

O Firebase Firestore criará automaticamente as seguintes coleções:

- **ticketTypes**: Tipos de ticket (Participante, Palestrante, VIP, etc.)
- **tickets**: Participantes cadastrados
- **checkInOuts**: Histórico de check-ins e check-outs
- **certificates**: Certificados gerados

## 📊 Vantagens da Migração

### Antes (LocalStorage):
- ❌ Dados perdidos ao limpar navegador
- ❌ Não funciona em múltiplos dispositivos
- ❌ Sem backup automático
- ❌ Limite de armazenamento

### Depois (Firebase):
- ✅ Dados persistentes na nuvem
- ✅ Sincronização em tempo real
- ✅ Backup automático
- ✅ Escalável sem limites
- ✅ Funciona offline
- ✅ Múltiplos dispositivos

## 🚀 Como Usar

1. **Desenvolvimento**: Configure as regras para permitir tudo
2. **Produção**: Configure regras de segurança adequadas
3. **Monitoramento**: Use o console do Firebase para monitorar uso

## 💰 Custos

- **Plano Gratuito**: 50.000 leituras/dia, 20.000 escritas/dia
- **Plano Pago**: $0.18 por 100.000 leituras, $0.18 por 100.000 escritas

Para um evento com 1.000 participantes, o plano gratuito é mais que suficiente.

## 🔒 Segurança (Produção)

Para produção, configure regras mais restritivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir apenas leitura para usuários autenticados
    match /ticketTypes/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    match /tickets/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /checkInOuts/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /certificates/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 Próximos Passos

1. Configure o Firebase seguindo os passos acima
2. Teste a aplicação localmente
3. Configure regras de segurança para produção
4. Monitore o uso no console do Firebase

## 📞 Suporte

Se precisar de ajuda:
- [Documentação Firebase](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Comunidade Firebase](https://firebase.google.com/community) 