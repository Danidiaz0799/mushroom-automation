import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActuatorService {
  private baseUrl = `${environment.apiUrl}/api/clients`;

  constructor(private http: HttpClient) { }

  lightControl(clientId: string, state: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${clientId}/Actuator/toggle_light`, { state });
  }

  fanControl(clientId: string, state: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${clientId}/Actuator/toggle_fan`, { state });
  }

  humidifierControl(clientId: string, state: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${clientId}/Actuator/toggle_humidifier`, { state });
  }

  motorControl(clientId: string, state: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${clientId}/Actuator/toggle_motor`, { state });
  }

  //Endpoint /IdealParams
  getIdealParams(clientId: string, param_type: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${clientId}/IdealParams/${param_type}`);
  }

  putIdealParams(clientId: string, param_type: string, obj: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${clientId}/IdealParams/${param_type}`, obj);
  }
}
