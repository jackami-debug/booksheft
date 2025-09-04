# Supabase 設定指南

## 1. 獲取 Supabase API 金鑰

1. 前往您的 Supabase 專案儀表板：https://wyvjqhkgcyicrlsdbxvd.supabase.co
2. 點擊左側選單的 "Settings" > "API"
3. 複製 "anon public" 金鑰

## 2. 設定環境變數

建立 `.env` 檔案在專案根目錄：

```env
VITE_SUPABASE_URL=https://wyvjqhkgcyicrlsdbxvd.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## 3. 設定資料庫

1. 前往 Supabase 儀表板的 "SQL Editor"
2. 執行 `database-setup.sql` 檔案中的 SQL 指令來建立表格和範例資料

## 4. 測試應用程式

執行以下指令來啟動開發伺服器：

```bash
npm run dev
```

## 功能說明

- ✅ 從 Supabase 載入書籍資料
- ✅ 新增書籍到資料庫
- ✅ 更新書籍評分
- ✅ 刪除書籍
- ✅ 錯誤處理和載入狀態
- ✅ 即時搜尋和篩選

## 資料庫結構

`books` 表格包含以下欄位：
- `id`: 主鍵 (自動遞增)
- `title`: 書名 (必填)
- `author`: 作者 (必填)
- `cover`: 封面圖片 URL
- `status`: 閱讀狀態 (Reading/Finished/Wishlist)
- `rating`: 評分 (0-5)
- `created_at`: 建立時間
- `updated_at`: 更新時間
