import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SchedulerConfig, SchedulerResponse, SchedulerStatus, StopSchedulerResponse } from '../models/scheduler.model';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  startScheduler(config: SchedulerConfig): Observable<SchedulerResponse> {
    return this.http.post<SchedulerResponse>(`${this.baseUrl}/msad/reports/scheduler/start`, config)
      .pipe(
        catchError(error => {
          console.error('Error starting scheduler:', error);
          return throwError(() => error);
        })
      );
  }

  stopScheduler(clientId: string): Observable<StopSchedulerResponse> {
    return this.http.post<StopSchedulerResponse>(`${this.baseUrl}/msad/reports/scheduler/stop`, { client_id: clientId })
      .pipe(
        catchError(error => {
          console.error('Error stopping scheduler:', error);
          return throwError(() => error);
        })
      );
  }

  getSchedulerStatus(clientId: string): Observable<SchedulerStatus> {
    let params = new HttpParams().set('client_id', clientId);
    
    return this.http.get<SchedulerStatus>(`${this.baseUrl}/msad/reports/scheduler/status`, { params })
      .pipe(
        catchError(error => {
          console.error('Error getting scheduler status:', error);
          return throwError(() => error);
        })
      );
  }
} 