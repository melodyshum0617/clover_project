import sqlite3
import os

db_path = "/Users/melodyshum/Desktop/clover_project/clover.db"

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 執行進階一鍵修正舊資料邏輯
    # 1. 包含「購入」或「市集」或「Loft」 ➔ 實體店購入
    cursor.execute("""
        UPDATE Origins 
        SET method = '實體店購入' 
        WHERE place_name LIKE '%購入%' 
           OR place_name LIKE '%市集%' 
           OR place_name LIKE '%Loft%'
           OR place_name LIKE '%法雅客%'
           OR place_name LIKE '%專賣店%';
    """)
    
    # 2. 包含「伴手禮」或「製作」或「贈送」 ➔ 他人贈送
    cursor.execute("""
        UPDATE Origins 
        SET method = '他人贈送' 
        WHERE place_name LIKE '%伴手禮%' 
           OR place_name LIKE '%製作%' 
           OR place_name LIKE '%贈送%';
    """)
    
    # 3. 包含「蝦皮」或「線上」或「購買」➔ 線上購買 (如果不包含市集和購入)
    cursor.execute("""
        UPDATE Origins 
        SET method = '線上購買' 
        WHERE (place_name LIKE '%購買%' OR place_name LIKE '%蝦皮%' OR place_name LIKE '%線上%')
          AND place_name NOT LIKE '%市集%'
          AND place_name NOT LIKE '%展覽%';
    """)
    
    conn.commit()
    rows_affected = cursor.rowcount
    conn.close()
    print(f"Database successfully updated. Last operation affected {rows_affected} rows.")
else:
    print("Database file not found.")
