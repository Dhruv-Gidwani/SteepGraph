import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private baseUrl = 'http://192.168.0.230/QAEnvironment';
  // private arasUrl = 'http://192.168.0.230/QAEnvironment/Server/odata/method.rb_GetTreeGridData';
  
  constructor(private http: HttpClient) {}

  fetchProjectItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(this.baseUrl+"/Server/odata/Project",  {
      headers,
      responseType: 'text'
    });
  }
  
}
