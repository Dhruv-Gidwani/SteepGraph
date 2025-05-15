import { Component, Input, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-project-table',
    imports: [ChartModule, CommonModule, TableModule, ButtonModule, MultiSelectModule, FormsModule],
    templateUrl: './project-table.component.html',
    styleUrl: './project-table.component.scss'
})
export class ProjectTableComponent implements OnInit {
    @Input() projectTableData: any[] = [];
    @Input() customSort!: (event: any) => void;
    @Input() exportData!: () => void;
    searchValue: string | undefined;
    representativeNames: string[] = [];
    displayedData: any[] = [];

    ngOnInit() {
        this.displayedData = this.projectTableData;
    }

  flattenData(data: any[]): any[] {
    const flatData: any[] = [];
    data.forEach(emp => {
      emp.projects.forEach((proj: any) => {
        proj.billingDetails.forEach((detail: any) => {
          flatData.push({
          employee: emp.employee,
          sg_position_title: emp.sg_position_title,
          sg_employee_department: emp.sg_employee_department,
          sg_geography: emp.sg_geography,
          project: proj.project,
          Project_Is_Billable: "Yes" ,
          company_billability: proj.company_billability,
          person_billability: proj.person_billability,
          sg_role: detail.sg_role,
          billing_status: detail.billing_status,
          total_ts_fill_hrs: detail.total_ts_fill_hrs,
          total_billable_hr_company: detail.total_billable_hr_company,
          total_hours: detail.total_hours,
          total_non_billable_hr: detail.total_non_billable_hr
          });
        });
      });
    });
    console.log('Flat data:', flatData); // Debugging line
    return flatData;
  }
  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.toLowerCase();
    this.searchValue = searchValue;
    const flatData = this.flattenData(this.projectTableData);
  
    const filteredFlatData = flatData.filter(item =>
      // item.employee.toLowerCase().includes(searchValue) ||
      // item.project.toLowerCase().includes(searchValue) ||
      // item.billing_status.toLowerCase().includes(searchValue) ||
      // item.total_hours.toString().toLowerCase().includes(searchValue)
      Object.values(item).some(val =>
      val?.toString().toLowerCase().includes(searchValue)
    )
    );
  
    this.displayedData  = this.groupFilteredData(filteredFlatData);
  }
  // groupFilteredData(filteredData: any[]) {
  //   const result: { [employee: string]: { [project: string]: { billing_status: string, total_hours: number }[] } } = {};
  
  //   filteredData.forEach(entry => {
  //     const { employee, project, billing_status, total_hours } = entry;
  
  //     if (!result[employee]) {
  //       result[employee] = {};
  //     }
  
  //     if (!result[employee][project]) {
  //       result[employee][project] = [];
  //     }
  
  //     result[employee][project].push({ billing_status, total_hours });
  //   });
  
  //   return Object.entries(result).map(([employee, projects]) => ({
  //     employee,
  //     projects: Object.entries(projects).map(([project, details]) => ({
  //       project,
  //       billingDetails: details
  //     }))
  //   }));
  // }
  groupFilteredData(filteredData: any[]) {
  const grouped: any = {};

  filteredData.forEach(entry => {
    const empKey = entry.employee + '-' + entry.sg_position_title + '-' + entry.sg_employee_department + '-' + entry.sg_geography;

    if (!grouped[empKey]) {
      grouped[empKey] = {
        employee: entry.employee,
        sg_position_title: entry.sg_position_title,
        sg_employee_department: entry.sg_employee_department,
        sg_geography: entry.sg_geography,
        projects: {}
      };
    }

    if (!grouped[empKey].projects[entry.project]) {
      grouped[empKey].projects[entry.project] = {
        project: entry.project,
        company_billability: entry.company_billability,
        person_billability: entry.person_billability,
        billingDetails: []
      };
    }

    grouped[empKey].projects[entry.project].billingDetails.push({
      sg_role: entry.sg_role,
      billing_status: entry.billing_status,
      total_ts_fill_hrs: entry.total_ts_fill_hrs,
      total_billable_hr_company: entry.total_billable_hr_company,
      total_hours: entry.total_hours,
      total_non_billable_hr: entry.total_non_billable_hr
    });
  });

  // Convert back to array format
  return Object.values(grouped).map((emp: any) => ({
    employee: emp.employee,
    sg_position_title: emp.sg_position_title,
    sg_employee_department: emp.sg_employee_department,
    sg_geography: emp.sg_geography,
    projects: Object.values(emp.projects)
  }));
}

}



