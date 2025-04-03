import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private baseUrl = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) { }

  getDashboardStatistics(clientId: string, days: number = 7): Observable<any> {
    return this.http.get(`${this.baseUrl}/${clientId}/statistics/dashboard?days=${days}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estadísticas:', error);
          return throwError(() => error);
        })
      );
  }
}