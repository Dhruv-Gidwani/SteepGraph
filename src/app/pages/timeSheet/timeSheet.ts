import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef ,NgZone  } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { WorkContractService } from '../chart/service/chart.service';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SortEvent } from 'primeng/api';
import { ApiService } from '../../services/tgv.service';
import { ArasService } from '../../services/aras.service';
import { ArasService1 } from '../../services/aras1.service';
import { parseString } from 'xml2js';
import { firstValueFrom } from 'rxjs';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ExportService } from './components/project-table/Excel/excel';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import{LoaderComponent } from './components/loader/loader.component';
import { timeSheetService } from '../../services/timeSheet.service';

@Component({
    selector: 'app-timeSheet-demo',
    standalone: true,
    imports: [CommonModule, ChartModule, FluidModule, FormsModule, TableModule, ScrollPanelModule, SplitButtonModule, ButtonModule,
        
        ProjectTableComponent ,ProgressSpinnerModule , LoaderComponent ],
    templateUrl: './timeSheet.html'
})

export class timeSheetDemo implements OnInit {
    isLoading: boolean = false;
    allContracts: any[] = [];
    filteredContracts: any[] = [];
    selectedProject: string | null = null;
    selectedProjectData: any[] = [];
    projectTableData: any[] = [];
    selectedProjectIndex: number | null = null;;;
    rawProjectData : any[] = [];
    filters = {
        startDate: '',
        endDate: '',
    };

    exportOptions: MenuItem[] | undefined;

    cwoStartDate: string = '';
  cwoEndDate: string = '';
  cwoStatus: string = '';

    constructor(
        private ApiService: ApiService,
        private cdr: ChangeDetectorRef,
        private exportService: ExportService,
        private timeSheetService: timeSheetService,
        private ngZone: NgZone
    ) { }

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
      };

ngOnInit(): void {
    this.isLoading = true;
  
    this.timeSheetService.fetchtimeSheetItem().subscribe({
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
      },
    });
  }
// working code --------------------------------------------------------------------------------------------------------------------------------
  // groupProjectData() {
  //   const result: { [employee: string]: { [project: string]: { billing_status: string, billableqty: number }[] } } = {};
  
  //   this.rawProjectData.forEach(entry => {
  //     const employee = entry.sg_employee;
  //     const project = entry.ts_task_project;
  //     const billing_status = entry.billing_status;
  //     const billableqty = parseFloat(entry.billableqty) || 0;
  
  //     if (!result[employee]) {
  //       result[employee] = {};
  //     }
  
  //     if (!result[employee][project]) {
  //       result[employee][project] = [];
  //     }
  
  //     result[employee][project].push({ billing_status, billableqty });
  //   });
  
  //   // Convert to array format for easier iteration in HTML
  //   this.projectTableData = Object.entries(result).map(([employee, projects]) => ({
  //     employee,
  //     projects: Object.entries(projects).map(([project, statuses]) => {
  //       const aggregated = statuses.reduce((acc, item) => {
  //         if (!acc[item.billing_status]) {
  //           acc[item.billing_status] = 0;
  //         }
  //         acc[item.billing_status] += item.billableqty;
  //         return acc;
  //       }, {} as { [status: string]: number });
  
  //       return {
  //         project,
  //         billingDetails: Object.entries(aggregated).map(([status, total]) => ({
  //           billing_status: status,
  //           total_hours: total
  //         }))
  //       };
  //     })
  //   }));
  // } ----------------------------------------------------

  groupProjectData() {
  const result: {
    [employee: string]: {
      employeeMeta: {
        sg_position_title: string;
        sg_employee_department: string;
        sg_geography: string;
        sg_role: string;
      },
      projects: {
        [project: string]: {
          billing_status: string;
          billableqty: number;
        }[]
      }
    }
  } = {};

  this.rawProjectData.forEach(entry => {
    const employee = entry.sg_employee;
    const project = entry.ts_task_project;
    const billing_status = entry.billing_status;
    const billableqty = parseFloat(entry.billableqty) || 0;

    if (!result[employee]) {
      result[employee] = {
        employeeMeta: {
          sg_position_title: entry.sg_position_title,
          sg_employee_department: entry.sg_employee_department,
          sg_geography: entry.sg_geography,
          sg_role: entry.sg_role
        },
        projects: {}
      };
    }

    if (!result[employee].projects[project]) {
      result[employee].projects[project] = [];
    }

    result[employee].projects[project].push({ billing_status, billableqty });
  });

  // Convert to array format for easier iteration in HTML
  this.projectTableData = Object.entries(result).map(([employee, data]) => ({
    employee,
    sg_position_title: data.employeeMeta.sg_position_title,
    sg_employee_department: data.employeeMeta.sg_employee_department,
    sg_geography: data.employeeMeta.sg_geography,
    sg_role: data.employeeMeta.sg_role,
    projects: Object.entries(data.projects).map(([project, statuses]) => {
      const aggregated = statuses.reduce((acc, item) => {
        if (!acc[item.billing_status]) {
          acc[item.billing_status] = 0;
        }
        acc[item.billing_status] += item.billableqty;
        return acc;
      }, {} as { [status: string]: number });

      return {
        project,
        billingDetails: Object.entries(aggregated).map(([status, total]) => ({
          billing_status: status,
          total_hours: total
        }))
      };
    })
  }));
}

  
  
  
  

    
//     applyFilters(): void {
//         const { startDate, endDate } = this.filters;
//         const userStart = startDate ? new Date(startDate) : null;
//         const userEnd = endDate ? new Date(endDate) : null;

