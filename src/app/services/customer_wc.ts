import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private baseUrl = environment.apiUrl; // Use the environment variable for the base URL
  
  constructor(private http: HttpClient) {}

  fetchCustomerItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(this.baseUrl+"/Server/odata/sg_lead_accounts",  {
      headers,
      responseType: 'text'
    });
  }
  
}
