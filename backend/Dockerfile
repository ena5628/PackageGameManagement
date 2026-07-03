# imageの指定
FROM node:lts-alpine

# 作業場所の指定
WORKDIR /usr/src/app

# パッケージ情報のコピー
COPY package*.json ./

# パッケージのインストール
RUN npm install 

# 残りのソースコードをすべてコピー
COPY . .

# Node.jsサーバーが使うポートの指定
EXPOSE 5000

# コンテナ起動時に実行するコマンド
CMD ["node", "backend.js"]