//         // Apply filters
//         this.filteredContracts = this.allContracts.filter((item) => {
//             // Date filtering
//             const itemStart = new Date(item['Start Date']);
//             const itemEnd = new Date(item['End Date']);
//             const isDateMatch = !userStart || !userEnd || (itemEnd >= userStart && itemStart <= userEnd);

//             // Other filters - use bracket notation for field names with spaces
            

//             return isDateMatch;
//         });

//         // If no contracts are found after filtering, reset everything
//         if (this.filteredContracts.length === 0) {
//             this.selectedProject = null;
//             this.selectedProjectIndex = null;
//             this.projectTableData = [];
//             this.cdr.detectChanges();
//             return;
//         }

       

//         // Rebuild the project data map with filtered contracts
//         const projectDataMap: { [project: string]: any[] } = {};
//         this.filteredContracts.forEach((contract) => {
//             const projectKey = contract.Project?.trim() || 'Unknown';
//             if (!projectDataMap[projectKey]) {
//                 projectDataMap[projectKey] = [];
//             }
//             projectDataMap[projectKey].push(contract);
//         });

//         // Set the first available project after filtering
//         const tempLabels = Object.keys(projectDataMap);
//         if (tempLabels.length > 0) {
//             const firstProject = tempLabels[0];
//             this.selectedProject = firstProject;
//             this.selectedProjectIndex = tempLabels.indexOf(firstProject);

//             // Handle project-specific data (bar chart, table, roles)
//             this.handleProjectSelection(firstProject, projectDataMap);
//         }

//         // Re-render the pie chart with filtered data
//         // this.renderPieChart();
//     }

    // onGlobalFilter(event: Event, dt: any) {
    //     const input = event.target as HTMLInputElement;
    //     dt.filterGlobal(input.value, 'contains');
    // }


  
//     renderProjectTable(): void {
//         this.projectTableData = this.selectedProjectData.map((contract) => {
//             const row = { ...contract }; // Deep clone the contract object

//             // Helper function to format dates and validate them
//             const formatDate = (dateString: string): string | null => {
//                 const date = new Date(dateString);
//                 if (isNaN(date.getTime())) {
//                     // Check if it's a valid date
//                     console.error('Invalid date:', dateString);
//                     return ''; // Return empty string if the date is invalid
//                 }
//                 return date.toISOString().slice(0, 10); // Return formatted date (YYYY-MM-DD)
//             };

//             // Format Start Date and End Date to YYYY-MM-DD
//             const formattedStartDate = formatDate(row['Start Date']);
//             const formattedEndDate = formatDate(row['End Date']);

