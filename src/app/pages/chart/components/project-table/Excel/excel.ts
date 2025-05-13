import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Injectable({
    providedIn: 'root'
})
export class ExportService {
    // Function to export data to Excel
    exportToExcel(projectTableData: any[]): void {
        // Flatten rows and format cell values for export
        const exportData = projectTableData.map((row) => ({
            Project: row.Project,
            'Work Contract Name': row['Work Contract Name'],
            'Project Manager': row['Project Manager'],
            'Billing Method': row['Billing Method'],
            'PWO Name': row['PWO Name'],
            'Position Role': row['Position Role'],
            'Resource Name': row['Resource Name'],
            'TS Approver': row['TS Approver'],
            'Position Title': row['Position Title'],
            'Billing Status': row['Billing Status'],
            'Resource Utilization': row['Resource Utilization'],
            'Hourly Rate': row['Hourly Rate'],
            'Currency': row['Currency'],
            'Allocated Hrs.': row['Allocated Hrs.'],
            'Rem. Hrs.': row['Rem. Hrs.'],
            'Start Date': row['Start Date'],
            'End Date': row['End Date'],
            Jan: row.Jan ? row.Jan.day : '',
            Feb: row.Feb ? row.Feb.day : '',
            Mar: row.Mar ? row.Mar.day : '',
            Apr: row.Apr ? row.Apr.day : '',
            May: row.May ? row.May.day : '',
            Jun: row.Jun ? row.Jun.day : '',
            Jul: row.Jul ? row.Jul.day : '',
            Aug: row.Aug ? row.Aug.day : '',
            Sep: row.Sep ? row.Sep.day : '',
            Oct: row.Oct ? row.Oct.day : '',
            Nov: row.Nov ? row.Nov.day : '',
            Dec: row.Dec ? row.Dec.day : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = { Sheets: { Projects: worksheet }, SheetNames: ['Projects'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, 'project_table');
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
        FileSaver.saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
    }
}
