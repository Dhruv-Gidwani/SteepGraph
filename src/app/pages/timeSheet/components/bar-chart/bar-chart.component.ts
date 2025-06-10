import { Component, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    @Input() data: any[] = [];
    @Input() selectedDepartment: string | null = null;
    @Input() selectedGeography: string | null = null;
    @Output() departmentClick = new EventEmitter<string>();
    @Input() isExpanded: boolean = false;
    @Input() expandedComponent: 'pie' | 'bar' | 'table' | null = null;
    @Output() toggleExpand = new EventEmitter<'bar'>();

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
        let filteredData = [...this.data];
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
    onDepartmentClick(department: string): void {
        if (this.selectedDepartment === department) {
            // Toggle off (reset to All/default)
            this.selectedDepartment = null;
            this.departmentClick.emit('');
        } else {
            this.selectedDepartment = department;
            this.departmentClick.emit(department);
        }
    }
    private initializeChartOptions(): void {
        this.barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            onClick: (evt: any, activeEls: any[]) => {
                if (activeEls.length > 0) {
                    const chart = activeEls[0].element.$context.chart;
                    const index = activeEls[0].index;
                    const department = chart.data.labels[index];
                    // this.departmentClick.emit(department);
                    this.onDepartmentClick(department);
                }
            },
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
                    bottom: 25
                }
            }
        };
    }
}
