import { Component, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contract } from '../interfaces/interface';

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [ChartModule, CommonModule, FormsModule],
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
        const labels = Object.keys(resourceMap).sort();
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
    }

    private initializeChartOptions(): void {
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
