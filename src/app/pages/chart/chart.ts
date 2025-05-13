import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import{LoaderComponent } from './components/loader/loader.component';

@Component({
    selector: 'app-chart-demo',
    standalone: true,
    imports: [CommonModule, ChartModule, FluidModule, FormsModule, TableModule, ScrollPanelModule, SplitButtonModule, ButtonModule, PieChartComponent,
        BarChartComponent,
        ProjectTableComponent ,ProgressSpinnerModule , LoaderComponent ],
    templateUrl: './chart.html'
})

export class ChartDemo implements OnInit {
    isLoading: boolean = false;
    allContracts: any[] = [];
    filteredContracts: any[] = [];
    selectedProject: string | null = null;
    selectedProjectData: any[] = [];
    projectTableData: any[] = [];
    selectedProjectIndex: number | null = null;
    uniqueGeographies: string[] = [];
    uniqueBillingMethods: string[] = [];
    uniqueCustomers: string[] = [];

    barChartData: any;
    barChartOptions: any;

    pieChartData: any;
    pieChartOptions: any;

    filters = {
        startDate: '',
        endDate: '',
        status: '',
        geography: '',
        billingMethod: '',
        customer: ''
    };

    uniqueStatuses: string[] = [];
    availableRoles: string[] = [];
    selectedRole: string = '';
    uniqueBillingStatuses: string[] = [];
    selectedBillingStatus: string = '';
    exportOptions: MenuItem[] | undefined;

    cwoStartDate: string = '';
  cwoEndDate: string = '';
  cwoStatus: string = '';

