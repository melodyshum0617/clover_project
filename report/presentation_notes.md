# 🍀 幸運草智慧典藏PRO：簡報與口頭報告專用文件

本文件為您整理了簡報第三頁（**資料庫設計：ER圖**）與第四頁（**系統流程圖**）的「簡報投影文字」、「技術核心細節」以及「口頭報告講稿」，方便您直接複製使用。

---

## 📌 投影片 03. 資料庫設計：ER 圖

### 🖥️ 簡報投影字卡 (放投影片上的精簡文字)
*   **三表關聯架構**：
    *   `Clover_items` (藏品主表) ➔ 記錄名稱、分類、葉數、圖片路徑。
    *   `Origins` (產地子表) ➔ 記錄採集縣市、詳細地點、採集方式。
    *   `Preservation` (保存子表) ➔ 記錄保存狀態、存放媒介。
*   **設計優勢**：
    *   採用 **1:1 模組化設計**，避免單一資料表欄位肥大，方便未來擴充。
    *   啟用 **聯級刪除 (ON DELETE CASCADE)** 機制，維護資料完整一致。

---

### 🎙️ 口頭報告講稿 (上台時照著唸)
> 「各位老師、同學好，在資料庫設計的部分，我們採用了 **實體-關係模型 (ER 圖)** 來規劃系統架構。
>
> 為了保持資料的結構化與未來的擴充性，我們將資料拆分為三個表：**主表是 Clover_items**，用來儲存藏品的核心欄位，包含葉數、名稱以及這次新升級的圖片路徑欄位。
>
> 另外我們將空間與保存資訊獨立為兩個子表，分別是 **Origins（產地）** 與 **Preservation（保存）**，它們都透過 `item_id` 外鍵與主表維持 **1對1 (1:1)** 的關聯。
> 
> 這樣的設計好處是，除了未來如果想增加『採集 GPS 座標』或『保存人』等欄位時非常容易擴充外，我們也設定了**聯級刪除**。當主表的某個幸運草被刪除時，產地與保存紀錄會自動一併清除，保證資料庫不會殘留垃圾資料。以上是我們的資料庫設計。」

---

## 📌 投影片 04. 系統流程圖

### 🖥️ 簡報投影字卡 (放投影片上的精簡文字)
*   **進入網站 (載入階段)**：
    *   **前端**：網頁載入後自動發送異步請求。
    *   **後端**：Express 接收 API 指令並向資料庫查詢。
    *   **資料庫**：執行三表 `JOIN` 聯表查詢，回傳資料進行免重整渲染。
*   **登記寫入 (新增階段)**：
    *   **前端**：打包欄位與上傳圖片發送 `POST` 請求。
    *   **後端**：判定圖片（實體圖片儲存 vs 系統預設美圖匹配）。
    *   **資料庫**：依序寫入主表與子表，回傳成功後前端即時渲染新卡片。

---

### 📊 系統三層運作架構 (前端 ➔ 後端 ➔ 資料庫)

為了滿足老師對於「一步一步前端、後端、資料庫做了什麼」的要求，詳細步驟如下：

#### 🔄 階段一：使用者【進入網站】時
1.  **前端 (Frontend)**：
    *   瀏覽器載入網頁後，JavaScript 自動發送 `GET /api/clovers` 請求。
2.  **後端 (Backend)**：
    *   Node.js/Express 伺服器接收到請求，向 SQLite 資料庫發送查詢指令。
3.  **資料庫 (Database)**：
    *   執行 `SELECT ... JOIN` 指令，將「藏品表」、「產地表」與「保存表」聯表合併查詢，並將結果回傳。
4.  **前端渲染 (Render)**：
    *   後端回傳 JSON 資料，前端 JS 收到後**免重整網頁**直接繪製照片牆與統計圖表。

#### 💾 階段二：使用者【登記寫入】時
1.  **前端 (Frontend)**：
    *   使用者輸入表單、上傳圖片，點擊「登記寫入」。
    *   前端將資料打包成 `FormData`，發送 `POST /api/clovers` 請求。
2.  **後端 (Backend)**：
    *   接收請求，並進行**圖片智慧判定**：
        *   *有選圖片* ➔ 將實體檔案存入 `/uploads` 資料夾並取得相對路徑。
        *   *沒選圖片* ➔ 系統依類別自動匹配預設高質感圖片網址。
3.  **資料庫 (Database)**：
    *   開啟交易機制，先將資料寫入 `Clover_Items` 取得新 ID，再將關聯資料寫入 `Origins` 與 `Preservation`，完成後回傳成功訊號。
