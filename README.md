# 📚 我的書架 - Bookshelf Web App

一個功能完整的書籍管理應用程式，使用 React + TypeScript + Tailwind CSS 建立。

## ✨ 功能特色

### 📖 書籍管理
- **新增書籍**：書名、作者、封面 URL（選填）、狀態（再讀/已讀/想讀）
- **自動封面**：若無封面 → 自動使用內建 SVG placeholder
- **書架展示**：卡片形式，顯示書封、書名、作者、狀態標籤、評分星星

### 🔍 篩選與搜尋
- **狀態篩選**：全部 / 再讀 / 已讀 / 想讀
- **模糊搜尋**：可搜尋書名或作者
- **即時篩選**：使用 `useMemo` 優化效能

### ⚙️ 設定選項
- **外部封面控制**：Checkbox 控制是否允許外部封面
- **失敗處理**：外部封面載入失敗時自動 fallback 到 placeholder

### 🎨 使用者體驗
- **響應式設計**：支援桌機和手機
- **Hover 效果**：卡片 hover 時加陰影效果
- **評分系統**：點擊星星即可更新評分（1-5 星）

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

### 建置生產版本
```bash
npm run build
```

### 預覽生產版本
```bash
npm run preview
```

## 🛠️ 技術架構

- **前端框架**：React 18 + TypeScript
- **樣式框架**：Tailwind CSS
- **UI 組件**：自建 shadcn/ui 風格組件
- **建置工具**：Vite
- **狀態管理**：React Hooks (useState, useMemo)
- **測試**：內建 console.assert 測試

## 📁 專案結構

```
src/
├── components/ui/          # UI 組件庫
│   ├── button.tsx         # 按鈕組件
│   ├── card.tsx           # 卡片組件
│   ├── input.tsx          # 輸入框組件
│   ├── select.tsx         # 選擇器組件
│   └── tabs.tsx           # 標籤頁組件
├── lib/
│   └── utils.ts           # 工具函數
├── App.tsx                # 主要應用程式
├── main.tsx               # 應用程式入口點
└── index.css              # 全域樣式
```

## 🧪 測試功能

應用程式內建了三個基本測試：

1. **標籤篩選測試**：測試狀態篩選功能
2. **標題搜尋測試**：測試書名搜尋功能
3. **作者搜尋測試**：測試作者搜尋功能

測試結果會在瀏覽器 console 中顯示。

## 🎯 效能優化

- **篩選優化**：使用 `useMemo` 避免不必要的重新計算
- **圖片處理**：內建 SVG placeholder 避免外部網路請求
- **狀態管理**：最小化重新渲染

## 🔮 未來擴展

- [ ] localStorage 資料持久化
- [ ] 書籍分類功能
- [ ] 匯入/匯出功能
- [ ] 閱讀進度追蹤
- [ ] 多語言支援

## 📝 開發筆記

- 所有程式碼使用 ASCII 標點符號，避免 SyntaxError
- UI 文字支援中文字符
- 組件設計遵循 React 最佳實踐
- 使用 TypeScript 確保型別安全

---

**開發者**：AI Assistant  
**版本**：1.0.0  
**授權**：MIT

