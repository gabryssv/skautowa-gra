// Typy dla bazy danych Supabase
// Generowane na podstawie schematu bazy

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      patrols: {
        Row: {
          id: string;
          name: string;
          color: string;
          current_level: number;
          leader_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color: string;
          current_level?: number;
          leader_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          current_level?: number;
          leader_id?: string | null;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          patrol_id: string;
          name: string;
          tasks_completed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patrol_id: string;
          name: string;
          tasks_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patrol_id?: string;
          name?: string;
          tasks_completed?: number;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          patrol_id: string;
          task_key: string; // np. "l1-t1", "l2-t3"
          current: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patrol_id: string;
          task_key: string;
          current?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patrol_id?: string;
          task_key?: string;
          current?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Pomocnicze typy
export type Patrol = Database['public']['Tables']['patrols']['Row'];
export type PatrolInsert = Database['public']['Tables']['patrols']['Insert'];
export type PatrolUpdate = Database['public']['Tables']['patrols']['Update'];

export type DbMember = Database['public']['Tables']['members']['Row'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type MemberUpdate = Database['public']['Tables']['members']['Update'];

export type DbTask = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