4.  **前端渲染 (Render)**：
    *   後端回傳成功，前端 JS 收到訊號後**免重整網頁**，直接動態將新卡片加入照片牆，畫面即時渲染。

---

### 🎙️ 口頭報告講稿 (上台時照著唸)
> 「接著是我們的系統流程。老師有特別提到希望我們能說清楚前端、後端與資料庫在背後一步一步做了什麼事，我們將其拆解為兩個階段：
>
> **第一個是『載入階段』**：當使用者一進入網站，前端會自動發送 GET 請求給 Express 後端，後端接著去 SQLite 資料庫執行 JOIN 語法，把藏品、產地、保存狀態整合在一起回傳。前端收到 JSON 資料後，會免重整地即時把美麗的照片牆和統計圖表繪製出來。
>
> **第二個是『新增資料階段』**：當使用者填好表單、選好上傳圖片，並按下登記寫入時，前端會發送 POST 請求。後端 Express 收到後會做一個圖片判定，如果使用者有上傳實體圖片，我們會將圖片存入 uploads 資料夾；如果沒上傳，我們會智慧化匹配預設的精美圖片網址。
> 
> 接著，後端會請資料庫依序寫入主表與子表，成功寫入後回傳 200 成功訊號。前端收到後，不需要重新整理網頁，照片牆就會立刻動態滑出剛剛新增的卡片。這樣的設計提供了極佳的使用者體驗。以上是我們系統流程的說明。」

---

## 📌 投影片 05. 核心 SQL 語法與邏輯解析 (全功能完整版)

本頁面為您整理專案中**所有用到的 SQL 語法與資料庫邏輯**，無一遺漏。這能向教授證明您對資料庫底層技術的完全掌控。

### 📋 一、 資料庫初始化與防護邏輯

#### 1. 啟用外鍵約束功能 (Foreign Key Enable)
*   **實際語法**：
    ```sql
    PRAGMA foreign_keys = ON;
    ```
*   **白話邏輯**：告訴資料庫「開啟關聯保護鎖」。如果沒有開啟這個設定，下面的「聯級刪除」和「外鍵約束」將會全部失效。這是保證資料庫健康的第一步。

---

### 📋 二、 建立資料表語法 (CREATE TABLE)

#### 1. 建立藏品主表 (`Clover_Items`)
*   **實際語法**：
    ```sql
    CREATE TABLE IF NOT EXISTS Clover_Items (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        category TEXT NOT NULL,
        leaf_count INTEGER,
        image_url TEXT,
        collection_date TEXT
    );
    ```
*   **白話邏輯**：建立一個名為「Clover_Items」的箱子。`item_id` 設為自動增加的序號（主鍵），用來當作每件藏品的唯一身份證。另外包含名稱、分類、葉子數量、圖片檔案路徑與採集登記日期。

#### 2. 建立產地子表 (`Origins`)
*   **實際語法**：
    ```sql
    CREATE TABLE IF NOT EXISTS Origins (
        origin_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        city TEXT NOT NULL,
        place_name TEXT NOT NULL,
        method TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES Clover_Items (item_id) ON DELETE CASCADE
    );
    ```
*   **白話邏輯**：建立產地表。透過 `item_id` 與主表關聯。最重要的技術亮點是 `ON DELETE CASCADE`（聯級刪除）：只要主表的某個幸運草被刪除，這張表裡對應的產地資料會**自動一起被銷毀**，不留垃圾。

#### 3. 建立保存子表 (`Preservation`)
*   **實際語法**：
    ```sql
    CREATE TABLE IF NOT EXISTS Preservation (
        pres_id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        storage_method TEXT NOT NULL,
        condition TEXT NOT NULL,
        FOREIGN KEY (item_id) REFERENCES Clover_Items (item_id) ON DELETE CASCADE
    );
    ```
*   **白話邏輯**：建立保存狀態表。同樣利用 `item_id` 外鍵綁定主表，並支援聯級刪除，確保保存狀態隨時與藏品同步。

---

### 📋 三、 登記寫入資料 (INSERT INTO)

#### 1. 寫入主表並生成日期
*   **實際語法**：
    ```sql
    INSERT INTO Clover_Items (item_name, category, leaf_count, image_url, collection_date) 
    VALUES (?, ?, ?, ?, date('now'));
    ```
