
const express = require("express");  // expressパッケージの読み込み
const mysql = require("mysql2");     // mysql2パッケージの読み込み
const multer = require("multer");    // multerの読み込み（ファイルデータをリクエストで受け取る）
const cors = require("cors");        // corsの読み込み（保護用ブロック解除を許可）
require('dotenv').config();          // .envファイルの読み込み
const app = express();
const path = require("path");

// フロントエンドに対してcorsを許可
app.use(cors({
    origin: "http://127.0.0.1:5500"
}));
app.use(express.static(path.join(__dirname,'..','public')));  // 静的ファイル置き場の公開

// mysqlとの接続情報を登録
const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,

});

// データベース接続確認処理
connection.connect((err) =>{
    if(err) {
        console.log('error connecting' + err.stack);
        return;
    }

    console.log('success');  // 接続成功
});

// 画像保存先パスの指定
const uploadPath = path.join(__dirname,'..','Image'); 

// formから送られたデータをデータベースに格納
const image = multer({dest:uploadPath});
app.post('/form', image.array('GameImagePhoto',1),(req,res) =>{
    // リクエストで受け取った値たち
    const gameTitle = req.body.GameTitle;
    const platform = req.body.PlayPackageKinds;
    const playDate = req.body.PlayDate;
    const playStatus = req.body.PlayStatus;
    const playTImeMinute = (req.body.PlayTimeHour * 60) + (req.body.PlayTimeMinute || 0);
    const review = req.body.Review;
    const starLevel = req.body.RecommendedLevel;

    let gameImagePath = null;  // 画像が送られてきてない場合を考慮
    if(req.files && req.files.length > 0){
        gameImagePath = req.files[0].path;   // multerで作ったパスと同じパスを指定
    }
    else{
        gameImagePath = "Image\\150x150.png";  // デフォルトの画像を設定
    }


    const insert_query = `INSERT INTO package_game 
                   (game_title,platform,play_date,play_status,play_time_minutes,review,star_level,game_image_path)
                   VALUES (?,?,?,?,?,?,?,?)`;  // プレースホルダでセキュリティ対策

    const values = [gameTitle,platform,playDate,playStatus,playTImeMinute,review,starLevel,gameImagePath];

    connection.query(insert_query,values, (err,results) =>{
        if(err){
            console.err("データを追加できませんでした：" + err);
            return res.status(500).send("エラーが発生しました");  // ステータスコードを返す
        }

        // 1件追加できた場合
        if(results.affectedRows === 1){
            console.log("データを追加しました");
            return res.status(200).send("追加できました");
        }
    });
});


// データベースからデータを取得する処理

app.get('/mainscreen/reload',(req,res) => {
    const select_query = 'select * from package_game';  // 全件取得
    connection.query(select_query,(err,results) =>{
        if(err){
            console.error(err);
            return res.status(500).send('DBエラー');
        }

        console.log(results);
        res.json(results);

    });


});





app.listen(3000);  // ポートの受付