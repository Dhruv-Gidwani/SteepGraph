import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ApiService } from '../../services/tgv.service';
import { parseString } from 'xml2js';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ExportService } from './components/project-table/Excel/excel';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderComponent } from './components/loader/loader.component';
import { timeSheetService } from '../../services/timeSheet.service';
import{ PositionService } from '../../services/position_title.service';
import { DepartmentService } from '../../services/department.service';
import { ProjectService } from '../../services/project.service';
import { EmployeeService } from '../../services/employee.service';
import{RegionService} from '../../services/region.service';
import * as xmljs from 'xml-js';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { CardModule } from 'primeng/card';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
@Component({
    selector: 'app-timeSheet-demo',
    standalone: true,
    imports: [CommonModule, ChartModule, FluidModule, FormsModule, TableModule, ScrollPanelModule, SplitButtonModule, ButtonModule, ProjectTableComponent, ProgressSpinnerModule, LoaderComponent, PieChartComponent, CardModule, BarChartComponent],
    templateUrl: './timeSheet.html'
})

export class timeSheetDemo  {
    isLoading: boolean = false;
    allContracts: any[] = [];
    filteredContracts: any[] = [];
    selectedProjectData: any[] = [];
    projectTableData: any[] = [];
    rawProjectData: any[] = [];
    selectedProject: string | null = null;
    selectedProjectIndex: number | null = null;
    selectedGeography: string | null = null;
    selectedGeographyIndex: number | null = null;
    selectedDepartment: string | null = null;

    filters = {
        startDate: '',
        endDate: ''
    };

    exportOptions: MenuItem[] | undefined;

    cwoStartDate: string = '';
  cwoEndDate: string = '';
  cwoStatus: string = '';
  startDate!: string;
endDate!: string;
department: string = '';
project: string = '';
positionTitle: string = '';
geography: string = '';
emp_name: string = '';
selectedRole: string = '';
rolesList: string[] = [];
DepartmentList: string[] = [];
ProjectList: string[] = [];
EmployeeList: string[] = [];
RegionList: string[] = [];


    constructor(
        private ApiService: ApiService,
        private cdr: ChangeDetectorRef,
        private exportService: ExportService,
        private timeSheetService: timeSheetService,
        private ngZone: NgZone,
        private PositionService: PositionService,
        private DepartmentService: DepartmentService,
        private ProjectService: ProjectService,
        private EmployeeService: EmployeeService,
        private RegionService: RegionService,
    ) { }

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
    };

ngOnInit(): void {
  this.PositionService.fetchRoleItem().subscribe({
  next: (response) => {
    console.log('Service response:', response);

    // const rolesList: string[] = [];
    let parsedResponse: any = response;

    // If response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return;
      }
    }

    // Loop through the array inside "value" and extract sg_role
    if (parsedResponse && Array.isArray(parsedResponse.value)) {
      for (const item of parsedResponse.value) {
        if (item.keyed_name) {
          this.rolesList.push(item.keyed_name);
        }
      }
    }
     this.rolesList.sort((a, b) => a.localeCompare(b));
    console.log('Extracted sg_role list:', this.rolesList);
  },
  error: (error) => {
    console.error('Error fetching role item:', error);
  }
});

// 2nd service 
this.DepartmentService.fetchDepartmentItem().subscribe({
  next: (response) => {
    console.log('Service response:', response);

    // const rolesList: string[] = [];
    let parsedResponse: any = response;

    // If response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return;
      }
    }

    // Loop through the array inside "value" and extract sg_role
    if (parsedResponse && Array.isArray(parsedResponse.value)) {
      for (const item of parsedResponse.value) {
        if (item.keyed_name) {
          this.DepartmentList.push(item.keyed_name);
        }
      }
    }
     this.DepartmentList.sort((a, b) => a.localeCompare(b));
    console.log('Extracted Department list:', this.DepartmentList);
  },
  error: (error) => {
    console.error('Error fetching role item:', error);
  }
});

