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
  private gy302Url = `${environment.apiUrl}/Gy302Sensor`;
  private eventsUrl = `${environment.apiUrl}/Event`;
  private actuatorsUrl = `${environment.apiUrl}/Actuator`;

  constructor(private http: HttpClient) { }

  getSht3xUrlData(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.sht3xUrl}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
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

  getActuators(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.actuatorsUrl}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getSensorDataByDateRange(startDate: string, endDate: string, page: number = 1, pageSize: number = 100): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/SensorData?start_date=${startDate}&end_date=${endDate}&page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