//             if (!formattedStartDate && !formattedEndDate) {
//                 console.warn('Both dates are invalid. Skipping project row.');
//                 return row; // Skip this project row if both dates are invalid
//             }

//             row['Start Date'] = formattedStartDate;
//             row['End Date'] = formattedEndDate;
            
//             // convert date string to date object for filtering
//             row['Start Date Object'] = formattedStartDate ? new Date(formattedStartDate) : null;
//             row['End Date Object'] = formattedEndDate ? new Date(formattedEndDate) : null;

//             // Initialize month fields with empty values
//             const monthMap: { [key: string]: { day: string; color: string } } = {
//                 Jan: { day: '', color: '' },
//                 Feb: { day: '', color: '' },
//                 Mar: { day: '', color: '' },
//                 Apr: { day: '', color: '' },
//                 May: { day: '', color: '' },
//                 Jun: { day: '', color: '' },
//                 Jul: { day: '', color: '' },
//                 Aug: { day: '', color: '' },
//                 Sep: { day: '', color: '' },
//                 Oct: { day: '', color: '' },
//                 Nov: { day: '', color: '' },
//                 Dec: { day: '', color: '' }
//             };

//             if (formattedStartDate && formattedEndDate) {
//                 const startDate = new Date(formattedStartDate);
//                 const endDate = new Date(formattedEndDate);
//                 const currentYear = new Date().getFullYear();
            
//                 const startYear = startDate.getFullYear();
//                 const endYear = endDate.getFullYear();
            
//                 // Adjusted start date only if in current year
//                 const adjustedStartDate = new Date(Math.max(startDate.getTime(), new Date(currentYear, 0, 1).getTime()));
//                 let currentDate = new Date(adjustedStartDate.getFullYear(), adjustedStartDate.getMonth(), 1);
            
//                 while (
//                     currentDate.getFullYear() < endDate.getFullYear() ||
//                     (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() <= endDate.getMonth())
//                 ) {
//                     const monthAbbr = Object.keys(monthMap)[currentDate.getMonth()];
//                     const currentMonth = currentDate.getMonth();
//                     const currentYearInLoop = currentDate.getFullYear();
            
//                     // Set color for months in current year only
//                     if (currentYearInLoop === currentYear) {
//                         monthMap[monthAbbr].color = '#66bb6a';
//                     }
            
//                     // 1. Start and End year are same, and equal to current year
//                     if (startYear === endYear && startYear === currentYear) {
//                         if (currentMonth === startDate.getMonth()) {
//                             monthMap[monthAbbr].day = String(startDate.getDate());
//                         }
//                         if (currentMonth === endDate.getMonth()) {
//                             monthMap[monthAbbr].day = String(endDate.getDate());
//                         }
//                     }
            
//                     // 2. Start year < End year, and End is current year → show only end date
//                     else if (startYear < endYear && endYear === currentYear) {
//                         if (currentMonth === endDate.getMonth() && currentYearInLoop === endYear) {
//                             monthMap[monthAbbr].day = String(endDate.getDate());
//                         }
//                     }
            
//                     // 3. Start year < End year, and Start is current year → show only start date
//                     else if (startYear < endYear && startYear === currentYear) {
//                         if (currentMonth === startDate.getMonth() && currentYearInLoop === startYear) {
//                             monthMap[monthAbbr].day = String(startDate.getDate());
//                         }
//                     }
            
//                     // 4. Start and End are different years and neither is current year → no day set
            
//                     // Move to next month
//                     currentDate.setMonth(currentDate.getMonth() + 1);
//                 }
//             }
            

//             // Merge the month data with the row data
//             return { ...row, ...monthMap };
//         });
       
//         this.calculateRowspan(); // Update rowspan calculations
//         this.cdr.detectChanges(); // Ensure UI updates
//     }

    

//     private calculateRowspan(): void {
//         const projectCounts = new Map<string, number>();
//         const contractCounts = new Map<string, number>();
//         const managerCounts = new Map<string, number>();
//         const billingMethodCounts = new Map<string, number>();
//         const tsApproverCounts = new Map<string, number>(); // Add this line

