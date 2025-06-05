import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class timeSheetService {
    private baseUrl = environment.apiUrl; // Use the environment variable for the base URL

    constructor(private http: HttpClient) {}
    //project:string[]
    fetchtimeSheetItem(startDate: string, endDate: string, emp_department: string[], positionTitle: string[], pro_department:string[], geography: string[], emp_name: string[]): Observable<string> {
        const token = sessionStorage.getItem('access_token');
        // const Name = "sg_work_contract_tgv";
        const formattedStart = `${startDate}T00:00:00`;
        const formattedEnd = `${endDate}T00:00:00`;
        console.log(positionTitle);
        let filters = `
    <sg_ts_date condition="le">${formattedEnd}</sg_ts_date>
    <sg_ts_date condition="ge">${formattedStart}</sg_ts_date>
  `;

        if (emp_department && emp_department.length > 0) {
            filters += `
    
      <or>`;

            for (const dept of emp_department) {
                filters += `
       <sg_employee_department>
        <Item type="sg_Department" action="get">
          <keyed_name condition="eq">${dept}</keyed_name>
        </Item>
      </sg_employee_department>
    `;
            }

            filters += `
      </or>
    `;
        }

        if (positionTitle && positionTitle.length > 0) {
            filters += `
    
      <or>`;

            for (const title of positionTitle) {
                filters += `
      <sg_position_title>
        <Item type="sg_position_title" action="get">
          <keyed_name condition="eq">${title}</keyed_name>
        </Item>
        </sg_position_title>`;
            }

            filters += `
      </or>
    `;
        }

        //3/6/25
        if (pro_department && pro_department.length > 0) {
            filters += `
    
      <or>`;

            for (const dept of pro_department) {
                filters += `
       <sg_department>
        <Item type="sg_Department" action="get">
          <keyed_name condition="eq">${dept}</keyed_name>
        </Item>
      </sg_department>
    `;
            }

            filters += `
      </or>
    `;
        }

        if (geography && geography.length > 0) {
            filters += `
    
      <or>`;

            for (const geo of geography) {
                filters += `<sg_geography condition="eq">${geo}</sg_geography>`;
            }

            filters += `
      </or>
    `;
        }

        if (emp_name && emp_name.length > 0) {
            filters += `
    
      <or>`;

            for (const emp of emp_name) {
                filters += `
      <sg_employee>
        <Item type="User" action="get">
           <keyed_name condition="eq">${emp}</keyed_name>
        </Item>
       </sg_employee>
    `;
            }

            filters += `
      </or>
    `;
        }

        const aml = `<AML>
    <Item type="sg_timesheet" action="get">
      ${filters}
      <sg_ts_activity_type condition="ne">Holiday</sg_ts_activity_type>
      <sg_ts_activity_type condition="ne">ClientHoliday</sg_ts_activity_type>
    </Item>
  </AML>`;

        const headers = new HttpHeaders({
            'Content-Type': 'application/xml',
            SOAPAction: 'ApplyAML',
            Authorization: `Bearer ${token}`
        });

        return this.http.post(this.baseUrl + '/Server/InnovatorServer.aspx', aml, {
            headers,
            responseType: 'text'
        });
    }
}
