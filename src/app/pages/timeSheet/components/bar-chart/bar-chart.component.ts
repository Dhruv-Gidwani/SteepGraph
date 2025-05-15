import { Component, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [ChartModule, CommonModule, FormsModule],
    templateUrl: './bar-chart.component.html',
    styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent implements OnChanges {
    @Input() data: any[] = [];
    @Input() selectedDepartment: string | null = null;
    @Input() selectedGeography: string | null = null; 

    barChartData: any;
    barChartOptions: any;

    ngOnChanges(): void {
        this.renderBarChart();
    }

    private renderBarChart(): void {
        const departmentData = this.calculateDepartmentData();
        this.createChartData(departmentData);
        this.initializeChartOptions();
    }

    private calculateDepartmentData(): { [key: string]: number } {
        const filteredData = this.selectedGeography
            ? this.data.filter(item => item.sg_geography === this.selectedGeography)
            : this.data;

        return filteredData.reduce(
            (acc, item) => {
                const department = item.sg_employee_department || 'Unknown';
                acc[department] = (acc[department] || 0) + 1;
                return acc;
            },
            {} as { [key: string]: number }
        );
    }

    private createChartData(departmentData: { [key: string]: number }): void {
        const labels = Object.keys(departmentData).sort();
        const counts = labels.map((label) => departmentData[label]);

        this.barChartData = {
            labels,
            datasets: [
                {
                    label: 'Employee Count',
                    backgroundColor: '#42A5F5',
                    data: counts
                }
            ]
        };
    }

    private initializeChartOptions(): void {
        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Employee Count',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 20,
                    bottom: 20
                }
            }
        };
    }
}
