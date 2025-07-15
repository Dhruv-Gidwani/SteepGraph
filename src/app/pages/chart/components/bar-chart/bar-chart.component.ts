import { Component, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contract } from '../interfaces/interface';
import { Chart } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [ChartModule, CommonModule, FormsModule, ButtonModule, TooltipModule],
    templateUrl: './bar-chart.component.html',
    styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent implements OnChanges {
    @Input() contracts: Contract[] = [];
    @Input() selectedProject: string | null = null;
    @Input() availableRoles: string[] = [];
    @Input() uniqueBillingStatuses: string[] = [];
    @Input() selectedRole: string = '';
    @Input() selectedBillingStatus: string = '';
    @Input() isExpanded: boolean = false;
    @Input() expandedComponent: 'pie' | 'bar' | 'table' | null = null;
    @Output() toggleExpand = new EventEmitter<'bar'>();
    @Output() roleChanged = new EventEmitter<string>();
    @Output() billingStatusChanged = new EventEmitter<string>();

    barChartData: any;
    barChartOptions: any;

    ngOnChanges(): void {
        this.renderBarChart();
    }

    onRoleChange(role: string): void {
        this.roleChanged.emit(role);
        this.renderBarChart();
    }

    onBillingStatusChange(status: string): void {
        this.billingStatusChanged.emit(status);
        this.renderBarChart();
    }

    private renderBarChart(): void {
        const filteredData = this.filterData();
        const resourceMap = this.calculateResourceData(filteredData);
        this.createChartData(resourceMap);
        this.initializeChartOptions();
    }

    private filterData(): Contract[] {
        return this.contracts.filter((contract) => {
            const roleMatch = !this.selectedRole || contract['Position Role'] === this.selectedRole;
            const billingMatch = !this.selectedBillingStatus || contract['Billing Status'] === this.selectedBillingStatus;
            return roleMatch && billingMatch;
        });
    }

    private calculateResourceData(data: Contract[]): { [key: string]: { allocated: number; remaining: number } } {
        const resourceMap: { [key: string]: { allocated: number; remaining: number } } = {};

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

        return resourceMap;
    }

    private createChartData(resourceMap: { [key: string]: { allocated: number; remaining: number } }): void {
        // Create an array of [resource, allocated] pairs
        const resourceEntries = Object.entries(resourceMap);

        // Sort by allocated hours in descending order
        resourceEntries.sort((a, b) => b[1].allocated - a[1].allocated);

        // Extract sorted labels and data
        const labels = resourceEntries.map(([resource]) => resource);
        const allocatedData = resourceEntries.map(([, data]) => data.allocated);
        const remainingData = resourceEntries.map(([, data]) => data.remaining);

        // Calculate colors based on the ratio of remaining to allocated hours
        const remainingColors = resourceEntries.map(([, data]) => {
            const allocated = data.allocated;
            const remaining = data.remaining;
            const ratio = allocated > 0 ? remaining / allocated : 0;
            return ratio <= 0.3 ? '#FF4444' : '#66BB6A';
        });

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
                    backgroundColor: remainingColors,
                    data: remainingData
                }
            ]
        };
    }

    private initializeChartOptions(): void {
        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1.2,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        generateLabels: (chart: Chart) => {
                            return [
                                {
                                    text: 'Alloc.Hrs',
                                    fillStyle: '#42A5F5',
                                    strokeStyle: '#42A5F5',
                                    fontColor: '#42A5F5', // legacy property (fallback)
                                    color: '#42A5F5', // latest property used
                                    hidden: false,
                                    datasetIndex: 0
                                },
                                {
                                    text: 'Rem.Hrs: ≤30% of Alloc.',
                                    fillStyle: '#FF4444',
                                    strokeStyle: '#FF4444',
                                    fontColor: '#FF4444',
                                    color: '#FF4444',
                                    hidden: false,
                                    datasetIndex: 1
                                },
                                {
                                    text: 'Rem.Hrs: >30% of Alloc.',
                                    fillStyle: '#66BB6A',
                                    strokeStyle: '#66BB6A',
                                    fontColor: '#66BB6A',
                                    color: '#66BB6A',
                                    hidden: false,
                                    datasetIndex: 1
                                }
                            ];
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context: any) => {
                            const label = context.dataset.label;
                            const value = context.raw;
                            if (label === 'Rem. Hrs.') {
                                const allocated = context.chart.data.datasets[0].data[context.dataIndex];
                                const ratio = allocated > 0 ? ((value / allocated) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${ratio}% of Allocated)`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    ticks: { display: true }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours',
                        font: { size: 12 }
                    }
                }
            }
        };
    }
}