    constructor(
        private workContractService: WorkContractService,
        private ApiService: ApiService,
        private cdr: ChangeDetectorRef,
        private arasService: ArasService,
        private arasService1: ArasService1,
        private exportService: ExportService
    ) { }

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
      };

    async ngOnInit(): Promise<void> {
        this.isLoading = true;
        let tgvdXmlString: string = '';
        let paramMapString: string = '';

        try {
            // 1st service: fetch TGVD XML
            const tgvdResponse = await firstValueFrom(this.arasService.fetchTgvdItem());
            tgvdXmlString = tgvdResponse.toString();
            console.log('TGVD Response as String:', tgvdXmlString);

            // 2nd service: fetch QB values and parse XML
            const qbResponse = await firstValueFrom(this.arasService1.fetchQBValueItem());

            // Convert callback-style parseString to a promise
            const paramMap = await new Promise<Record<string, string>>((resolve, reject) => {
                parseString(qbResponse, { explicitArray: false }, (err: any, result: any) => {
                    if (err) return reject(err);

                    try {
                        const items = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'].Result.Item.Relationships.Item;
                        const itemArray = Array.isArray(items) ? items : [items];
                        const map: Record<string, string> = {};

                        itemArray.forEach((item: any) => {
                            const key = item.qd_parameter_name;
                            const value = item.user_input_default_value?._ || item.user_input_default_value;
                            if (key) map[key] = value;
                        });

                        resolve(map);
                    } catch (parseError) {
                        reject(parseError);
                    }
                });
            });
            console.log('Parsed Parameter Map:', paramMap);
            this.cwoStartDate = paramMap['sg_cwo_start'].split("T")[0];
            this.cwoEndDate = paramMap['sg_cwo_end'].split("T")[0];
            this.cwoStatus = paramMap['sg_work_contract_state'];
            console.log("Work Contract State:", this.cwoStatus);
            this.filters.startDate = this.cwoStartDate;
            this.filters.endDate = this.cwoEndDate;
            this.filters.status = this.cwoStatus;
              
            console.log("CWO Start Date:", this.cwoStartDate); // Output: 01-04-2024
            console.log("CWO End Date:", this.cwoEndDate);     
            paramMapString = JSON.stringify(paramMap);
            console.log('Extracted Parameter Map as String:', paramMapString);

            // 3rd service: get TreeGrid data
            const data = await firstValueFrom(this.ApiService.getTreeGridData(tgvdXmlString, paramMapString));

            // Process received contract data
            this.allContracts = data;
            this.filteredContracts = [...this.allContracts];

            this.uniqueStatuses = [...new Set(this.allContracts.map((c) => c.Status?.trim() || 'Unknown'))];
            this.uniqueGeographies = [...new Set(this.allContracts.map((c) => c.Geography?.trim() || 'Unknown'))];
            this.uniqueBillingMethods = [...new Set(this.allContracts.map((c) => c['Billing Method']?.trim() || 'Unknown'))];
            this.uniqueCustomers = [...new Set(this.allContracts.map((c) => c.Customer?.trim() || 'Unknown'))];

            const projectNames = this.allContracts.map((c) => (c.Project?.trim() && c.Project.trim().length > 0 ? c.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`));

            const tempLabels = [...new Set(projectNames)];
            this.selectedProject = tempLabels[0];
            this.selectedProjectIndex = 0;

            this.renderPieChart();

            const projectDataMap: { [project: string]: any[] } = {};
            this.allContracts.forEach((contract) => {
                const projectKey = contract.Project?.trim() && contract.Project.trim().length > 0 ? contract.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`;

                if (!projectDataMap[projectKey]) projectDataMap[projectKey] = [];
                projectDataMap[projectKey].push(contract);
            });

            if (this.selectedProject && projectDataMap[this.selectedProject]) {
                this.handleProjectSelection(this.selectedProject, projectDataMap);
            }

            console.log('All Contracts:', this.allContracts);
            console.table(this.allContracts);
        } catch (error) {
            console.error('Error in sequential service calls:', error);
        }
        finally {
            this.isLoading = false;
             this.cdr.detectChanges();

        }

    }
    
    applyFilters(): void {
        const { startDate, endDate, status, geography, billingMethod, customer } = this.filters;
        const userStart = startDate ? new Date(startDate) : null;
        const userEnd = endDate ? new Date(endDate) : null;

        // Apply filters
        this.filteredContracts = this.allContracts.filter((item) => {
            // Date filtering
            const itemStart = new Date(item['Start Date']);
            const itemEnd = new Date(item['End Date']);
            const isDateMatch = !userStart || !userEnd || (itemEnd >= userStart && itemStart <= userEnd);

            // Other filters - use bracket notation for field names with spaces
            const statusMatch = !status || item.Status?.toString().toLowerCase() === status.toLowerCase();

            const geographyMatch = !geography || item.Geography?.toString().toLowerCase() === geography.toLowerCase();

            const billingMethodMatch = !billingMethod || item['Billing Method']?.toString().toLowerCase() === billingMethod.toLowerCase();

            const customerMatch = !customer || item.Customer?.toString().toLowerCase() === customer.toLowerCase();

            return isDateMatch && statusMatch && geographyMatch && billingMethodMatch && customerMatch;
        });

        // If no contracts are found after filtering, reset everything
        if (this.filteredContracts.length === 0) {
            this.selectedProject = null;
            this.selectedProjectIndex = null;
            this.pieChartData = null;
            this.barChartData = null;
            this.projectTableData = [];
            this.availableRoles = [];
            this.selectedRole = '';
            this.cdr.detectChanges();
            return;
        }

       

        // Rebuild the project data map with filtered contracts
        const projectDataMap: { [project: string]: any[] } = {};
        this.filteredContracts.forEach((contract) => {
            const projectKey = contract.Project?.trim() || 'Unknown';
            if (!projectDataMap[projectKey]) {
                projectDataMap[projectKey] = [];
            }
            projectDataMap[projectKey].push(contract);
        });

        // Set the first available project after filtering
        const tempLabels = Object.keys(projectDataMap);
        if (tempLabels.length > 0) {
            const firstProject = tempLabels[0];
            this.selectedProject = firstProject;
            this.selectedProjectIndex = tempLabels.indexOf(firstProject);

            // Handle project-specific data (bar chart, table, roles)
            this.handleProjectSelection(firstProject, projectDataMap);
        }

        // Re-render the pie chart with filtered data
        this.renderPieChart();
    }

    onGlobalFilter(event: Event, dt: any) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

    renderPieChart(): void {
    const projectCountMap: { [project: string]: number } = {};
    const projectDataMap: { [project: string]: any[] } = {};

    this.filteredContracts.forEach((contract) => {
        const project = contract.Project || 'Unknown';
        projectCountMap[project] = (projectCountMap[project] || 0) + 1;
        if (!projectDataMap[project]) projectDataMap[project] = [];
        projectDataMap[project].push(contract);
    });

    const labels = Object.keys(projectCountMap);
    const data = Object.values(projectCountMap);

    // Set default project if not selected
    if (!this.selectedProject && labels.length > 0) {
        this.selectedProject = labels[0];
        this.selectedProjectIndex = 0;
        this.handleProjectSelection(this.selectedProject, projectDataMap);
    }

    this.pieChartData = {
        labels,
        datasets: [
            {
                data,
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26C6DA', '#D4E157', '#FFCA28', '#8D6E63', '#78909C'],
                hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#FF8A65', '#4DD0E1', '#DCE775', '#FFD54F', '#A1887F', '#90A4AE'],
                offset: labels.map((_, index) => (index === this.selectedProjectIndex ? 20 : 0)) // highlight selected
            }
        ]
    };

    this.pieChartOptions = {
        responsive: true,
        cutout: '50%',
        onClick: (evt: any, activeEls: any[]) => {
            if (activeEls.length > 0) {
                const chart = activeEls[0].element.$context.chart;
                const index = activeEls[0].index;
                const label = chart.data.labels[index];

                this.selectedProjectIndex = index;
                this.selectedProject = label;
                this.handleProjectSelection(label, projectDataMap);
                this.renderPieChart();
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };
}


    renderBarChart(data: any[]): void {
        const resourceMap: { [resource: string]: { allocated: number; remaining: number } } = {};

        data.forEach((contract) => {
            const resource = contract['Resource Name'] || 'Unknown';
            const allocated = +contract['Allocated Hrs.'] || 0;
            const remaining = +contract['Rem. Hrs.'] || 0;

            if (!resourceMap[resource]) {
                resourceMap[resource] = { allocated: 0, remaining: 0 };
            }

            resourceMap[resource].allocated += allocated;
            resourceMap[resource].remaining += remaining;
        });

        let labels = Object.keys(resourceMap);
        labels.sort();
        const allocatedData = labels.map((label) => resourceMap[label].allocated);
        const remainingData = labels.map((label) => resourceMap[label].remaining);

        this.barChartData = {
            labels,
            datasets: [
                {
                    label: 'Allocated Hrs',
                    backgroundColor: '#42A5F5',
                    data: allocatedData
                },
                {
                    label: 'Rem. Hrs.',
                    backgroundColor: '#66BB6A',
                    data: remainingData
                }
            ]
        };

        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1.2,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    stacked: false,
                    ticks: {
                        display: true // This will hide the x-axis labels
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        };
    }

    filterBarChart = () =>{
        // Filter the project data based on selected filters
        const filteredData = this.selectedProjectData.filter((contract) => {
            const roleMatch = !this.selectedRole || contract['Position Role'] === this.selectedRole;
            const billingMatch = !this.selectedBillingStatus || contract['Billing Status'] === this.selectedBillingStatus;
            return roleMatch && billingMatch;
        });

        // Call renderBarChart with the filtered data
        this.renderBarChart(filteredData);

        // Ensure change detection is triggered
        this.cdr.detectChanges();
    }
  
    renderProjectTable(): void {
        this.projectTableData = this.selectedProjectData.map((contract) => {
            const row = { ...contract }; // Deep clone the contract object

            // Helper function to format dates and validate them
            const formatDate = (dateString: string): string | null => {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    // Check if it's a valid date
                    console.error('Invalid date:', dateString);
                    return ''; // Return empty string if the date is invalid
                }
                return date.toISOString().slice(0, 10); // Return formatted date (YYYY-MM-DD)
            };

            // Format Start Date and End Date to YYYY-MM-DD
            const formattedStartDate = formatDate(row['Start Date']);
            const formattedEndDate = formatDate(row['End Date']);

            if (!formattedStartDate && !formattedEndDate) {
                console.warn('Both dates are invalid. Skipping project row.');
                return row; // Skip this project row if both dates are invalid
            }

            row['Start Date'] = formattedStartDate;
            row['End Date'] = formattedEndDate;
            
            // convert date string to date object for filtering
            row['Start Date Object'] = formattedStartDate ? new Date(formattedStartDate) : null;
            row['End Date Object'] = formattedEndDate ? new Date(formattedEndDate) : null;

            // Initialize month fields with empty values
            const monthMap: { [key: string]: { day: string; color: string } } = {
                Jan: { day: '', color: '' },
                Feb: { day: '', color: '' },
                Mar: { day: '', color: '' },
                Apr: { day: '', color: '' },
                May: { day: '', color: '' },
                Jun: { day: '', color: '' },
                Jul: { day: '', color: '' },
                Aug: { day: '', color: '' },
                Sep: { day: '', color: '' },
                Oct: { day: '', color: '' },
                Nov: { day: '', color: '' },
                Dec: { day: '', color: '' }
            };

            if (formattedStartDate && formattedEndDate) {
                const startDate = new Date(formattedStartDate);
                const endDate = new Date(formattedEndDate);
                const currentYear = new Date().getFullYear();
            
                const startYear = startDate.getFullYear();
                const endYear = endDate.getFullYear();
            
                // Adjusted start date only if in current year
                const adjustedStartDate = new Date(Math.max(startDate.getTime(), new Date(currentYear, 0, 1).getTime()));
                let currentDate = new Date(adjustedStartDate.getFullYear(), adjustedStartDate.getMonth(), 1);
            
                while (
                    currentDate.getFullYear() < endDate.getFullYear() ||
                    (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() <= endDate.getMonth())
                ) {
                    const monthAbbr = Object.keys(monthMap)[currentDate.getMonth()];
                    const currentMonth = currentDate.getMonth();
                    const currentYearInLoop = currentDate.getFullYear();
            
                    // Set color for months in current year only
                    if (currentYearInLoop === currentYear) {
                        monthMap[monthAbbr].color = '#66bb6a';
                    }
            
                    // 1. Start and End year are same, and equal to current year
                    if (startYear === endYear && startYear === currentYear) {
                        if (currentMonth === startDate.getMonth()) {
                            monthMap[monthAbbr].day = String(startDate.getDate());
                        }
                        if (currentMonth === endDate.getMonth()) {
                            monthMap[monthAbbr].day = String(endDate.getDate());
                        }
                    }
            
                    // 2. Start year < End year, and End is current year → show only end date
                    else if (startYear < endYear && endYear === currentYear) {
                        if (currentMonth === endDate.getMonth() && currentYearInLoop === endYear) {
                            monthMap[monthAbbr].day = String(endDate.getDate());
                        }
                    }
            
                    // 3. Start year < End year, and Start is current year → show only start date
                    else if (startYear < endYear && startYear === currentYear) {
                        if (currentMonth === startDate.getMonth() && currentYearInLoop === startYear) {
                            monthMap[monthAbbr].day = String(startDate.getDate());
                        }
                    }
            
                    // 4. Start and End are different years and neither is current year → no day set
            
                    // Move to next month
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }
            

            // Merge the month data with the row data
            return { ...row, ...monthMap };
        });
       
        this.calculateRowspan(); // Update rowspan calculations
        this.cdr.detectChanges(); // Ensure UI updates
    }

    

    private calculateRowspan(): void {
        const projectCounts = new Map<string, number>();
        const contractCounts = new Map<string, number>();
        const managerCounts = new Map<string, number>();
        const billingMethodCounts = new Map<string, number>();
        const tsApproverCounts = new Map<string, number>(); // Add this line

        // Precompute counts
        for (const row of this.projectTableData) {
            projectCounts.set(row.Project, (projectCounts.get(row.Project) || 0) + 1);
            contractCounts.set(row['Work Contract Name'], (contractCounts.get(row['Work Contract Name']) || 0) + 1);
            managerCounts.set(row['Project Manager'], (managerCounts.get(row['Project Manager']) || 0) + 1);
            billingMethodCounts.set(row['Billing Method'], (billingMethodCounts.get(row['Billing Method']) || 0) + 1);
            tsApproverCounts.set(row['TS Approver'], (tsApproverCounts.get(row['TS Approver']) || 0) + 1); // Add this line
        }

        // Apply counts with flags to track first appearance
        const seenProjects = new Set();
        const seenContracts = new Set();
        const seenManagers = new Set();
        const seenBillingMethods = new Set();
        const seenTsApprovers = new Set();

        for (const row of this.projectTableData) {
            row.projectRowspan = seenProjects.has(row.Project) ? 0 : projectCounts.get(row.Project);
            row.contractNameRowspan = seenContracts.has(row['Work Contract Name']) ? 0 : contractCounts.get(row['Work Contract Name']);
            row.projectManagerRowspan = seenManagers.has(row['Project Manager']) ? 0 : managerCounts.get(row['Project Manager']);
            row.billingMethodRowspan = seenBillingMethods.has(row['Billing Method']) ? 0 : billingMethodCounts.get(row['Billing Method']);
            row.tsApproverRowspan = seenTsApprovers.has(row['TS Approver']) ? 0 : tsApproverCounts.get(row['TS Approver']); // Add this line

            seenProjects.add(row.Project);
            seenContracts.add(row['Work Contract Name']);
            seenManagers.add(row['Project Manager']);
            seenBillingMethods.add(row['Billing Method']);
            seenTsApprovers.add(row['TS Approver']);
        }
    }

    customSort(event: SortEvent): void {
        const field = event.field!;
        const order = event.order ?? 1;

        this.projectTableData.sort((a, b) => {
            let value1 = a[field];
            let value2 = b[field];
            let result = 0;

            // Special handling for "Rem. Hrs." field
            if (field === 'Rem. Hrs.') {
                value1 = parseFloat(value1);
                value2 = parseFloat(value2);
            }

            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return order * result;
        });
        
        this.calculateRowspan();
        this.cdr.detectChanges();
    }

    onProjectClick(project: string): void {
        // Build the projectDataMap
        const projectDataMap: { [project: string]: any[] } = {};
        this.filteredContracts.forEach((contract) => {
            const proj = contract.Project || 'Unknown';
            if (!projectDataMap[proj]) projectDataMap[proj] = [];
            projectDataMap[proj].push(contract);
        });

        // Highlight selected project and trigger chart update
        this.selectedProject = project;
        this.selectedProjectIndex = this.pieChartData?.labels?.indexOf(project) ?? null;
        this.renderPieChart();

        // Handle project-specific logic
        this.handleProjectSelection(project, projectDataMap);
    }

    handleProjectSelection(project: string, projectDataMap: { [project: string]: any[] }): void {
        this.selectedProject = project;
        this.selectedProjectData = projectDataMap[project] || [];

        // Reset filters
        this.selectedRole = '';
        this.selectedBillingStatus = '';

        // Get unique values for filters
        this.availableRoles = [...new Set(this.selectedProjectData.map((c) => c['Position Role']).filter(Boolean))];
        this.uniqueBillingStatuses = [...new Set(this.selectedProjectData.map((c) => c['Billing Status']).filter(Boolean))];

        this.renderBarChart(this.selectedProjectData);
        this.renderProjectTable();
        this.cdr.detectChanges();
    }

    resetFilters(): void {
        this.filters = {
            startDate: this.cwoStartDate,
            endDate: this.cwoEndDate,
            status: this.cwoStatus,
            geography: '',
            billingMethod: '',
            customer: ''
        };
        this.selectedRole = '';
        this.selectedBillingStatus = '';
        this.filteredContracts = this.allContracts;
        
        this.applyFilters();
        this.cdr.detectChanges();
    }
    
}
