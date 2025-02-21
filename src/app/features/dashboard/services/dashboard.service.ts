import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private sensorUrl = `${environment.apiUrl}/DhtSensor`;
  private eventsUrl = `${environment.apiUrl}/Event`;
  private actuatorsUrl = `${environment.apiUrl}/Actuator`;

  constructor(private http: HttpClient) { }

  getSensorData(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.sensorUrl}?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  getEvents(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.eventsUrl}?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  getActuators(page: number, pageSize: number): Observable<any> {
    return this.http.get<any>(`${this.actuatorsUrl}?page=${page}&pageSize=${pageSize}`).pipe(
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
