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
        const exportData: any[] = [];

        projectTableData.forEach(emp => {
            emp.projects.forEach((proj: any) => {
              console.log('Project name:', proj.project);
              proj.billingDetails.forEach((detail:any) => {
                exportData.push({
                  'Employee': emp.employee,
                  'Position Title': emp.sg_position_title,
                  'Department':emp.sg_employee_department,
                  'Project': proj.project,
                  'Geography': emp.sg_geography,
                  'Role': detail.sg_role,
                  'Billing Status': detail.billing_status,
                  'Total TimeSheet Fill Hrs.': detail.total_ts_fill_hrs,
                  'Total Billable Hrs. (Company)': detail.total_billable_hr_company,
                  'Total Billable Hrs. (person)': detail.total_hours,
                  'Total Non-Billable Hrs.': detail.total_non_billable_hr,
                  'Company Billability %': proj.company_billability,
                  'Person Billability %': proj.person_billability
                });
              });
            });
          });

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
