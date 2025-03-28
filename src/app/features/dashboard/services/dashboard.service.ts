import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private sht3xUrl = `${environment.apiUrl}/Sht3xSensor`;
  private sht3xUrlManual = `${environment.apiUrl}/Sht3xSensorManual`;
  private gy302Url = `${environment.apiUrl}/Gy302Sensor`;
  private eventsUrl = `${environment.apiUrl}/Event`;
  private actuatorsUrl = `${environment.apiUrl}/Actuator`;
  private appStateUrl = `${environment.apiUrl}/getState`;
  private appStateUpdateUrl = `${environment.apiUrl}/updateState`;

  constructor(private http: HttpClient) { }

  getSht3xUrlData(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.sht3xUrl}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      map(data => data.map((item: any) => ({ humidity: item.humidity, temperature: item.temperature, timestamp: item.timestamp }))),
      catchError(this.handleError)
    );
  }

  getSht3xUrlDataManual(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.sht3xUrlManual}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      map(data => data.map((item: any) => ({ humidity: item.humidity, temperature: item.temperature, timestamp: item.timestamp }))),
      catchError(this.handleError)
    );
  }

  getGy302Data(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.gy302Url}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      map(data => data.map((item: any) => ({ light_level: item.light_level, timestamp: item.timestamp }))),
      catchError(this.handleError)
    );
  }

  getEvents(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.eventsUrl}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getEventsByTopic(topic: string, page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.eventsUrl}/FilterByTopic?topic=${topic}&page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.eventsUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getActuators(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.actuatorsUrl}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getAppState(): Observable<{ mode: 'automatico' | 'manual' }> {
    return this.http.get<{ mode: 'automatico' | 'manual' }>(this.appStateUrl).pipe(
      catchError(this.handleError)
    );
  }

  updateAppState(mode: 'automatico' | 'manual'): Observable<any> {
    return this.http.put(this.appStateUpdateUrl, { mode }).pipe(
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
