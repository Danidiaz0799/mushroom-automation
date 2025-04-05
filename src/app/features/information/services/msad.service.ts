import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MsadService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // Obtener el estado general de MSAD
  getMsadStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/msad/status`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estado de MSAD:', error);
          return throwError(() => error);
        })
      );
  }

  // Obtener estado de MSAD para un cliente específico
  getMsadClientStats(clientId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}/msad/stats`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estadísticas MSAD del cliente:', error);
          return throwError(() => error);
        })
      );
  }

  // Solicitar un respaldo manual
  createBackup(): Observable<any> {
    return this.http.post(`${this.baseUrl}/msad/backup`, {})
      .pipe(
        catchError(error => {
          console.error('Error al crear respaldo:', error);
          return throwError(() => error);
        })
      );
  }

  // Reiniciar el servicio MSAD
  restartMsad(): Observable<any> {
    return this.http.post(`${this.baseUrl}/msad/restart`, {})
      .pipe(
        catchError(error => {
          console.error('Error al reiniciar MSAD:', error);
          return throwError(() => error);
        })
      );
  }
} 