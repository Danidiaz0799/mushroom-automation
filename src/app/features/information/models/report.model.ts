export interface Report {
  report_id: string;
  client_id: string;
  data_type: string;
  filename: string;
  format?: string;
  size: number;
  created_at: string;
  download_url: string;
  start_date?: string;
  end_date?: string;
  records?: number;
}

export interface ReportListResponse {
  success: boolean;
  reports?: Report[];
  total?: number;
  error?: string;
}

export interface ReportRequest {
  start_date: string;
  end_date: string;
  data_type?: string;
  format?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  message?: string;
  error?: string;
  filename?: string;
  records?: number;
  size?: number;
  download_url?: string;
}

export interface DeleteReportResponse {
  success: boolean;
  message?: string;
  error?: string;
  report_id?: string;
  filename?: string;
  client_id?: string;
} 