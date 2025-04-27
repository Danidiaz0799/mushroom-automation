import { SchedulerStatus } from './scheduler-status.model';

export interface ConfigureSchedulerResponse {
  success: boolean;
  message: string;
  status: SchedulerStatus; // Contains the updated status after configuration
} 