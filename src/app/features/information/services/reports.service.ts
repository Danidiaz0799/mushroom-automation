import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Report, ReportListResponse, ReportRequest, GenerateReportResponse, DeleteReportResponse } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  generateReport(clientId: string, reportData: ReportRequest): Observable<GenerateReportResponse> {
    return this.http.post<GenerateReportResponse>(`${this.baseUrl}/clients/${clientId}/msad/reports`, reportData)
      .pipe(
        catchError(error => {
          console.error('Error generating report:', error);
          return throwError(() => error);
        })
      );
  }

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

  getReportDownloadUrl(clientId: string, filename: string): string {
    return `${this.baseUrl}/clients/${clientId}/msad/reports/download/${filename}`;
  }

  deleteReport(clientId: string, reportId: string): Observable<DeleteReportResponse> {
    return this.http.delete<DeleteReportResponse>(`${this.baseUrl}/clients/${clientId}/msad/reports/${reportId}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting report:', error);
          return throwError(() => error);
        })
      );
  }
} 