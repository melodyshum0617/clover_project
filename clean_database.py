import sqlite3
import os

db_path = "/Users/melodyshum/Desktop/clover_project/clover.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 執行一鍵修正舊資料邏輯
    # 1. 蝦皮與購買 ➔ 線上購買
    cursor.execute("UPDATE Origins SET method = '線上購買' WHERE place_name LIKE '%購買%' OR place_name LIKE '%蝦皮%';")
    # 2. 專賣店與法雅客 ➔ 實體店購入
    cursor.execute("UPDATE Origins SET method = '實體店購入' WHERE place_name LIKE '%專賣店%' OR place_name LIKE '%專櫃%' OR place_name LIKE '%法雅客%';")
    # 3. 贈送 ➔ 他人贈送
    cursor.execute("UPDATE Origins SET method = '他人贈送' WHERE place_name LIKE '%贈送%';")
    # 4. 代購 ➔ 其他管道
    cursor.execute("UPDATE Origins SET method = '其他管道' WHERE place_name LIKE '%代購%';")
    # 5. 求得 ➔ 旅途尋獲
    cursor.execute("UPDATE Origins SET method = '旅途尋獲' WHERE place_name LIKE '%求得%';")
    
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    print(f"Database successfully cleaned. Last operation affected {rows_affected} rows.")
else:
    print("Database file not found.")
