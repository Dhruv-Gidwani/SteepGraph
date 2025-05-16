import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl; // Use the environment variable for the base URL
    private apiUrl = this.baseUrl + '/Server/odata/method.rb_GetTreeGridData';
    constructor(private http: HttpClient) {}

    getTreeGridData(tgvdXmlString: string, paramMapString: string): Observable<any> {
        const token = sessionStorage.getItem('access_token');

        const headers = new HttpHeaders({
            'Content-Type': 'application/raw',
            Authorization: `Bearer ${token}`
        });
        const body = {
            startCondition: '{}',
            fetch: '10000',
            row_context_data: '',
            show_more_offset_info: null,
            levels_to_expand: 3,
            include_headers: '1',
            tgvd_item:
            tgvdXmlString,
            qb_parameters_value_by_name:paramMapString
        };
        console.log({body});
        return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
            map((data) => {
                const headers = data?.HeaderResult?.map((header: any) => header.label) ?? [];
                const gridRows = data?.GridRows ?? [];

                const transformed = gridRows.map((row: any) => {
                    const result: Record<string, any> = { Level: '1' };
                    if (Array.isArray(row.cells)) {
                        row.cells.forEach((cell: any, index: number) => {
                            const key = headers[index] ?? `Unknown_${index}`;
                            result[key] = cell?.value ?? null;
                        });
                    }
                    return result;
                });

                return transformed;
            })
        );
    }
}