// 3rd service
this.ProjectService.fetchProjectItem().subscribe({
  next: (response) => {
    console.log('Service response:', response);

    // const rolesList: string[] = [];
    let parsedResponse: any = response;

    // If response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return;
      }
    }

    // Loop through the array inside "value" and extract sg_role
    if (parsedResponse && Array.isArray(parsedResponse.value)) {
      for (const item of parsedResponse.value) {
        if (item.keyed_name) {
          this.ProjectList.push(item.keyed_name);
        }
      }
    }
     this.ProjectList.sort((a, b) => a.localeCompare(b));
    console.log('Extracted Department list:', this.ProjectList);
  },
  error: (error) => {
    console.error('Error fetching role item:', error);
  }
});

//4th service
 this.EmployeeService.fetchEmployeeItem().subscribe({
  next: (response) => {
    console.log('Service response:', response);

    // const rolesList: string[] = [];
    let parsedResponse: any = response;

    // If response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return;
      }
    }

    // Loop through the array inside "value" and extract sg_role
    if (parsedResponse && Array.isArray(parsedResponse.value)) {
      for (const item of parsedResponse.value) {
        if (item.keyed_name) {
          this.EmployeeList.push(item.keyed_name);
        }
      }
    }
     this.EmployeeList.sort((a, b) => a.localeCompare(b));
    console.log('Extracted sg_role list:', this.EmployeeList);
  },
  error: (error) => {
    console.error('Error fetching role item:', error);
  }
}); 

//5th service 
this.RegionService.fetchRegionItem().subscribe({
  next: (response) => {
    console.log('Service response:', response);

    // const rolesList: string[] = [];
    let parsedResponse: any = response;

    // If response is a string, try to parse it as JSON
    if (typeof response === 'string') {
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return;
      }
    }

    // Loop through the array inside "value" and extract sg_role
    if (parsedResponse && Array.isArray(parsedResponse.value)) {
      for (const item of parsedResponse.value) {
        if (item.value) {
          this.RegionList.push(item.value);
        }
      }
    }
     this.RegionList.sort((a, b) => a.localeCompare(b));
    console.log('Extracted sg_role list:', this.RegionList);
  },
  error: (error) => {
    console.error('Error fetching role item:', error);
  }
});

}
applyFilters(): void {
  if (!this.startDate || !this.endDate) {
    alert('Please select both start and end dates.');
    return;
  }
    this.isLoading = true;
    console.log('Start Date:', this.startDate);
    console.log('End Date:', this.endDate);
    this.timeSheetService.fetchtimeSheetItem(this.startDate, this.endDate,this.department, this.project,this.positionTitle,this.geography,this.emp_name).subscribe({
      next: (xmlData: string) => {
        parseString(xmlData, { explicitArray: false }, (err, result) => {
          if (err) {
            console.error('Error parsing XML', err);
            this.isLoading = false;
            return;
          }
  
          console.log('Parsed result:', result);
          this.ngZone.run(() => {
          const items = result?.['SOAP-ENV:Envelope']?.['SOAP-ENV:Body']?.Result?.Item;
          const flatItems = Array.isArray(items) ? items : [items];
  
          console.log('Raw items:', flatItems);
  
          this.rawProjectData = flatItems
            .filter(item => !!item)
            .map((item: any) => {
              return {
                sg_employee: item?.sg_employee?.$?.keyed_name || 'N/A',
                sg_position_title: item?.sg_position_title?.$?.keyed_name || 'N/A',
                sg_employee_department: item?.sg_employee_department?.$?.keyed_name || 'N/A',
                ts_task_project: item?.sg_ts_task_project?.$?.keyed_name || 'N/A',
                sg_geography: item?.sg_geography || 'N/A',
                sg_role: item?.sg_role || 'N/A',
                billing_status: item?.sg_billing_status || 'N/A',
                billableqty: item?.sg_billableqty || '0',
              };
            });

                        this.groupProjectData(); // Call the grouping function here
                        console.log('raw projectTableData:', this.rawProjectData);
                        console.log('Mapped projectTableData:', this.projectTableData);
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    });
                });
            },
            error: (err) => {
                console.error('Error fetching timesheet data', err);
                this.isLoading = false;
            }
        });
    }

    onGeographySelected(event: { geography: string; index: number }): void {
        this.selectedGeography = event.geography;
        this.selectedGeographyIndex = event.index;
    }

