// Exemplo de configuração do Firebase
// Copie este arquivo para src/services/firebase.ts e substitua com suas credenciais

const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};

// Para obter essas credenciais:
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um novo projeto ou use um existente
// 3. Vá em "Project Settings" (ícone de engrenagem)
// 4. Na aba "General", role até "Your apps"
// 5. Clique em "Add app" e escolha "Web"
// 6. Copie as credenciais do objeto firebaseConfig 