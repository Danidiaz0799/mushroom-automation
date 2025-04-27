export interface SchedulerStatus {
  success: boolean;
  is_running: boolean;
  interval_hours: number;
  backup_count: number;
  total_size: number;
  formatted_size: string;
  last_backup: string | null; // Can be null if never run
  next_backup: string | null; // Can be null if not running or never run
  backup_dir: string;
} 