import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Backup {
  filename: string;
  path: string;
  size: number;
  created_at: string;
  type: string;
}

export interface BackupListResponse {
  success: boolean;
  backups: Backup[];
  error?: string;
}

export interface BackupResponse {
  success: boolean;
  message?: string;
  filename?: string;
  path?: string;
  error?: string;
}

export interface SchedulerStatus {
  is_running: boolean;
  interval_hours: number;
  backup_count?: number;
  total_size?: number;
  formatted_size?: string;
  last_backup?: string;
  next_backup?: string;
  backup_dir?: string;
} // Sincronizado con la respuesta de la API


export interface SchedulerResponse {
  success: boolean;
  status?: SchedulerStatus;
  message?: string;
  error?: string;
}
// También puede venir el estado directo en la raíz según la API, así que se maneja en el método.

export interface SchedulerConfig {
  enabled: boolean;
  interval_hours: number;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // Listar backups
  getBackups(type?: string): Observable<BackupListResponse> {
    // Si no hay tipo especificado o está vacío, obtenemos todos los backups
    if (!type) {
      return this.http.get<BackupListResponse>(`${this.baseUrl}/msad/backups`)
        .pipe(
          catchError(error => {
            console.error('Error al obtener backups:', error);
            return throwError(() => error);
          })
        );
    }
    
    // Si hay un tipo especificado, intentamos filtrar desde el backend
    let params = new HttpParams().set('type', type);
    
    return this.http.get<BackupListResponse>(`${this.baseUrl}/msad/backups`, { params })
      .pipe(
        // En caso de que el backend no soporte el filtrado por tipo o lo implemente diferente,
        // hacemos un filtrado adicional en el cliente
        map(response => {
          if (response.success && response.backups) {
            // Verificamos si ya viene filtrado o hay que filtrarlo manualmente
            const typeLower = type.toLowerCase();
            if (response.backups.length > 0 && 
                response.backups.some(b => b.type && b.type.toLowerCase() !== typeLower)) {
              // Si encontramos backups que no coinciden con el filtro, filtramos manualmente
              const filteredBackups = response.backups.filter(
                b => b.type && b.type.toLowerCase() === typeLower
              );
              console.log('Filtrando manualmente por tipo:', typeLower);
              console.log('Backups originales:', response.backups.length);
              console.log('Backups filtrados:', filteredBackups.length);
              return {
                ...response,
                backups: filteredBackups
              };
            }
          }
          return response;
        }),
        catchError(error => {
          console.error('Error al obtener backups:', error);
          return throwError(() => error);
        })
      );
  }

  // Crear backup manual
  createBackup(): Observable<BackupResponse> {
    return this.http.post<BackupResponse>(`${this.baseUrl}/msad/backups/create`, {})
      .pipe(
        catchError(error => {
          console.error('Error al crear backup:', error);
          return throwError(() => error);
        })
      );
  }

  // Eliminar backup
  deleteBackup(filename: string): Observable<BackupResponse> {
    return this.http.delete<BackupResponse>(`${this.baseUrl}/msad/backups/${filename}`)
      .pipe(
        catchError(error => {
          console.error('Error al eliminar backup:', error);
          return throwError(() => error);
        })
      );
  }

  // Restaurar backup
  restoreBackup(filename: string): Observable<BackupResponse> {
    return this.http.post<BackupResponse>(`${this.baseUrl}/msad/backups/restore/${filename}`, {})
      .pipe(
        catchError(error => {
          console.error('Error al restaurar backup:', error);
          return throwError(() => error);
        })
      );
  }

  // Obtener URL de descarga de backup
  getBackupDownloadUrl(filename: string): string {
    return `${this.baseUrl}/msad/backups/download/${filename}`;
  }

  // Obtener estado del programador
  getSchedulerStatus(): Observable<SchedulerResponse> {
    return this.http.get<any>(`${this.baseUrl}/msad/backups/scheduler`).pipe(
      map((resp) => {
        // Si la respuesta es directa (API real), la adaptamos
        if (resp && resp.success && typeof resp.is_running !== 'undefined') {
          return {
            success: resp.success,
            status: {
              is_running: resp.is_running,
              interval_hours: resp.interval_hours,
              backup_count: resp.backup_count,
              total_size: resp.total_size,
              formatted_size: resp.formatted_size,
              last_backup: resp.last_backup,
              next_backup: resp.next_backup,
              backup_dir: resp.backup_dir
            },
            message: resp.message
          };
        }
        return resp;
      }),
      catchError(error => {
        console.error('Error al obtener estado del programador:', error);
        return of({ success: false, error: 'No se pudo obtener el estado del programador.' });
      })
    );
  }

  // Configurar programador
  configureScheduler(config: SchedulerConfig): Observable<SchedulerResponse> {
    return this.http.post<any>(`${this.baseUrl}/msad/backups/scheduler`, config).pipe(
      map((resp) => {
        // Si la respuesta es directa (API real), la adaptamos
        if (resp && resp.success && resp.status && typeof resp.status.is_running !== 'undefined') {
          return resp;
        } else if (resp && resp.success && typeof resp.is_running !== 'undefined') {
          // A veces el estado viene plano
          return {
            success: resp.success,
            status: {
              is_running: resp.is_running,
              interval_hours: resp.interval_hours,
              backup_count: resp.backup_count,
              total_size: resp.total_size,
              formatted_size: resp.formatted_size,
              last_backup: resp.last_backup,
              next_backup: resp.next_backup,
              backup_dir: resp.backup_dir
            },
            message: resp.message
          };
        }
        return resp;
      }),
      catchError(error => {
        console.error('Error al configurar programador:', error);
        return of({ success: false, error: 'No se pudo configurar el programador.' });
      })
    );
  }

  // Utilidades
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
} 