*   **白話邏輯**：當使用者送出登記，系統會把名字、類別、葉數和圖片路徑存進去。特別使用 SQLite 的 `date('now')` 函數，讓系統在寫入時自動蓋上今天的日期戳記。

#### 2. 同步寫入子表 (產地與保存)
*   **實際語法**：
    ```sql
    INSERT INTO Origins (item_id, city, place_name, method) VALUES (?, ?, ?, ?);
    INSERT INTO Preservation (item_id, storage_method, condition) VALUES (?, ?, ?);
    ```
*   **白話邏輯**：後端抓到剛才主表寫入時自動產生的最新 ID（`lastID`），立刻把這個 ID 當作外鍵，把詳細產地與保存方式同步寫入這兩張子表，完成 1:1 的關聯。

---

### 📋 四、 多功能查詢與篩選 (SELECT ... JOIN)

#### 1. 三表聯表查詢 (JOIN) 與搜尋、篩選
*   **實際語法**：
    ```sql
    SELECT 
        i.item_id, 
        i.item_name AS 藏品名稱, 
        i.category,
        i.leaf_count AS 葉數, 
        i.image_url, 
        o.city AS 城市, 
        o.place_name AS 採集地點, 
        p.storage_method AS 保存方式, 
        p.condition AS 目前狀態
    FROM Clover_Items i
    JOIN Origins o ON i.item_id = o.item_id
    JOIN Preservation p ON i.item_id = p.item_id
    WHERE 1=1
      AND (i.item_name LIKE ? OR o.city LIKE ? OR ...)
      AND i.category = ?
    ORDER BY i.item_id DESC;
    ```
*   **白話邏輯**：
    *   **JOIN 聯表**：將分散在三張表的資料，像拼圖一樣透過相同的 `item_id` 黏成一張大表。
    *   **LIKE 模糊搜尋**：只要使用者在關鍵字搜尋框輸入任何字，系統會去比對名稱、城市、地點或保存狀態，有沾到邊的（用 `%關鍵字%`）全部挑出來。
    *   **ORDER BY DESC**：按照藏品編號倒序排列，確保最新登記的幸運草會出現在照片牆的最前面。

---

### 📋 五、 數據統計分析 (COUNT & AVG & GROUP BY)

#### 1. 各地區藏品統計與平均葉數計算
*   **實際語法**：
    ```sql
    SELECT 
        o.city AS 城市, 
        COUNT(i.item_id) AS 總數量, 
        ROUND(AVG(i.leaf_count), 1) AS 平均葉數
    FROM Clover_Items i
    JOIN Origins o ON i.item_id = o.item_id
    GROUP BY o.city;
    ```
*   **白話邏輯**：
    *   **GROUP BY 分組**：把所有藏品資料按照「採集城市」分門別類（台北歸台北、台中歸台中）。
    *   **COUNT 計算總數**：統計每個城市裡總共收集了幾顆幸運草。
    *   **AVG 平均數**：算出每個城市採集到的幸運草平均是幾片葉子。
    *   **ROUND 四捨五入**：使用 `ROUND(..., 1)`，將計算出來的平均葉數自動四捨五入到小數點後第一位，保持數據整潔美觀。

---

### 📋 六、 今日幸運抽卡 (RANDOM & LIMIT)

#### 1. 隨機抽取一張卡片
*   **實際語法**：
    ```sql
    SELECT i.item_id, i.item_name, i.category, i.leaf_count, i.image_url, o.city, o.place_name
    FROM Clover_Items i
    JOIN Origins o ON i.item_id = o.item_id
    ORDER BY RANDOM() 
    LIMIT 1;
    ```
*   **白話邏輯**：
    *   **ORDER BY RANDOM() 隨機洗牌**：每次前端請求時，叫資料庫把所有藏品卡片像撲克牌一樣打亂重新洗牌。
    *   **LIMIT 1 限制一張**：洗牌完後，只抽出排列在最上方的那「第一張卡片」回傳，實現首頁的「幸運抽卡」功能。

---

### 📋 七、 安全刪除資料 (DELETE)

#### 1. 聯級刪除藏品資料
*   **實際語法**：
    ```sql
    DELETE FROM Clover_Items WHERE item_id = ?;
    ```
*   **白話邏輯**：刪除指令非常簡單。後端只需要下達指令刪除主表（Clover_Items）中特定的 `item_id`，由於我們先前設定了 `ON DELETE CASCADE`，資料庫底層會自動出擊，把產地表與保存表中，屬於該 ID 的記錄一次清空！
