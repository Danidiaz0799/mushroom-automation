export interface RestoreBackupResponse {
  success: boolean;
  message: string;
  safety_backup: string; // Filename of the safety backup created before restoring
} 