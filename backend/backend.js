
const express = require("express");  // expressパッケージの読み込み
const mysql = require("mysql2");     // mysql2パッケージの読み込み
const multer = require("multer");    // multerの読み込み（ファイルデータをリクエストで受け取る）
const cors = require("cors");        // corsの読み込み（保護用ブロック解除を許可）
require('dotenv').config();          // .envファイルの読み込み
const path = require("path");        
const fs = require('fs');            // fsパッケージの読み込み
const app = express();


// フロントエンドに対してcorsを許可
app.use(cors({
    origin: [
            "http://127.0.0.1:5000", 
            "http://127.0.0.1:5500"
        ]
}));
app.use(express.static(path.join(__dirname,'..','public')));  // 静的ファイル置き場の公開

// 送信できる容量を制限
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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


// 古い画像をフォルダから削除する処理
const deleteFile = (deletepath) => {
    try {
        // fileExistsの確認をしてから同期削除
        if (fs.existsSync(deletepath)) {
            fs.unlinkSync(deletepath);
            console.log(`deleted ${deletepath}`);
        }
    } catch (err) {
        console.error("ファイル削除中にエラーが発生しました:", err);
    }
}

// 画像更新、削除時にデータが他の行にも存在するか確認する処理
const checkOtherData = (ImagePath, GameId =null) => {
    return new Promise((resolve, reject) => {
        const select_query = 'select COUNT(*) as count from package_game where game_image_path = ?';  // プレースホルダでセキュリティ対策

        connection.query(select_query,ImagePath,(err,result) =>{
            if(err){
                console.error(err);
                reject(err);
            }
            
            let count = result[0].count;  // データの件数を取得
            if(GameId){
                count--;  // 更新する行の件数を除外
            }
            console.log('同じ画像パスの件数：' + count);
            resolve(count);  // 同じ画像パスの件数を返す
        });
    });
}


// insert,update共通部分
const sharedGameFormHandle = async (req,res,query,successComment,uploadPath) =>{
    
    // console.log(uploadPath);
    // リクエストで受け取った値たち
    // console.log(req);

    const gameTitle = req.body.GameTitle;
    const platform = req.body.PlayPackageKinds;
    const playDate = req.body.PlayDate;
    const playStatus = req.body.PlayStatus;
    const hour =  parseInt(req.body.PlayTimeHour * 60);
    const minutes =  parseInt(req.body.PlayTimeMinute || 0);
    const playTImeMinute = hour + minutes;
    const review = req.body.Review;
    const starLevel = req.body.RecommendedLevel;

    let gameImagePath = null;  // 画像が送られてきてない場合を考慮

    // 古い画像のパスを取得（古い画像データが渡された場合）
    const oldImagePath = req.body.OldImagePath ? path.basename(req.body.OldImagePath) : null;
    const deletePath = oldImagePath ? path.join(uploadPath, oldImagePath) : null; // 削除するファイルのパスを指定

    console.log('古い画像パス：' + oldImagePath);

    console.log(deletePath);
    if(req.files && req.files.length > 0){
        gameImagePath = req.files[0].filename;   // 画像の名前

        // 古い画像が存在し、デフォルト画像でない場合は削除する
        if (req.body.GameId && deletePath && oldImagePath !== "default_image.png") {
            let count = await checkOtherData(oldImagePath,req.body.GameId);  // 他の行に同じ画像パスが存在するか確認
            if(count === 0 && deletePath){
                deleteFile(deletePath);  // サーバー側のフォルダから画像データを削除する処理を呼び出す
            }
        }
    }
    else if(req.body.OldImagePath){
        gameImagePath = oldImagePath;
    }
    else{
        gameImagePath = "default_image.png";  // デフォルトの画像を設定
    }

    // パラメータ
    const values = [gameTitle,platform,playDate,playStatus,playTImeMinute,review,starLevel,gameImagePath];

    // game_idがある場合（update用）
    if(req.body.GameId){
        values.push(req.body.GameId);
    }


    // クエリ実行
    connection.query(query,values, (err,results) =>{
        if(err){
            console.error("データを追加できませんでした：" + err);
            return res.status(500).send("エラーが発生しました");  // ステータスコードを返す
        }

        // 実行できた場合
        if(results.affectedRows === 1){
            console.log(successComment);
            return res.status(200).send(successComment);
        }
    });
}



