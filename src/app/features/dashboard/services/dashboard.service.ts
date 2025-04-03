import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) { }

  getSht3xUrlData(clientId: string, page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.baseUrl}/${clientId}/Sht3xSensor?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      map(data => data.map((item: any) => ({ humidity: item.humidity, temperature: item.temperature, timestamp: item.timestamp }))),
      catchError(this.handleError)
    );
  }

  getSht3xUrlDataManual(clientId: string, page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.baseUrl}/${clientId}/Sht3xSensorManual?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      map(data => data.map((item: any) => ({ humidity: item.humidity, temperature: item.temperature, timestamp: item.timestamp }))),
      catchError(this.handleError)
    );
  }

  getEvents(clientId: string, page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.baseUrl}/${clientId}/Event?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getEventsByTopic(clientId: string, topic: string, page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.baseUrl}/${clientId}/Event/FilterByTopic?topic=${topic}&page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteEvent(clientId: string, id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${clientId}/Event/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createEvent(clientId: string, event: { message: string; topic: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/${clientId}/Event`, event).pipe(
      catchError(this.handleError)
    );
  }

  getActuators(clientId: string, page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.baseUrl}/${clientId}/Actuator?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAppState(clientId: string): Observable<{ mode: 'automatico' | 'manual' }> {
    return this.http.get<{ mode: 'automatico' | 'manual' }>(`${this.baseUrl}/${clientId}/getState`).pipe(
      catchError(this.handleError)
    );
  }

  updateAppState(clientId: string, mode: 'automatico' | 'manual'): Observable<any> {
    return this.http.put(`${this.baseUrl}/${clientId}/updateState`, { mode }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
