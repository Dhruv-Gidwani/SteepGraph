import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArasService {
  private baseUrl = 'http://192.168.0.230/QAEnvironment';
  // private arasUrl = 'http://192.168.0.230/QAEnvironment/Server/odata/method.rb_GetTreeGridData';
  
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
