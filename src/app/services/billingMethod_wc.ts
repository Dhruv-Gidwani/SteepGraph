import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class billingMethodWCService {
  private baseUrl = environment.apiUrl; // Use the environment variable for the base URL
  
  constructor(private http: HttpClient) {}

  fetchBillingItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(this.baseUrl+"/Server/odata/List('DC460E07658F4BCEB857C183EA490081')/Value?$select=value,label",  {
      headers,
      responseType: 'text'
    });
  }
  
}
