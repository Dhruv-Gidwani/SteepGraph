import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = environment.apiUrl; // Use the environment variable for the base URL
  
  constructor(private http: HttpClient) {}

  fetchEmployeeItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(this.baseUrl+"/Server/odata/User?$filter=logon_enabled eq 1",  {
      headers,
      responseType: 'text'
    });
  }
  
}
