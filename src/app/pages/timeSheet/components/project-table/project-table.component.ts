import { Component, Input, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-table',
  standalone: true,
  imports: [ChartModule, CommonModule, TableModule, ButtonModule, MultiSelectModule, FormsModule],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.scss'
})
export class ProjectTableComponent implements OnInit {
  @Input() projectTableData: any[] = [];
  @Input() customSort!: (event: any) => void;
  @Input() exportData!: () => void;

  searchValue: string | undefined;
  flatData: any[] = [];

  ngOnInit() {
    this.flatData = this.flattenData(this.projectTableData);
  }

  // Convert nested structure into flat array
  flattenData(data: any[]): any[] {
    const flatData: any[] = [];

    data.forEach(emp => {
      emp.projects.forEach((proj: any) => {
        proj.billingDetails.forEach((detail: any, index: number) => {
          flatData.push({
            employee: emp.employee,
            sg_position_title: emp.sg_position_title,
            sg_employee_department: emp.sg_employee_department,
            sg_geography: emp.sg_geography,
            project: proj.project,
            sg_role: detail.sg_role,
            billing_status: detail.billing_status,
            total_ts_fill_hrs: detail.total_ts_fill_hrs,
            total_billable_hr_company: detail.total_billable_hr_company,
            total_hours: detail.total_hours,
            total_non_billable_hr: detail.total_non_billable_hr,
            company_billability:  proj.company_billability ,
            person_billability:  proj.person_billability 
          });
        });
      });
    });

    return flatData;
  }

  // Handle global search
  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value.toLowerCase();
    this.searchValue = searchValue;

    const filtered = this.flattenData(this.projectTableData).filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(searchValue)
      )
    );

    this.flatData = filtered;
  }
}


