import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ArasService {
  private baseUrl = environment.apiUrl; // Use the environment variable for the base URL
  
  constructor(private http: HttpClient) {}

  fetchTgvdItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
    const Name = "sg_work_contract_tgv";
    const aml = `<AML><Item type="rb_TreeGridViewDefinition" action="get" levels="2"><name condition='eq'>${Name}</name></Item></AML>`;
    
  
    const body = {
      parameters: {
        AML: aml
      }
    };
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/xml',
      "SOAPAction": "ApplyAML",
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(this.baseUrl+"/Server/InnovatorServer.aspx", aml, {
      headers,
      responseType: 'text'
    });
  }
  
}