groupProjectData() {
  const result: {
    [employeeKey: string]: {
      employeeMeta: {
        sg_employee: string;
        sg_position_title: string;
        sg_employee_department: string;
        sg_geography: string;
        sg_role: string;
      },
      projects: {
        [project: string]: {
          billing_status: string;
          billableqty: number;
          count: number;
          sg_role: string;
        }[]
      }
    }
  } = {};

  this.rawProjectData.forEach(entry => {
    const employeeKey = `${entry.sg_employee}___${entry.sg_geography}`;
    const project = entry.ts_task_project;
    const billing_status = entry.billing_status;
    const sg_role = entry.sg_role;
    const billableqty = parseFloat(entry.billableqty) || 0;

    if (!result[employeeKey]) {
      result[employeeKey] = {
        employeeMeta: {
          sg_employee: entry.sg_employee,
          sg_position_title: entry.sg_position_title,
          sg_employee_department: entry.sg_employee_department,
          sg_geography: entry.sg_geography,
          sg_role
        },
        projects: {}
      };
    }

    if (!result[employeeKey].projects[project]) {
      result[employeeKey].projects[project] = [];
    }

    const existing = result[employeeKey].projects[project].find(p =>
      p.billing_status === billing_status && p.sg_role === sg_role
    );

    if (existing) {
      existing.billableqty += billableqty;
      existing.count += 1;
    } else {
      result[employeeKey].projects[project].push({
        billing_status,
        billableqty,
        count: 1,
        sg_role
      });
    }
  });

  // Convert to array format for HTML
  this.projectTableData = Object.entries(result).map(([key, data]) => ({
    employee: data.employeeMeta.sg_employee,
    sg_position_title: data.employeeMeta.sg_position_title,
    sg_employee_department: data.employeeMeta.sg_employee_department,
    sg_geography: data.employeeMeta.sg_geography,
    sg_role: data.employeeMeta.sg_role,
    projects: Object.entries(data.projects).map(([project, statuses]) => {
      const billingDetails = statuses.map(item => ({
        billing_status: item.billing_status,
        total_hours: item.billableqty,
        total_ts_fill_hrs: item.count * 8,
        sg_role: item.sg_role,
        total_billable_hr_company:
        item.billing_status?.toLowerCase() === 'billable'
          ? parseFloat(String(item.billableqty)) || 0
          : 0,
        total_non_billable_hr: (item.count * 8) - (parseFloat(String(item.billableqty)) || 0),
      }));

    const totalBillableHrs_company = billingDetails.reduce((sum, item) => sum + item.total_billable_hr_company, 0);
    const totalTsFillHrs = billingDetails.reduce((sum, item) => sum + item.total_ts_fill_hrs, 0);

    const totalBillableHrs_person = billingDetails.reduce((sum, item) => sum + item.total_hours, 0);
    
    // Calculate company_billability
    const company_billability = totalTsFillHrs > 0 ? (totalBillableHrs_company * 100) / totalTsFillHrs : 0;
    const person_billability = totalTsFillHrs > 0 ? (totalBillableHrs_person * 100) / totalTsFillHrs : 0;

      return {
        project,
        billingDetails,
        company_billability : company_billability.toFixed(2) + '%',
        person_billability : person_billability.toFixed(2) + '%'

      };
    })
  }));
}

    resetFilters(): void {
        
            this.startDate = '';
            this.endDate = '';
            this.department = '';
            this.project = '';
            this.positionTitle = '';
            this.geography = '';
            this.emp_name = ''
            this.rawProjectData = [];
            this.projectTableData = [];
            this.cdr.detectChanges();
    }
}
