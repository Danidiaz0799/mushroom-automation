export interface CreateBackupResponse {
  success: boolean;
  backup_id: string;
  filename: string;
  path: string; // Server-side path, might not be directly useful in frontend
  size: number;
  type: 'manual';
  created_at: string;
  download_url: string;
} 