const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer'); // 🔥 新加入：負責處理檔案上傳

const app = express();
const port = 4000;

// 設定可以解析 JSON 請求
app.use(express.json());
// 設定可以讓網頁公開存取的靜態檔案資料夾 (目前資料夾與 /uploads)
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 🔥 讓網頁可以存取 /uploads 資料夾下的圖片

const dbPath = path.join(__dirname, 'clover.db');

// --- 🌟 MULTER 圖片上傳設定開始 ---
// 1. 設定圖片要存放在哪裡，以及檔名要叫什麼
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 圖片會存在 uploads 這個資料夾下
    },
    filename: function (req, file, cb) {
        // 設定唯一的檔名：當前時間 + 原始副檔名，防止檔名重複
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});
// 2. 建立一個專門處理上傳的 upload 工具
const upload = multer({ storage: storage });
// --- 🌟 MULTER 圖片上傳設定結束 ---


function runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// 啟動與初始化資料庫 (加入 image_url 欄位)
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");
    
    // 主表：Clover_Items (加入 image_url 欄位)
    db.run(`CREATE TABLE IF NOT EXISTS Clover_Items (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        leaf_count INTEGER,
        image_url TEXT, -- 🌟 新增的欄位，用來儲存圖片檔案路徑或網址
        collection_date TEXT
    );`);

    // 子表 Origins 與 Preservation 保持不變
    db.run(`CREATE TABLE IF NOT EXISTS Origins (
        origin_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        city TEXT NOT NULL,
        place_name TEXT NOT NULL,
        method TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES Clover_Items (item_id) ON DELETE CASCADE
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS Preservation (
        pres_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        storage_method TEXT NOT NULL,
        condition TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES Clover_Items (item_id) ON DELETE CASCADE
    );`);
});

// 網頁路由
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// GET API: 撈取資料 (加入圖片連結)
app.get('/api/clovers', (req, res) => {
    const readDb = new sqlite3.Database(dbPath);
    const { search, sort } = req.query;

    let sqlQuery = `
        SELECT 
            i.item_id, 
            i.item_name AS 藏品名稱, 
            i.category,
            i.image_url, -- 🌟 撈出圖片連結
            o.city AS 城市, 
            o.place_name AS 採集地點, 
            p.storage_method AS 保存方式, 
            p.condition AS 目前狀態
        FROM Clover_Items i
        JOIN Origins o ON i.item_id = o.item_id
        JOIN Preservation p ON i.item_id = p.item_id
        WHERE 1=1
    `;
    let params = [];
    if (search) {
        sqlQuery += ` AND i.item_name LIKE ?`;
        params.push(`%${search}%`);
    }
    if (sort === 'newest') {
        sqlQuery += ` ORDER BY i.item_id DESC`;
    } else {
        sqlQuery += ` ORDER BY i.item_id ASC`;
    }

    readDb.all(sqlQuery, params, (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
        readDb.close();
    });
});

// GET API: 聚合統計 (保持不變)
app.get('/api/stats', (req, res) => {
    const statDb = new sqlite3.Database(dbPath);
    const sqlQuery = `
        SELECT o.city AS 城市, COUNT(i.item_id) AS 總數量, ROUND(AVG(i.leaf_count), 1) AS 平均葉數
        FROM Clover_Items i
        JOIN Origins o ON i.item_id = o.item_id
        GROUP BY o.city;
    `;
    statDb.all(sqlQuery, [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
        statDb.close();
    });
});

// POST API: 🔥 大升級！改成接收 FormData 與上傳的單張圖片 (upload.single('imageFile'))
app.post('/api/clovers', upload.single('imageFile'), async (req, res) => {
    const writeDb = new sqlite3.Database(dbPath);
    // 表單的其他字串資料
    const { itemName, category, leafCount, city, placeName, method, storageMethod, condition } = req.body;
    // 上傳成功後的圖片資訊
    const uploadedFile = req.file;

    // 我們利用藏品名稱來做聰明的預設圖片分類，防止使用者沒上傳
    let imageUrl = null;
    if (uploadedFile) {
        imageUrl = '/uploads/' + uploadedFile.filename; // 🌟 如果有上傳實體圖片，存入它的相對路徑
    } else {
        // 如果使用者沒上傳，我們根據藏品名稱或類別附帶預設圖片網址，維持「高級官網感」
        if (itemName && (itemName.includes('鑰匙圈') || itemName.includes('書籤'))) {
            imageUrl = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80'; // 小物 Unsplash
        } else {
            imageUrl = 'https://images.unsplash.com/photo-1595942928577-714482571448?w=600&q=80'; // 植物 Unsplash
        }
    }

    try {
        await runQuery(writeDb, "PRAGMA foreign_keys = ON;");
        // 🌟 核心：插入主表時，把圖片連結 (imageUrl) 一併存進去
        const mainResult = await runQuery(writeDb, 
            `INSERT INTO Clover_Items (item_name, category, leaf_count, image_url, collection_date) VALUES (?, ?, ?, ?, date('now'))`,
            [itemName, category, leafCount, imageUrl]
        );
        const newItemId = mainResult.lastID;

        await runQuery(writeDb, `INSERT INTO Origins (item_id, city, place_name, method) VALUES (?, ?, ?, ?)`, [newItemId, city, placeName, method]);
        await runQuery(writeDb, `INSERT INTO Preservation (item_id, storage_method, condition) VALUES (?, ?, ?)`, [newItemId, storageMethod, condition]);

        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        writeDb.close();
    }
});

// DELETE API: 聯級刪除 (保持不變)
app.delete('/api/clovers/:id', (req, res) => {
    const deleteDb = new sqlite3.Database(dbPath);
    const id = req.params.id;
    deleteDb.run("PRAGMA foreign_keys = ON;", () => {
        deleteDb.run(`DELETE FROM Clover_Items WHERE item_id = ?`, [id], function(err) {
            if (err) res.status(500).json({ error: err.message });
            else res.sendStatus(200);
            deleteDb.close();
        });
    });
});

app.listen(port, () => {
    console.log(`🍀 幸運草智慧典藏PRO(上傳圖片版)：http://localhost:${port}/index.html`);
});