import { Component , Input, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-table',
  imports: [ChartModule,CommonModule, TableModule ,ButtonModule ,MultiSelectModule,FormsModule],
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
  // getEmployeeRowspan(emp: any): number {
  //   return emp.projects.reduce((total: number, project: { billingDetails: any[] }) =>     // function for merging rows of based on employee and project 
  //     total + project.billingDetails.length, 0);
  // }

  flattenData(data: any[]): any[] {
    const flatData: any[] = [];
    data.forEach(emp => {
      emp.projects.forEach((proj: any) => {
        proj.billingDetails.forEach((detail: any) => {
          flatData.push({
            employee: emp.employee,
            project: proj.project,
            billing_status: detail.billing_status,
            total_hours: detail.total_hours
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
      item.employee.toLowerCase().includes(searchValue) ||
      item.project.toLowerCase().includes(searchValue) ||
      item.billing_status.toLowerCase().includes(searchValue) ||
      item.total_hours.toString().toLowerCase().includes(searchValue)
    );
  
    this.displayedData  = this.groupFilteredData(filteredFlatData);
  }
  groupFilteredData(filteredData: any[]) {
    const result: { [employee: string]: { [project: string]: { billing_status: string, total_hours: number }[] } } = {};
  
    filteredData.forEach(entry => {
      const { employee, project, billing_status, total_hours } = entry;
  
      if (!result[employee]) {
        result[employee] = {};
      }
  
      if (!result[employee][project]) {
        result[employee][project] = [];
      }
  
      result[employee][project].push({ billing_status, total_hours });
    });
  
    return Object.entries(result).map(([employee, projects]) => ({
      employee,
      projects: Object.entries(projects).map(([project, details]) => ({
        project,
        billingDetails: details
      }))
    }));
  }
}

