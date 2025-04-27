import { Backup } from './backup.model';

export interface BackupListResponse {
  success: boolean;
  backups: Backup[];
  total: number;
} 