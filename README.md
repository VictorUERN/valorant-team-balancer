# Valorant Team Balancer

Aplicação web para balanceamento automático de partidas personalizadas 5v5.

## Requisitos
- Node.js 18 ou superior
- npm

## Executar localmente
1. Extraia o ZIP.
2. Abra a pasta no VS Code.
3. Abra o terminal dentro da pasta.
4. Execute:

```bash
npm install
npm run dev
```

5. Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

## Gerar versão de produção
```bash
npm run build
```
Os arquivos prontos para hospedagem serão gerados na pasta `dist`.

## Publicar gratuitamente na Vercel
1. Envie os arquivos deste projeto para um repositório no GitHub.
2. Entre em https://vercel.com e conecte sua conta GitHub.
3. Importe o repositório.
4. A Vercel detectará o Vite automaticamente.
5. Clique em Deploy.

## Observação sobre os dados
Esta versão guarda a lista de jogadores no armazenamento local do navegador (`localStorage`). Os dados ficam no dispositivo/navegador utilizado e não são compartilhados automaticamente com outros usuários. Para cadastro sincronizado entre várias pessoas, será necessário adicionar um banco de dados.
