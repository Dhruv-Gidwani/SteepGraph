import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private baseUrl = 'http://192.168.0.230/QAEnvironment';
  // private arasUrl = 'http://192.168.0.230/QAEnvironment/Server/odata/method.rb_GetTreeGridData';
  
  constructor(private http: HttpClient) {}

  fetchEmployeeItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(this.baseUrl+"/Server/odata/User",  {
      headers,
      responseType: 'text'
    });
  }
  
}
