import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface ReportRequest {
  start_date: string;
  end_date: string;
  data_type?: string;
  format?: string;
}

export interface ReportResponse {
  success: boolean;
  client_id?: string;
  created_at?: string;
  data_type?: string;
  download_url?: string;
  filename?: string;
  format?: string;
  period?: {
    start: string;
    end: string;
  };
  records?: number;
  report_id?: string;
  size?: number;
  error?: string;
}

export interface ReportListResponse {
  success: boolean;
  reports?: Array<{
    report_id: string;
    client_id: string;
    data_type: string;
    filename: string;
    format: string;
    size: number;
    created_at: string;
    download_url: string;
  }>;
  total?: number;
  error?: string;
}

export interface TestDataRequest {
  client_id?: string;
  count?: number;
}

export interface ServiceStatusResponse {
  success: boolean;
  service?: string;
  version?: string;
  status?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MsadService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // Get MSAD service status
  getServiceStatus(): Observable<ServiceStatusResponse> {
    return this.http.get<ServiceStatusResponse>(`${this.baseUrl}/msad/status`)
      .pipe(
        catchError(error => {
          console.error('Error getting MSAD service status:', error);
          return throwError(() => error);
        })
      );
  }

  // Create test data
  createTestData(data: TestDataRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/msad/test-data`, data)
      .pipe(
        catchError(error => {
          console.error('Error creating test data:', error);
          return throwError(() => error);
        })
      );
  }

  // Generate a report
  generateReport(clientId: string, reportData: ReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.baseUrl}/clients/${clientId}/msad/reports`, reportData)
      .pipe(
        catchError(error => {
          console.error('Error generating report:', error);
          return throwError(() => error);
        })
      );
  }

  // List reports for a specific client
  getClientReports(clientId: string, format?: string, dataType?: string): Observable<ReportListResponse> {
    let params = new HttpParams();
    if (format) params = params.set('format', format);
    if (dataType) params = params.set('data_type', dataType);

    return this.http.get<ReportListResponse>(`${this.baseUrl}/clients/${clientId}/msad/reports`, { params })
      .pipe(
        catchError(error => {
          console.error('Error getting client reports:', error);
          return throwError(() => error);
        })
      );
  }

  // List all reports for all clients
  getAllReports(format?: string, dataType?: string): Observable<ReportListResponse> {
    let params = new HttpParams();
    if (format) params = params.set('format', format);
    if (dataType) params = params.set('data_type', dataType);

    return this.http.get<ReportListResponse>(`${this.baseUrl}/msad/reports`, { params })
      .pipe(
        catchError(error => {
          console.error('Error getting all reports:', error);
          return throwError(() => error);
        })
      );
  }

  // Get download URL for a report
  getReportDownloadUrl(clientId: string, filename: string): string {
    return `${this.baseUrl}/clients/${clientId}/msad/reports/download/${filename}`;
  }

  // Delete a report
  deleteReport(clientId: string, reportId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clients/${clientId}/msad/reports/${reportId}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting report:', error);
          return throwError(() => error);
        })
      );
  }
}