
const express = require("express");  // expressパッケージの読み込み
const mysql = require("mysql2");  // mysql2パッケージの読み込み
const app = express();
const path = require("path");

// mysqlとの接続情報を登録
const connection = mysql.createConnection({

});

app.get('/',function(req,res){
    res.send('Hello World'); // レスポンスを返す
});

app.listen(3000);  // ポートの受付