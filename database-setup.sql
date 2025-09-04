-- 建立書籍表格
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover TEXT DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('Reading', 'Finished', 'Wishlist')),
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);

-- 建立更新時間的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON books 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- 建立政策：允許所有人讀取和寫入（您可以根據需要調整）
CREATE POLICY "Enable all access for all users" ON books
    FOR ALL USING (true) WITH CHECK (true);

-- 插入一些範例資料
INSERT INTO books (title, author, cover, status, rating) VALUES
('原子習慣', 'James Clear', '', 'Reading', 4),
('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', '', 'Wishlist', 0),
('Deep Work', 'Cal Newport', '', 'Finished', 5)
ON CONFLICT DO NOTHING;
