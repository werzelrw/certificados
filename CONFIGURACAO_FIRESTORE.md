# Configuração do Firestore Database

## 🎯 **PASSO A PASSO - Configurar Firestore**

### 1. Acesse o Console do Firebase
- Vá para: https://console.firebase.google.com/
- Selecione seu projeto: **certificados-fcff7**

### 2. Criar Firestore Database
1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"** (para desenvolvimento)
4. Selecione a localização: **us-central1** (ou a mais próxima)
5. Clique em **"Pronto"**

### 3. Configurar Regras de Segurança
1. Na aba **"Regras"**, substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todos (modo desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

2. Clique em **"Publicar"**

### 4. Estrutura das Coleções
O sistema criará automaticamente estas coleções:

```
certificados-fcff7/
├── ticketTypes/          # Tipos de ticket
│   ├── [id]
│   │   ├── nome: "Participante"
│   │   ├── horas_minimas_para_certificado: 4
│   │   └── created_at: timestamp
├── tickets/              # Participantes
│   ├── [id]
│   │   ├── nome: "João Silva"
│   │   ├── email: "joao@email.com"
│   │   ├── codigo_unico: "ABC123"
│   │   ├── tipo_id: "tipo_id"
│   │   └── created_at: timestamp
├── checkInOuts/          # Check-ins/outs
│   ├── [id]
│   │   ├── ticket_id: "ticket_id"
│   │   ├── timestamp: timestamp
│   │   └── tipo: "checkin" | "checkout"
└── certificates/         # Certificados
    ├── [id]
    │   ├── ticket_id: "ticket_id"
    │   ├── tempo_participacao: 5.5
    │   ├── generated_at: timestamp
    │   └── downloaded: false
```

## ✅ **Verificar se está funcionando**

1. **Teste a aplicação** - deve funcionar normalmente
2. **Crie um tipo de ticket** - aparecerá no Firestore
3. **Cadastre um participante** - será salvo na nuvem
4. **Faça um check-in** - será registrado em tempo real

## 🔍 **Monitorar no Console**

- Vá em **"Firestore Database"** → **"Dados"**
- Você verá as coleções sendo criadas automaticamente
- Cada operação será registrada em tempo real

## 🚨 **Importante**

- **Modo de teste**: Permite todas as operações (desenvolvimento)
- **Para produção**: Configure regras de segurança adequadas
- **Backup automático**: Seus dados estão seguros na nuvem

## 🎉 **Pronto!**

Agora seu sistema está usando Firestore Database com:
- ✅ Dados persistentes na nuvem
- ✅ Sincronização em tempo real
- ✅ Backup automático
- ✅ Escalabilidade ilimitada 