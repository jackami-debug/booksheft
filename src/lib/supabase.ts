import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wyvjqhkgcyicrlsdbxvd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

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