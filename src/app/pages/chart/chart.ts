import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { WorkContractService } from '../chart/service/chart.service';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';

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
                            <div class="w-[250px] h-[250px]">
                                <p-chart type="pie" [data]="pieChartData" [options]="pieChartOptions"></p-chart>
                            </div>

                            <!-- Scrollable legend area -->
                            <div class="flex-1 overflow-y-auto ml-4 max-h-[350px] pr-2">
                                <ul *ngIf="pieChartData?.labels?.length" class="space-y-2 text-sm">
                                    <li *ngFor="let label of pieChartData.labels; let i = index">{{ label }} ({{ pieChartData.datasets[0].data[i] }})</li>
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
                <p-table [value]="projectTableData" [scrollable]="true" scrollHeight="300px">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Project</th>
                            <th>Work Contract Name</th>
                            <th>Project Manager</th>
                            <th>PWO Name</th>
                            <th>Role</th>
                            <th>Resource Name</th>
                            <th>Allocated Hrs.</th>
                            <th>Rem. Hrs.</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-row let-i="rowIndex">
                        <tr>
                            <!-- Use the rowspan attribute for the first three columns -->
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
        this.renderPieChart();
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

        this.selectedProject = null;
        this.renderPieChart();

        // Update the bar chart after applying filters
        if (this.selectedProject) {
            this.filterBarChartByRole();
            this.renderProjectTable();
        } else {
            // If no project is selected, reset bar chart data
            this.barChartData = null;
            this.projectTableData = [];
            this.cdr.detectChanges(); // Force change detection for resetting the chart
        }
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
                    hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#FF8A65', '#4DD0E1', '#DCE775', '#FFD54F', '#A1887F', '#90A4AE']
                }
            ]
        };

        this.pieChartOptions = {
            responsive: true,
            cutout: '50%', // <-- This turns it into a donut chart
            onClick: (evt: any, activeEls: any[]) => {
                if (activeEls.length > 0) {
                    const chart = activeEls[0].element.$context.chart;
                    const index = activeEls[0].index;
                    const label = chart.data.labels[index];
                    this.selectedProject = label;
                    this.selectedProjectData = projectDataMap[label] || [];
                    this.selectedRole = '';
                    this.availableRoles = [...new Set(this.selectedProjectData.map((c) => c.Role).filter(Boolean))];

                    this.renderBarChart(this.selectedProjectData);
                    this.renderProjectTable(); // <-- New line to update table
                    this.cdr.detectChanges();
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
        // Prepare an array for the table data
        this.projectTableData = [...this.selectedProjectData];

        // Logic for rowspan of the first three columns
        if (this.projectTableData.length > 0) {
            let prevProject = '';
            let prevContractName = '';
            let prevProjectManager = '';

            this.projectTableData.forEach((row, index) => {
                // For the 'Project' column, display it only once if it's the same as the previous row's value
                if (row.Project === prevProject) {
                    row.projectRowspan = 0; // Skip rendering this cell by setting rowspan to 0
                } else {
                    row.projectRowspan = this.projectTableData.filter((item) => item.Project === row.Project).length;
                }

                if (row['Work Contract Name'] === prevContractName) {
                    row.contractNameRowspan = 0;
                } else {
                    row.contractNameRowspan = this.projectTableData.filter((item) => item['Work Contract Name'] === row['Work Contract Name']).length;
                }

                if (row['Project Manager'] === prevProjectManager) {
                    row.projectManagerRowspan = 0;
                } else {
                    row.projectManagerRowspan = this.projectTableData.filter((item) => item['Project Manager'] === row['Project Manager']).length;
                }

                // Update the previous row values to check for repetition
                prevProject = row.Project;
                prevContractName = row['Work Contract Name'];
                prevProjectManager = row['Project Manager'];
            });
        }

        this.cdr.detectChanges(); // Trigger change detection after updating the table data
    }
}