//         // Precompute counts
//         for (const row of this.projectTableData) {
//             projectCounts.set(row.Project, (projectCounts.get(row.Project) || 0) + 1);
//             contractCounts.set(row['Work Contract Name'], (contractCounts.get(row['Work Contract Name']) || 0) + 1);
//             managerCounts.set(row['Project Manager'], (managerCounts.get(row['Project Manager']) || 0) + 1);
//             billingMethodCounts.set(row['Billing Method'], (billingMethodCounts.get(row['Billing Method']) || 0) + 1);
//             tsApproverCounts.set(row['TS Approver'], (tsApproverCounts.get(row['TS Approver']) || 0) + 1); // Add this line
//         }

//         // Apply counts with flags to track first appearance
//         const seenProjects = new Set();
//         const seenContracts = new Set();
//         const seenManagers = new Set();
//         const seenBillingMethods = new Set();
//         const seenTsApprovers = new Set();

//         for (const row of this.projectTableData) {
//             row.projectRowspan = seenProjects.has(row.Project) ? 0 : projectCounts.get(row.Project);
//             row.contractNameRowspan = seenContracts.has(row['Work Contract Name']) ? 0 : contractCounts.get(row['Work Contract Name']);
//             row.projectManagerRowspan = seenManagers.has(row['Project Manager']) ? 0 : managerCounts.get(row['Project Manager']);
//             row.billingMethodRowspan = seenBillingMethods.has(row['Billing Method']) ? 0 : billingMethodCounts.get(row['Billing Method']);
//             row.tsApproverRowspan = seenTsApprovers.has(row['TS Approver']) ? 0 : tsApproverCounts.get(row['TS Approver']); // Add this line

//             seenProjects.add(row.Project);
//             seenContracts.add(row['Work Contract Name']);
//             seenManagers.add(row['Project Manager']);
//             seenBillingMethods.add(row['Billing Method']);
//             seenTsApprovers.add(row['TS Approver']);
//         }
//     }

//     customSort(event: SortEvent): void {
//         const field = event.field!;
//         const order = event.order ?? 1;

//         this.projectTableData.sort((a, b) => {
//             let value1 = a[field];
//             let value2 = b[field];
//             let result = 0;

//             // Special handling for "Rem. Hrs." field
//             if (field === 'Rem. Hrs.') {
//                 value1 = parseFloat(value1);
//                 value2 = parseFloat(value2);
//             }

//             if (value1 == null && value2 != null) result = -1;
//             else if (value1 != null && value2 == null) result = 1;
//             else if (value1 == null && value2 == null) result = 0;
//             else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
//             else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

//             return order * result;
//         });
        
//         this.calculateRowspan();
//         this.cdr.detectChanges();
//     }

//     onProjectClick(project: string): void {
//         // Build the projectDataMap
//         const projectDataMap: { [project: string]: any[] } = {};
//         this.filteredContracts.forEach((contract) => {
//             const proj = contract.Project || 'Unknown';
//             if (!projectDataMap[proj]) projectDataMap[proj] = [];
//             projectDataMap[proj].push(contract);
//         });

//         // Highlight selected project and trigger chart update
//         // this.renderPieChart();

//         // Handle project-specific logic
//         this.handleProjectSelection(project, projectDataMap);
//     }

//     handleProjectSelection(project: string, projectDataMap: { [project: string]: any[] }): void {
//         this.selectedProject = project;
//         this.selectedProjectData = projectDataMap[project] || [];

//         // Reset filters


//         // this.renderBarChart(this.selectedProjectData);
//         // this.renderProjectTable();
//         this.cdr.detectChanges();
//     }

//     resetFilters(): void {
//         this.filters = {
//             startDate: this.cwoStartDate,
//             endDate: this.cwoEndDate,
//         };
//         this.filteredContracts = this.allContracts;
        
//         this.applyFilters();
//         this.cdr.detectChanges();
//     }
    
}
