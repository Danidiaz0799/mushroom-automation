import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  register(user: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, user);
  }

  getClients(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients`);
  }

  getClientDetails(clientId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients/${clientId}`);
  }

  updateClientStatus(clientId: string, status: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/clients/${clientId}/status`, status);
  }

  registerClient(client: { client_id: string; name: string; description: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/clients`, client);
  }
}