// 画像保存先パスの指定
const uploadPath = path.join(__dirname,'..','Image'); 

const image = multer({dest:uploadPath});
// 新規登録処理
app.post('/form/insert', image.any(),(req,res) =>{

    const insert_query = `INSERT INTO package_game 
                   (game_title,platform,play_date,play_status,play_time_minutes,review,star_level,game_image_path)
                   VALUES (?,?,?,?,?,?,?,?)`;  // プレースホルダでセキュリティ対策
    
    // 共通部分の呼び出し（クエリ実行）
    sharedGameFormHandle(req,res,insert_query,"データを登録しました",uploadPath);

});

// 更新処理
app.post('/form/update',image.any(),(req,res) =>{

    const update_query = `UPDATE package_game
                          SET game_title=?, platform=?, play_date=?, play_status=?, play_time_minutes=?,review=?, star_level=?, game_image_path=?
                          WHERE game_id=?`;

    // 共通部分の呼び出し（クエリ実行）
    sharedGameFormHandle(req,res,update_query,"データを更新しました",uploadPath);
});


// データベースからJSONデータを取得する処理（全件取得）
app.get('/mainscreen/reload/getJson',(req,res) => {
    
    const select_all_query = 'select * from package_game';  // 全件取得
    connection.query(select_all_query,(err,results) =>{
        if(err){
            console.error(err);
            return res.status(500).send('DBエラー');
        }

        console.log(results);
        res.json(results);

    });


});

// サーバーから画像データを受け取り呼び出し元に返す処理
app.get('/mainscreen/reload/getBinary/:imagepath',(req,res) => {
    const fileName = req.params.imagepath;  // URLの末尾の動的なパラメータ（imagepath）を取得
    console.log(fileName);// ファイル取得できたかチェック

    const filePath = path.join(__dirname,'..','Image',fileName);
    console.log(filePath); 
    res.sendFile(filePath);  // ファイルを返す
});


// データベースからデータを取得（特定のIDのデータ）
app.get('/mainscreen/editCard/getJson/:gameID',(req,res) => {
    const params = req.params.gameID;  // URLの末尾の動的なパラメータを取得

    const select_query = 'select * from package_game where game_id = ?';  // プレースホルダでセキュリティ対策

    connection.query(select_query,params,(err,result) =>{
        if(err){
            console.error(err);
            return res.status(500).send('DBエラー');
        }

        console.log(result);
        res.json(result);  // JSON形式で返す
    });
});


// データベースからデータを削除（特定ID）
app.get('/data/delete/:gameId',(req,res) =>{
    const gameId = req.params.gameId;  // URLパラメータからgameIdを取得

    console.log('削除するID：' + gameId);  // 確認用

    // 削除するデータの画像パスを取得
    const select_query = 'select game_image_path from package_game where game_id = ?';  // プレースホルダでセキュリティ対策

    // クエリ実行
    connection.query(select_query,gameId,(err,result) =>{
        if(err){
            console.error(err);
            return res.status(500).send('DBエラー:' + err);
        }

        // データが存在しない場合の処理
        if (!result || result.length === 0) {
            return res.status(404).send('削除対象のデータが見つかりませんでした');
        }

        const imagePath = result[0].game_image_path;  // 画像パスを取得
        
        let deletePath = null;
        // 画像パスが存在し、デフォルト画像でない場合
        if(imagePath && imagePath !== "default_image.png"){ 
            deletePath = path.join(uploadPath, imagePath);  // 削除するファイルのパスを指定
        } 


        // 削除するデータのクエリ
        const delete_query = `DELETE FROM package_game WHERE game_id = ?`;

        // クエリ実行
        connection.query(delete_query,gameId,async(err,result) =>{
            if(err){
                console.error(err);
                return res.status(500).send('DBエラー:' + err);
            }

            console.log('削除成功');
            let count = await checkOtherData(imagePath);  // 他の行に同じ画像パスが存在するか確認
            if(count === 0 && deletePath){
                await deleteFile(deletePath);  // サーバー側のフォルダから画像データを削除する処理を呼び出す
            }
            res.status(200).send('データを削除しました');
        });

    });


});


// ポートの受付
app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:5000');
});  