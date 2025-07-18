import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class timeSheetService {
    private baseUrl = environment.apiUrl; // Use the environment variable for the base URL

    constructor(private http: HttpClient) {}
    //project:string[]
    fetchtimeSheetItem(startDate: string, endDate: string, emp_department: string[], positionTitle: string[], pro_department: string[], geography: string[], emp_name: string[], project: string[]): Observable<string> {
        const token = sessionStorage.getItem('access_token');
        const formattedStart = `${startDate}T00:00:00`;
        const formattedEnd = `${endDate}T00:00:00`;
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

        if (project && project.length > 0) {
            filters += `
    
      <or>`;

            for (const proj of project) {
                filters += `
      <sg_ts_task_project>
        <Item type="Project" action="get">
           <keyed_name condition="eq">${proj}</keyed_name>
        </Item>
       </sg_ts_task_project>
    `;
            }

            filters += `
      </or>
    `;
        }

        const aml = `<AML>
    <Item type="sg_timesheet" action="get">
      ${filters}
      
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

    getHolidaysInRange(start: string, end: string): Observable<string[]> {
        const startYear = new Date(start).getFullYear();
        const endYear = new Date(end).getFullYear();
        const yearsToQuery = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

        const aml = `
    <AML>
        ${yearsToQuery
            .map(
                (year) => `
            <Item type='Business Calendar Year' action='get' select='name'>
                <year>${year}</year>
                <Relationships>
                    <Item type='Business Calendar Exception' action='get' select='day_off,dat_date,description' />
                </Relationships>
            </Item>
        `
            )
            .join('')}
    </AML>
`;

        const token = sessionStorage.getItem('access_token');
        const headers = new HttpHeaders({
            'Content-Type': 'application/xml',
            Authorization: `Bearer ${token}`,
            SOAPAction: 'ApplyAML',
            Accept: 'application/json'
        });

        return this.http
            .post(this.baseUrl + '/Server/InnovatorServer.aspx', aml, {
                headers,
                responseType: 'text'
            })
            .pipe(
                map((response) => {
                    console.log('🧾 Raw holidays XML:', response);
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(response, 'application/xml');

                    const holidayItems = xmlDoc.getElementsByTagName('Item');
                    const holidays: string[] = [];

                    Array.from(holidayItems).forEach((item) => {
                        const typeAttr = item.getAttribute('type');
                        if (typeAttr === 'Business Calendar Exception') {
                            const idNode = item.querySelector('id');
                            const keyedName = idNode?.getAttribute('keyed_name');

                            if (keyedName) {
                                const parsedDate = new Date(keyedName); // parses "6/25/2025 6:30:00 PM"
                                const isoDate = parsedDate.toISOString().split('T')[0]; // "2025-06-25"

                                // only include if in range
                                if (isoDate >= start && isoDate <= end) {
                                    holidays.push(isoDate);
                                }
                            }
                        }
                    });

                    console.log('✅ Holidays in given range:', holidays);
                    return holidays;
                })
            );
    }
}
