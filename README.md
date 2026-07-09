# Game Package Management

## 概要

ゲームパッケージを管理するWebアプリケーションです。

ゲームタイトル、ゲームの種類、プレイ状況、レビューなどを登録・管理できます。

## 前提条件
このプロジェクトを実行するには、以下のツールがインストールされている必要があります。
### **Docker / Docker Compose**

## 開発環境
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">

## 使用技術

### フロントエンド
<img src="https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=nginx&logoColor=white"> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/CSS-663399?style=for-the-badge&logo=css&logoColor=white"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">



### バックエンド
<img src="https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white"> <img src="https://img.shields.io/badge/Express-0A0A0A?style=for-the-badge&logo=express&logoColor=white">

### データベース
<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">

#### その他ライブラリ
- nodemon: Node.jsアプリケーションを自動的に再起動してくれるツール（開発効率を上げるため）
- multer : アップロードされたファイルをImageディレクトリに保存するために使用（ミドルウェア）
- cors   : 異なるオリジン（ドメイン・ポート等）間での通信を安全に許可するために使用
- dotenv : .envファイル情報をNode.jsで扱えるようにするために使用
- mysql2 : Node.jsからMySQLデータベースを操作する際に使用

## 機能

- ゲーム一覧表示
- ゲーム情報登録
- ゲーム情報編集
- ゲーム情報削除
- 項目フィルター検索（ゲームの種類別）
- 画像アップロード（backendフォルダ内のImageフォルダに画像データを格納）

## セットアップ手順

### 1. リポジトリを取得

```bash
git clone https://github.com/ena5628/PackageGameManagement.git　
```

### 2. .envファイルの作成

```bash
cd ./PackageGameManagement
cp .env.example .env
```
>.env.example はあくまで設定項目のテンプレートです。
本番環境や個人環境で使用する際は、必ずより強固で推測されにくいパスワード等の値に書き換えてから使用することを強く推奨します。

### 3. docker composeの起動

```bash
docker compose up -d --build
```

