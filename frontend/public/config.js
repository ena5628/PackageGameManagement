// 自動的にローカルと本番用サーバーのipアドレスを切り替えた環境変数
const CONFIG = {
    API_BASE_URL:window.location.hostname === 'localhost' || window.location.hostname === "127.0.0.1" ?
                 'http://localhost:3000'
                 :`http://${window.location.host}:3000`  

};