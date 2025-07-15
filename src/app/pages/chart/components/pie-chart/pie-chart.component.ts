import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { Contract } from '../interfaces/interface';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
@Component({
    selector: 'app-pie-chart',
    imports: [ChartModule, CommonModule, ButtonModule, TooltipModule],
    templateUrl: './pie-chart.component.html',
    styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements OnChanges {
    @Input() contracts: Contract[] = [];
    @Input() selectedProject: string | null = null;
    @Input() selectedProjectIndex: number | null = null;

    @Output() projectSelected = new EventEmitter<{ project: string; index: number }>();

    @Output() toggleExpand = new EventEmitter<'pie'>();
    @Input() isExpanded: boolean = false;
    @Input() expandedComponent: 'pie' | 'bar' | 'table' | null = null;

    pieChartData: any;
    pieChartOptions: any;
    private isFirstLoad = true;
    projectEmployeeCounts: { [project: string]: number } = {};

    ngOnChanges(): void {
        this.renderPieChart();
    }

    onProjectClick(project: string): void {
        const index = this.pieChartData?.labels.indexOf(project) ?? -1;
        this.projectSelected.emit({ project, index });
    }

    private renderPieChart(): void {
        this.projectEmployeeCounts = this.calculateProjectEmployeeCounts();
        const labels = Object.keys(this.projectEmployeeCounts);
        const data = Object.values(this.projectEmployeeCounts);

        this.pieChartData = this.createChartData(labels, data);
        this.pieChartOptions = this.createChartOptions();

        // Only select first project if none is selected
        if (!this.selectedProject && labels.length > 0 && this.isFirstLoad) {
            const firstProject = labels[0];
            this.projectSelected.emit({ project: firstProject, index: 0 });
            this.isFirstLoad = false;
        }

        // Update the offset for the selected project
        if (this.pieChartData?.datasets?.[0]) {
            this.pieChartData.datasets[0].offset = labels.map((_, index) => (index === this.selectedProjectIndex ? 20 : 0));
        }
    }

    private calculateProjectEmployeeCounts(): { [project: string]: number } {
        const projectEmployeeMap: { [project: string]: Set<string> } = {};

        for (const contract of this.contracts) {
            const project = contract.Project || 'Unknown';
            const employee = contract['Resource Name'] || 'Unknown';
            if (!projectEmployeeMap[project]) {
                projectEmployeeMap[project] = new Set();
            }
            projectEmployeeMap[project].add(employee);
        }

        // Convert sets to counts
        const result: { [project: string]: number } = {};
        for (const project in projectEmployeeMap) {
            result[project] = projectEmployeeMap[project].size;
        }
        return result;
    }

    private createChartData(labels: string[], data: number[]): any {
        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26C6DA', '#D4E157', '#FFCA28', '#8D6E63', '#78909C'],
                    hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#FF8A65', '#4DD0E1', '#DCE775', '#FFD54F', '#A1887F', '#90A4AE'],
                    offset: labels.map((_, index) => (index === this.selectedProjectIndex ? 20 : 0))
                }
            ]
        };
    }
    private createChartOptions(): any {
        return {
            responsive: true,
            cutout: '40%',
            onClick: (evt: any, activeEls: any[]) => {
                if (activeEls.length > 0) {
                    const chart = activeEls[0].element.$context.chart;
                    const index = activeEls[0].index;
                    const project = chart.data.labels[index];
                    this.projectSelected.emit({ project, index });
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: this.createTooltipLabel
                    }
                }
            }
        };
    }

    private createTooltipLabel = (context: any): string => {
        const label = context.label || '';
        // Use the unique employee count for this project
        const value = this.projectEmployeeCounts[label] || 0;
        const total = Object.values(this.projectEmployeeCounts).reduce((a, b) => a + b, 0);
        const percentage = total ? ((value / total) * 100).toFixed(1) : '0.0';
        return `${label}: ${value} (${percentage}%)`;
    };

    get totalUniqueEmployees(): number {
        return Object.values(this.projectEmployeeCounts).reduce((a, b) => a + b, 0);
    }

    getProjectPercentage(project: string): string {
        const count = this.projectEmployeeCounts[project] || 0;
        const total = this.totalUniqueEmployees;
        return total ? ((count / total) * 100).toFixed(1) : '0.0';
    }
}
