export interface SchedulerConfig {
  interval_hours: number;
  client_id: string;
  start_date: string;
  end_date: string;
  data_type: string;
  format: string;
}

export interface SchedulerStatus {
  success: boolean;
  is_running: boolean;
  config?: SchedulerConfig;
  last_run?: string;
  next_run?: string;
  error?: string;
}

export interface SchedulerResponse {
  success: boolean;
  message?: string;
  config?: SchedulerConfig;
  error?: string;
}

export interface StopSchedulerResponse {
  success: boolean;
  message?: string;
  error?: string;
} 