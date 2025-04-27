export interface Backup {
  backup_id: string;
  filename: string;
  type: 'manual' | 'auto';
  size: number;
  created_at: string; // ISO date string
  download_url: string;
} 