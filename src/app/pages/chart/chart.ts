import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { WorkContractService } from '../chart/service/chart.service';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SortEvent } from 'primeng/api';

@Component({
    selector: 'app-chart-demo',
    standalone: true,
    imports: [CommonModule, ChartModule, FluidModule, FormsModule, TableModule, ScrollPanelModule],
    template: `
        <div class="p-4">
            <!-- Filters -->
            <div class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block mb-1 font-medium">Start Date</label>
                    <input type="date" [(ngModel)]="filters.startDate" class="w-full border p-2 rounded" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">End Date</label>
                    <input type="date" [(ngModel)]="filters.endDate" class="w-full border p-2 rounded" />
                </div>
                <div>
                    <label class="block mb-1 font-medium">Status</label>
                    <select [(ngModel)]="filters.status" class="w-full border p-2 rounded">
                        <option value="">All</option>
                        <option *ngFor="let status of uniqueStatuses" [value]="status">{{ status }}</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button (click)="applyFilters()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">Apply Filters</button>
                </div>
            </div>

            <p-fluid class="grid grid-cols-12 gap-8">
                <!-- Pie Chart Card -->
                <div class="col-span-12 xl:col-span-6 mb-6">
                    <div class="card flex flex-col h-[420px]">
                        <div class="font-semibold text-xl mb-4 text-center">Project Distribution</div>
                        <div class="flex h-full overflow-hidden">
                            <!-- Pie chart area -->
                            <div class="w-[220px] h-[220px]">
                                <p-chart type="pie" [data]="pieChartData" [options]="pieChartOptions"></p-chart>
                            </div>

                            <!-- Scrollable legend area -->
                            <div class="flex-1 overflow-y-auto ml-4 max-h-[350px] pr-2 hide-scrollbar">
                                <ul class="project-list">
                                    <li
                                        *ngFor="let project of pieChartData?.labels"
                                        (click)="onProjectClick(project)"
                                        [ngClass]="{
                                            'bg-blue-100 text-blue-700 font-semibold': project === selectedProject,
                                            'hover:bg-gray-100 dark:hover:bg-surface-700': true
                                        }"
                                        class="cursor-pointer px-3 py-2 rounded-md transition-colors duration-200"
                                    >
                                        {{ project }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bar Chart and Role Filter -->
                <div class="col-span-12 xl:col-span-6 mb-6" *ngIf="selectedProject && barChartData">
                    <div class="card flex flex-col h-[420px] justify-between">
                        <div>
                            <div class="font-semibold text-xl mb-2 text-center">Resources in {{ selectedProject }}</div>
                            <label class="block mb-1 font-medium">Filter by Role</label>
                            <select [(ngModel)]="selectedRole" (change)="filterBarChartByRole()" class="w-full border p-2 rounded">
                                <option value="">All</option>
                                <option *ngFor="let role of availableRoles" [value]="role">{{ role }}</option>
                            </select>
                        </div>
                        <div class="w-full overflow-x-auto">
                            <div class="min-w-[350px]" [style.width.px]="barChartData.labels.length * 60">
                                <p-chart type="bar" [data]="barChartData" [options]="barChartOptions"></p-chart>
                            </div>
                        </div>
                    </div>
                </div>
            </p-fluid>
            <!-- Data Table -->
            <div class="p-mt-4" *ngIf="projectTableData.length">
                <p-table
                    #dt2
                    [value]="projectTableData"
                    [scrollable]="true"
                    scrollHeight="500px"
                    [customSort]="true"
                    (sortFunction)="customSort($event)"
                    [globalFilterFields]="['Project', 'Work Contract Name', 'Project Manager', 'PWO Name', 'Role', 'Resource Name', 'Allocated Hrs.', 'Rem. Hrs.', 'Start Date', 'End Date']"
                >
                    <!-- Search Bar -->
                    <ng-template pTemplate="caption">
                        <div class="flex justify-content-end">
                            <span class="p-input-icon-left">
                                <i class="pi pi-search"></i>
                                <input #globalFilterInput pInputText type="text" (input)="onGlobalFilter($event, dt2)" placeholder="Search keyword" />
                            </span>
                        </div>
                    </ng-template>

                    <!-- Table Header -->
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Project</th>
                            <th>Work Contract Name</th>
                            <th>Project Manager</th>
                            <th>PWO Name</th>
                            <th>Role</th>
                            <th pSortableColumn="Resource Name">
                                Resource Name
                                <p-sortIcon field="Resource Name"></p-sortIcon>
                            </th>
                            <th>Allocated Hrs.</th>
                            <th pSortableColumn="Rem. Hrs.">
                                Rem. Hrs.
                                <p-sortIcon field="Rem. Hrs."></p-sortIcon>
                            </th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                        </tr>
                    </ng-template>

                    <!-- Table Body -->
                    <ng-template pTemplate="body" let-row let-i="rowIndex">
                        <tr>
                            <td *ngIf="row.projectRowspan > 0" [attr.rowspan]="row.projectRowspan">{{ row.Project }}</td>
                            <td *ngIf="row.contractNameRowspan > 0" [attr.rowspan]="row.contractNameRowspan">{{ row['Work Contract Name'] }}</td>
                            <td *ngIf="row.projectManagerRowspan > 0" [attr.rowspan]="row.projectManagerRowspan">{{ row['Project Manager'] }}</td>
                            <td>{{ row['PWO Name'] }}</td>
                            <td>{{ row['Role'] }}</td>
                            <td>{{ row['Resource Name'] }}</td>
                            <td>{{ row['Allocated Hrs.'] }}</td>
                            <td>{{ row['Rem. Hrs.'] }}</td>
                            <td>{{ row['Start Date'] }}</td>
                            <td>{{ row['End Date'] }}</td>

                            <!-- Month Cells -->
                            <td *ngIf="row.Jan" [style.background-color]="row.Jan.color">{{ row.Jan.day }}</td>
                            <td *ngIf="row.Feb" [style.background-color]="row.Feb.color">{{ row.Feb.day }}</td>
                            <td *ngIf="row.Mar" [style.background-color]="row.Mar.color">{{ row.Mar.day }}</td>
                            <td *ngIf="row.Apr" [style.background-color]="row.Apr.color">{{ row.Apr.day }}</td>
                            <td *ngIf="row.May" [style.background-color]="row.May.color">{{ row.May.day }}</td>
                            <td *ngIf="row.Jun" [style.background-color]="row.Jun.color">{{ row.Jun.day }}</td>
                            <td *ngIf="row.Jul" [style.background-color]="row.Jul.color">{{ row.Jul.day }}</td>
                            <td *ngIf="row.Aug" [style.background-color]="row.Aug.color">{{ row.Aug.day }}</td>
                            <td *ngIf="row.Sep" [style.background-color]="row.Sep.color">{{ row.Sep.day }}</td>
                            <td *ngIf="row.Oct" [style.background-color]="row.Oct.color">{{ row.Oct.day }}</td>
                            <td *ngIf="row.Nov" [style.background-color]="row.Nov.color">{{ row.Nov.day }}</td>
                            <td *ngIf="row.Dec" [style.background-color]="row.Dec.color">{{ row.Dec.day }}</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class ChartDemo implements OnInit {
    allContracts: any[] = [];
    filteredContracts: any[] = [];
    selectedProject: string | null = null;
    selectedProjectData: any[] = [];
    projectTableData: any[] = []; // Table data to show selected project details
    selectedProjectIndex: number | null = null;

    barChartData: any;
    barChartOptions: any;

    pieChartData: any;
    pieChartOptions: any;

    filters = {
        startDate: '',
        endDate: '',
        status: ''
    };

    uniqueStatuses: string[] = [];
    availableRoles: string[] = [];
    selectedRole: string = '';

    constructor(
        private workContractService: WorkContractService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.allContracts = this.workContractService.getWorkContracts();
        this.filteredContracts = [...this.allContracts];
        this.uniqueStatuses = [...new Set(this.allContracts.map((c) => c.Status).filter(Boolean))];

        // Set default project and index BEFORE rendering the pie chart
        if (this.filteredContracts.length > 0) {
            const firstProject = this.filteredContracts[0].Project || 'Unknown';
            this.selectedProject = firstProject;

            // Temporarily create labels so we can get the correct index
            const tempLabels = [...new Set(this.filteredContracts.map((c) => c.Project || 'Unknown'))];
            this.selectedProjectIndex = tempLabels.indexOf(firstProject);
        }

        this.renderPieChart(); // now uses correct selectedProjectIndex

        // Handle project selection logic
        const projectDataMap: { [project: string]: any[] } = {};
        this.filteredContracts.forEach((contract) => {
            const project = contract.Project || 'Unknown';
            if (!projectDataMap[project]) projectDataMap[project] = [];
            projectDataMap[project].push(contract);
        });

        if (this.selectedProject) {
            this.handleProjectSelection(this.selectedProject, projectDataMap);
        }
    }

    applyFilters(): void {
        const { startDate, endDate, status } = this.filters;
        const userStart = startDate ? new Date(startDate) : null;
        const userEnd = endDate ? new Date(endDate) : null;

        // Apply date and status filters
        this.filteredContracts = this.allContracts.filter((item) => {
            const itemStart = new Date(item['Start Date']);
            const itemEnd = new Date(item['End Date']);
            const isDateMatch = !userStart || !userEnd || (itemEnd >= userStart && itemStart <= userEnd);
            const statusMatch = !status || item.Status?.toLowerCase() === status.toLowerCase();
            return isDateMatch && statusMatch;
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

        // Rebuild the project data map
        const projectDataMap: { [project: string]: any[] } = {};
        this.filteredContracts.forEach((contract) => {
            const project = contract.Project || 'Unknown';
            if (!projectDataMap[project]) projectDataMap[project] = [];
            projectDataMap[project].push(contract);
        });

        // Set the first available project after filtering
        const tempLabels = Object.keys(projectDataMap);
        const firstProject = tempLabels[0];

        this.selectedProject = firstProject;
        this.selectedProjectIndex = tempLabels.indexOf(firstProject);

        // Handle project-specific data (bar chart, table, roles)
        this.handleProjectSelection(firstProject, projectDataMap);

        // Now re-render the pie chart (with correct highlighting)
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

                    this.selectedProjectIndex = index; // set selected index
                    this.handleProjectSelection(label, projectDataMap);
                    this.renderPieChart(); // re-render to apply offset
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

    filterBarChartByRole(): void {
        // Filter the project data based on selected role
        const filteredData = this.selectedRole ? this.selectedProjectData.filter((contract) => contract.Role === this.selectedRole) : this.selectedProjectData;

        // Call renderBarChart with the filtered data
        this.renderBarChart(filteredData);

        // Ensure change detection is triggered after updating bar chart data
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

                // Adjust startDate to January of the current year if it's before current year
                const adjustedStartDate = new Date(Math.max(startDate.getTime(), new Date(currentYear, 0, 1).getTime()));

                // Set the current date to the first day of the start month (January of current year if adjusted)
                let currentDate = new Date(adjustedStartDate.getFullYear(), adjustedStartDate.getMonth(), 1);

                // Loop through months from adjustedStartDate to endDate
                while (currentDate.getFullYear() < endDate.getFullYear() || (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() <= endDate.getMonth())) {
                    const monthAbbr = Object.keys(monthMap)[currentDate.getMonth()];

                    // Mark the month within the range with a color
                    if (currentDate.getFullYear() === adjustedStartDate.getFullYear() || currentDate.getFullYear() > adjustedStartDate.getFullYear()) {
                        monthMap[monthAbbr].color = '#66bb6a'; // Color months in the range
                    }

                    // Set the day for the start month if we're in the start month
                    if (currentDate.getFullYear() === adjustedStartDate.getFullYear() && currentDate.getMonth() === adjustedStartDate.getMonth()) {
                        monthMap[monthAbbr].day = String(adjustedStartDate.getDate());
                    }

                    // Set the day for the end month if we're in the end month
                    if (currentDate.getFullYear() === endDate.getFullYear() && currentDate.getMonth() === endDate.getMonth()) {
                        monthMap[monthAbbr].day = String(endDate.getDate());
                    }

                    // Move to the next month
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

        // Precompute counts
        for (const row of this.projectTableData) {
            projectCounts.set(row.Project, (projectCounts.get(row.Project) || 0) + 1);
            contractCounts.set(row['Work Contract Name'], (contractCounts.get(row['Work Contract Name']) || 0) + 1);
            managerCounts.set(row['Project Manager'], (managerCounts.get(row['Project Manager']) || 0) + 1);
        }

        // Apply counts with flags to track first appearance
        const seenProjects = new Set();
        const seenContracts = new Set();
        const seenManagers = new Set();

        for (const row of this.projectTableData) {
            row.projectRowspan = seenProjects.has(row.Project) ? 0 : projectCounts.get(row.Project);
            row.contractNameRowspan = seenContracts.has(row['Work Contract Name']) ? 0 : contractCounts.get(row['Work Contract Name']);
            row.projectManagerRowspan = seenManagers.has(row['Project Manager']) ? 0 : managerCounts.get(row['Project Manager']);

            seenProjects.add(row.Project);
            seenContracts.add(row['Work Contract Name']);
            seenManagers.add(row['Project Manager']);
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
        this.selectedRole = '';
        this.availableRoles = [...new Set(this.selectedProjectData.map((c) => c.Role).filter(Boolean))];

        this.renderBarChart(this.selectedProjectData);
        this.renderProjectTable();
        this.cdr.detectChanges();
    }
}
