export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          created_at?: string
          created_by?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_at?: string
          created_by?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id?: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
    }
  }
}