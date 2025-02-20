import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActuatorService {
  private actuatorsUrl = `${environment.apiUrl}/Actuator`;

  constructor(private http: HttpClient) { }

  toggleActuator(actuatorName: string, state: boolean): Observable<any> {
    return this.http.post<any>(`${this.actuatorsUrl}/toggle`, { name: actuatorName, state });
  }
}
