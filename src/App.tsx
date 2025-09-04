import { useEffect, useMemo, useState } from "react";
import { supabase, Book } from "./lib/supabase";

// 在 App 組件載入時測試環境變數
console.log('🎯 App.tsx 載入 - 測試環境變數:')
console.log('🔍 當前環境:', (import.meta as any).env?.MODE)
console.log('🔍 開發模式:', (import.meta as any).env?.DEV)
console.log('🔍 生產模式:', (import.meta as any).env?.PROD)
console.log('🔍 所有環境變數:', (import.meta as any).env)

// NOTE
// The previous document accidentally contained non-ASCII punctuation in the top-level file
// (e.g. Chinese comma '，'). That causes a SyntaxError in JS/TS files.
// This file is rewritten using only ASCII punctuation in code.
// UI text can still contain Chinese characters because they are inside strings.

// Helper: inline SVG placeholder cover so we avoid any external network requests by default.
function svgPlaceholder(title: string) {
  const safe = encodeURIComponent((title || "Book").slice(0, 18));
  const svg = `<?xml version='1.0' encoding='UTF-8'?>
  <svg xmlns='http://www.w3.org/2000/svg' width='300' height='450'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#e5e7eb'/>
        <stop offset='100%' stop-color='#cbd5e1'/>
      </linearGradient>
    </defs>
    <rect width='300' height='450' rx='12' ry='12' fill='url(#g)'/>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          font-size='20' font-family='Arial, Helvetica, sans-serif' fill='#111827'>${safe}</text>
    <text x='50%' y='80%' dominant-baseline='middle' text-anchor='middle'
          font-size='12' font-family='Arial, Helvetica, sans-serif' fill='#374151'>Bookshelf</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

// Book interface 現在從 supabase.ts 導入

// Pure function so we can test filter logic.
function applyFilter(books: Book[], tab: string, q: string) {
  const term = (q || "").trim().toLowerCase();
  return books
    .filter(b => (tab === "All" ? true : b.status === tab))
    .filter(b => {
      if (!term) return true;
      return (
        (b.title || "").toLowerCase().includes(term) ||
        (b.author || "").toLowerCase().includes(term)
      );
    });
}

export default function BookshelfApp() {
  const [filterTab, setFilterTab] = useState("All");
  const [query, setQuery] = useState("");
  const [allowExternalImages, setAllowExternalImages] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showConnectionAlert, setShowConnectionAlert] = useState(true);

  const [newBook, setNewBook] = useState({ title: "", author: "", cover: "", status: "Wishlist" as const });
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentBookNotes, setCurrentBookNotes] = useState<Book | null>(null);
  const [bookNotes, setBookNotes] = useState<Record<number, string>>({});

  const filteredBooks = useMemo(() => applyFilter(books, filterTab, query), [books, filterTab, query]);

  // 檢查 Supabase 連線狀態
  const checkConnection = async () => {
    try {
      console.log('🔍 開始檢查 Supabase 連線...')
      console.log('🌐 使用的 URL:', (import.meta as any).env?.VITE_SUPABASE_URL || '預設值')
      console.log('🔑 使用的 Key:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? '已設定' : '使用預設值')
      
      setConnectionStatus('checking');
      const { error } = await supabase
        .from('books')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ 連線檢查失敗:', error);
        console.error('❌ 錯誤詳情:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setConnectionStatus('disconnected');
      } else {
        console.log('✅ Supabase 連線成功');
        console.log('✅ 資料庫查詢正常');
        setConnectionStatus('connected');
      }
    } catch (err) {
      console.error('❌ 連線檢查錯誤:', err);
      console.error('❌ 錯誤類型:', typeof err);
      console.error('❌ 錯誤堆疊:', err instanceof Error ? err.stack : '無堆疊資訊');
      setConnectionStatus('disconnected');
    }
  };

  // 從 Supabase 載入書籍
  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('checking');
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setConnectionStatus('disconnected');
        throw error;
      }
      
      setConnectionStatus('connected');
      setBooks(data || []);
    } catch (err) {
      setConnectionStatus('disconnected');
      setError(err instanceof Error ? err.message : '載入書籍時發生錯誤');
      console.error('載入書籍錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  // 新增書籍到 Supabase
  const addBook = async () => {
    if (!newBook.title || !newBook.author) return;
    
    try {
      setError(null);
      const { data, error } = await supabase
        .from('books')
        .insert([{
          title: newBook.title,
          author: newBook.author,
          cover: newBook.cover,
          status: newBook.status,
          rating: 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      setBooks(prev => [data, ...prev]);
      setNewBook({ title: "", author: "", cover: "", status: "Wishlist" });
      setShowAddBookModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增書籍時發生錯誤');
      console.error('新增書籍錯誤:', err);
    }
  };

  // 更新書籍評分
  const setRating = async (id: number, rating: number) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('books')
        .update({ rating })
        .eq('id', id);

      if (error) throw error;
      
      setBooks(prev => prev.map(b => (b.id === id ? { ...b, rating } : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新評分時發生錯誤');
      console.error('更新評分錯誤:', err);
    }
  };

  // 刪除書籍
  const deleteBook = async (id: number) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除書籍時發生錯誤');
      console.error('刪除書籍錯誤:', err);
    }
  };

  // 載入書籍資料
  useEffect(() => {
    // 測試環境變數載入
    console.log('🔄 App useEffect 執行 - 環境變數測試:')
    console.log('🌐 VITE_SUPABASE_URL 在 App 中:', (import.meta as any).env?.VITE_SUPABASE_URL)
    console.log('🔑 VITE_SUPABASE_ANON_KEY 在 App 中:', (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ? '已設定' : '未設定')
    
    // 測試 Supabase 連線
    console.log('🔗 測試 Supabase 連線...')
    console.log('📊 Supabase 客戶端:', supabase)
    
    loadBooks();
  }, []);

  // 編輯書籍功能
  const editBook = (book: Book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const updateBook = async (updatedBook: Book) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('books')
        .update({
          title: updatedBook.title,
          author: updatedBook.author,
          cover: updatedBook.cover,
          status: updatedBook.status,
          rating: updatedBook.rating
        })
        .eq('id', updatedBook.id);

      if (error) throw error;
      
      setBooks(prev => prev.map(b => 
        b.id === updatedBook.id ? { ...b, ...updatedBook } : b
      ));
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新書籍時發生錯誤');
      console.error('更新書籍錯誤:', err);
    }
  };

  // 筆記功能
  const openNotes = (book: Book) => {
    setCurrentBookNotes(book);
    setShowNotesModal(true);
  };

  const saveNotes = (bookId: number, notes: string) => {
    setBookNotes(prev => ({ ...prev, [bookId]: notes }));
  };

  // Lightweight runtime tests using console.assert so we always have test cases.
  useEffect(() => {
    // Test 1: filter by tab
    const sample: Book[] = [
      { id: 1, status: "Reading", title: "A", author: "X", cover: "", rating: 0 },
      { id: 2, status: "Finished", title: "B", author: "Y", cover: "", rating: 0 }
    ];
    const t1 = applyFilter(sample, "Reading", "");
    console.assert(t1.length === 1 && t1[0].status === "Reading", "Test 1 failed: tab filter");

    // Test 2: search by title
    const t2 = applyFilter(sample, "All", "b");
    console.assert(t2.length === 1 && t2[0].title === "B", "Test 2 failed: search by title");

    // Test 3: search by author
    const t3 = applyFilter(sample, "All", "x");
    console.assert(t3.length === 1 && t3[0].author === "X", "Test 3 failed: search by author");
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Reading: "bg-blue-100 text-blue-700",
      Finished: "bg-green-100 text-green-700",
      Wishlist: "bg-yellow-100 text-yellow-700"
    };
    const cls = map[status] || "bg-slate-100 text-slate-700";
    return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{status}</span>;
  };

  const Cover = ({ book }: { book: Book }) => {
    const src = allowExternalImages && book.cover ? book.cover : svgPlaceholder(book.title);
    return (
      <img
        src={src}
        alt={book.title}
        className="h-52 w-full object-cover rounded mb-4"
        onError={(e) => {
          // Fallback to SVG placeholder if external image fails
          e.currentTarget.src = svgPlaceholder(book.title);
        }}
      />
    );
  };

  const Stars = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
      <div className="mt-2 select-none">
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            className="text-lg"
            aria-label={`rate ${s}`}
            onClick={() => onChange(s)}
          >
            {s <= value ? "★" : "☆"}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">📚 我的書架</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'disconnected' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} title={
              connectionStatus === 'connected' ? '資料庫已連線' :
              connectionStatus === 'disconnected' ? '資料庫未連線' :
              '檢查連線中'
            }></div>
            <button
              onClick={checkConnection}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
              title="檢查資料庫連線"
            >
              檢查連線
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="搜尋書名或作者..."
            className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allowExternalImages}
              onChange={(e) => setAllowExternalImages(e.target.checked)}
            />
            允許外部封面
          </label>
          <button
            onClick={() => setShowAddBookModal(true)}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            ➕ 新增書籍
          </button>
        </div>
      </header>

      {/* 錯誤訊息 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>錯誤: {error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            關閉
          </button>
        </div>
      )}

      {/* 載入狀態 */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <p>載入中...</p>
        </div>
      )}

      {/* 資料庫連線狀態提示框 */}
      {showConnectionAlert && (
        <div className={`mb-4 p-4 rounded-lg border ${
          connectionStatus === 'connected' 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : connectionStatus === 'disconnected'
            ? 'bg-red-100 border-red-400 text-red-700'
            : 'bg-yellow-100 border-yellow-400 text-yellow-700'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && <span className="text-green-600">✅</span>}
              {connectionStatus === 'disconnected' && <span className="text-red-600">❌</span>}
              {connectionStatus === 'checking' && <span className="text-yellow-600">🔄</span>}
              <span className="font-medium">
                {connectionStatus === 'connected' && '資料庫連線成功'}
                {connectionStatus === 'disconnected' && '資料庫連線失敗'}
                {connectionStatus === 'checking' && '檢查資料庫連線中...'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === 'disconnected' && (
                <button
                  onClick={checkConnection}
                  className="text-sm underline hover:no-underline"
                >
                  重新連線
                </button>
              )}
              <button
                onClick={() => setShowConnectionAlert(false)}
                className="text-sm underline hover:no-underline"
              >
                關閉
              </button>
            </div>
          </div>
          {connectionStatus === 'connected' && (
            <p className="mt-2 text-sm">您的書架資料已與 Supabase 資料庫同步</p>
          )}
          {connectionStatus === 'disconnected' && (
            <p className="mt-2 text-sm">無法連接到 Supabase 資料庫，請檢查網路連線或 API 金鑰設定</p>
          )}
        </div>
      )}

      <div className="mb-6">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              filterTab === "All" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setFilterTab("All")}
          >
            全部
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              filterTab === "Reading" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setFilterTab("Reading")}
          >
            再讀
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              filterTab === "Finished" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setFilterTab("Finished")}
          >
            已讀
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
              filterTab === "Wishlist" ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200"
            }`}
            onClick={() => setFilterTab("Wishlist")}
          >
            想讀
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div key={book.id} className="rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm hover:shadow-xl transition">
            <div className="p-4 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <Cover book={book} />
                  <h2 className="font-semibold text-lg mb-1">{book.title}</h2>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  {statusBadge(book.status)}
                </div>
                <button
                  onClick={() => deleteBook(book.id)}
                  className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  title="刪除書籍"
                >
                  ✕
                </button>
              </div>
              <Stars value={book.rating || 0} onChange={(r) => setRating(book.id, r)} />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => editBook(book)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  ✏️ 編輯
                </button>
                <button
                  onClick={() => openNotes(book)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                >
                  📝 筆記
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 新增書籍模態框 */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddBookModal(false)}></div>
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新增書籍</h3>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">書名 *</label>
                <input
                  type="text"
                  placeholder="請輸入書名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作者 *</label>
                <input
                  type="text"
                  placeholder="請輸入作者"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面圖片 URL (可留空)</label>
                <input
                  type="text"
                  placeholder="請輸入封面圖片網址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newBook.cover}
                  onChange={(e) => setNewBook({ ...newBook, cover: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newBook.status}
                  onChange={(e) => setNewBook({ ...newBook, status: e.target.value as any })}
                >
                  <option value="Reading">再讀</option>
                  <option value="Finished">已讀</option>
                  <option value="Wishlist">想讀</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addBook}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                新增書籍
              </button>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯書籍模態框 */}
      {showEditModal && editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">編輯書籍</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="書名"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={editingBook.title}
                onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
              />
              <input
                type="text"
                placeholder="作者"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={editingBook.author}
                onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
              />
              <input
                type="text"
                placeholder="封面圖片 URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={editingBook.cover}
                onChange={(e) => setEditingBook({...editingBook, cover: e.target.value})}
              />
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue={editingBook.status}
                onChange={(e) => setEditingBook({...editingBook, status: e.target.value as any})}
              >
                <option value="Reading">再讀</option>
                <option value="Finished">已讀</option>
                <option value="Wishlist">想讀</option>
              </select>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => updateBook(editingBook)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                儲存
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 筆記模態框 */}
      {showNotesModal && currentBookNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowNotesModal(false)}></div>
          <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">筆記 - {currentBookNotes.title}</h3>
            <textarea
              placeholder="輸入您的筆記..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md resize-none"
              defaultValue={bookNotes[currentBookNotes.id] || ''}
              onChange={(e) => saveNotes(currentBookNotes.id, e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                儲存
              </button>
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
