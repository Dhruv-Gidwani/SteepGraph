import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ArasService {
  private arasUrl = 'http://SGSLP221.SteepGraph.com/12sp9/Server/odata/method.rb_GetTreeGridData';
  
  constructor(private http: HttpClient) {}

  fetchTgvdItem(): Observable<string> {
    const token = sessionStorage.getItem('access_token');
    const amlQuery = `
      <AML>
<Item type="rb_TreeGridViewDefinition"  id="4B14A4C5DF484F4BBB4C7927FC34A886" action='get' levels="2">
</Item>
</AML>
    `;

    const headers = new HttpHeaders({
      'Content-Type': 'application/raw',
      'Authorization': `Bearer ${token}`
      // Add Authorization header here if needed
    });
    console.log("test" + token);
    return this.http.post(this.arasUrl, amlQuery, {
      headers,
      responseType: 'text',
    });
  }
}
