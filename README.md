# 🍀 CLOVER MUSEUM 幸運草智慧典藏博物館 PRO 🍀

這是一套為幸運草實體標本與珍貴週邊打造的數位化典藏平台。系統基於全端（Full-Stack）架構開發，導入關聯式資料庫設計，實踐結構化數據編目與即時影像檔案傳輸。

## 🚀 系統核心亮點
- **全端架構整合**：前端採用不依賴框架的原生 JavaScript 進行動態 DOM 渲染；後端基於 Node.js Express 搭建 RESTful API。
- **資料庫設計深度**：整合 SQLite 進行多表關聯（`JOIN`）查詢，並實作外鍵級聯刪除（`ON DELETE CASCADE`）確保資料一致性。
- **大數據即時聚合**：後台利用 `GROUP BY` 與 `AVG` 進行即時館藏大數據運算，實踐商業智慧（BI）數據方塊。
- **多維度動態篩選**：支援 SQL `LIKE` 模糊搜尋與即時類別條件交集過濾。

## 📸 系統運行截圖
<img width="1358" height="762" alt="螢幕截圖 2026-05-24 下午12 15 10" src="https://github.com/user-attachments/assets/270636c5-e296-4828-ae03-b4c8cd701833" />
