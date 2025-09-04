import { createClient } from '@supabase/supabase-js'

// 詳細的環境變數檢查和 log 輸出
console.log('🚀 開始載入 Supabase 設定...')
console.log('📋 環境變數詳細檢查:')

// 檢查 import.meta.env 物件
console.log('🔍 import.meta.env 物件:', (import.meta as any).env)
console.log('🔍 import.meta.env 類型:', typeof (import.meta as any).env)
console.log('🔍 import.meta.env 的所有鍵:', Object.keys((import.meta as any).env || {}))

// 檢查特定的環境變數
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY

console.log('🌐 VITE_SUPABASE_URL 原始值:', envUrl)
console.log('🌐 VITE_SUPABASE_URL 類型:', typeof envUrl)
console.log('🌐 VITE_SUPABASE_URL 是否為 undefined:', envUrl === undefined)
console.log('🌐 VITE_SUPABASE_URL 是否為 null:', envUrl === null)
console.log('🌐 VITE_SUPABASE_URL 是否為空字串:', envUrl === '')

console.log('🔑 VITE_SUPABASE_ANON_KEY 原始值:', envKey ? '已設定 (長度: ' + envKey.length + ')' : '未設定')
console.log('🔑 VITE_SUPABASE_ANON_KEY 類型:', typeof envKey)
console.log('🔑 VITE_SUPABASE_ANON_KEY 是否為 undefined:', envKey === undefined)
console.log('🔑 VITE_SUPABASE_ANON_KEY 是否為 null:', envKey === null)
console.log('🔑 VITE_SUPABASE_ANON_KEY 是否為空字串:', envKey === '')

// 設定預設值
const supabaseUrl = envUrl || 'https://wyvjqhkgcyicrlsdbxvd.supabase.co'
const supabaseAnonKey = envKey || 

console.log('✅ 最終使用的 supabaseUrl:', supabaseUrl)
console.log('✅ 最終使用的 supabaseAnonKey:', supabaseAnonKey ? '已設定 (長度: ' + supabaseAnonKey.length + ')' : '未設定')

// 檢查是否使用了預設值
if (envUrl) {
  console.log('✅ VITE_SUPABASE_URL 已從 .env 檔案載入')
} else {
  console.log('⚠️ VITE_SUPABASE_URL 使用預設值，請檢查 .env 檔案')
}

if (envKey) {
  console.log('✅ VITE_SUPABASE_ANON_KEY 已從 .env 檔案載入')
} else {
  console.log('⚠️ VITE_SUPABASE_ANON_KEY 使用預設值，請檢查 .env 檔案')
}

// 檢查 API 金鑰格式
if (supabaseAnonKey && supabaseAnonKey.startsWith('eyJ')) {
  console.log('✅ API 金鑰格式正確 (JWT token)')
} else {
  console.log('❌ API 金鑰格式可能有問題')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 書籍資料型別定義
export interface Book {
  id: number
  title: string
  author: string
  cover: string
  status: 'Reading' | 'Finished' | 'Wishlist'
  rating: number
  created_at?: string
  updated_at?: string
}
