import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dht11Url = `${environment.apiUrl}/DhtSensor`;
  private bmp280Url = `${environment.apiUrl}/Bmp280Sensor`;
  private gy302Url = `${environment.apiUrl}/Gy302Sensor`;
  private eventsUrl = `${environment.apiUrl}/Event`;
  private actuatorsUrl = `${environment.apiUrl}/Actuator`;

  constructor(private http: HttpClient) { }

  getDht11Data(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.dht11Url}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      map(data => data.map((item: any) => ({ humidity: item.humidity, timestamp: item.timestamp }))),
      catchError(this.handleError)
    );
  }

  getBmp280Data(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.bmp280Url}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
      map(data => data.map((item: any) => ({ temperature: item.temperature, timestamp: item.timestamp }))),
      catchError(this.handleError)
    );
  }

  getGy302Data(page: number, pageSize: number, showSpinner: boolean = true): Observable<any> {
    const headers = new HttpHeaders().set('X-Show-Spinner', showSpinner ? 'true' : 'false');
    return this.http.get<any>(`${this.gy302Url}?page=${page}&pageSize=${pageSize}`, { headers }).pipe(
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
