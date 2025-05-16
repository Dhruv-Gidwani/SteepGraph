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

  fetchtimeSheetItem(startDate: string, endDate: string,department: string,project:string,positionTitle:string,geography:string,emp_name:string): Observable<string> {
    const token = sessionStorage.getItem('access_token');
    // const Name = "sg_work_contract_tgv";
  const formattedStart = `${startDate}T00:00:00`;
  const formattedEnd = `${endDate}T00:00:00`;
  console.log("formattedStart", formattedStart);
  console.log("formattedEnd", formattedEnd);
  console.log("department", department);
  console.log("project", project);
  console.log("positionTitle", positionTitle);
  console.log("geography", geography);
  console.log("emp_name", emp_name);
  
  let filters = `
    <sg_ts_date condition="le">${formattedEnd}</sg_ts_date>
    <sg_ts_date condition="ge">${formattedStart}</sg_ts_date>
  `;

  if (department) {
    filters += `
      <sg_employee_department>
        <Item type="sg_Department" action="get">
          <keyed_name condition="eq">${department}</keyed_name>
        </Item>
      </sg_employee_department>
    `;
  }

  if (positionTitle) {
    filters += `
      <sg_position_title>
        <Item type="sg_position_title" action="get">
          <keyed_name condition="eq">${positionTitle}</keyed_name>
        </Item>
      </sg_position_title>
    `;
  }

  if (geography) {
    filters += `<sg_geography condition="eq">${geography}</sg_geography>`;
  }

  if (project) {
    filters += `
      <sg_ts_task_project>
        <Item type="Project" action="get">
          <keyed_name condition="eq">${project}</keyed_name>
        </Item>
      </sg_ts_task_project>
    `;
  }

  if (emp_name) {
    filters += `
      <sg_employee>
        <Item type="User" action="get">
          <keyed_name condition="eq">${emp_name}</keyed_name>
        </Item>
      </sg_employee>
    `;
  }
  

 const aml = `<AML>
    <Item type="sg_timesheet" action="get">
      ${filters}
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
