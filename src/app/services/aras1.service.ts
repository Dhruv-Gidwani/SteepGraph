import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArasService1 {
  private baseUrl = 'http://192.168.0.230/QAEnvironment';
  // private arasUrl = 'http://192.168.0.230/QAEnvironment/Server/odata/method.rb_GetTreeGridData';
  
  constructor(private http: HttpClient) {}

  fetchQBValueItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
  
    const aml = `<AML> <Item type="rb_TreeGridViewDefinition"  id="4B14A4C5DF484F4BBB4C7927FC34A886" action='get' levels="2">
  <Relationships>
  <Item type="rb_QueryDefinitionParameterMap" action='get' select = 'qd_parameter_name,user_input_default_value'>
  </Item>
  </Relationships>
  </Item>
  </AML>`;
  
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
