import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { Contract } from '../interfaces/interface';
@Component({
    selector: 'app-pie-chart',
    imports: [ChartModule, CommonModule],
    templateUrl: './pie-chart.component.html',
    styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements OnChanges {
    @Input() contracts: Contract[] = [];
    @Input() selectedProject: string | null = null;
    @Input() selectedProjectIndex: number | null = null;

    @Output() projectSelected = new EventEmitter<{ project: string; index: number }>();

    pieChartData: any;
    pieChartOptions: any;
    private isFirstLoad = true;

    ngOnChanges(): void {
        this.renderPieChart();

    // Auto-select first project only on first load
    if (this.isFirstLoad && this.pieChartData?.labels?.length > 0) {
        const firstProject = this.pieChartData.labels[0];
        this.projectSelected.emit({ project: firstProject, index: 0 });
        this.isFirstLoad = false;
    }
    }

    onProjectClick(project: string): void {
        const index = this.pieChartData?.labels.indexOf(project) ?? -1;
        this.projectSelected.emit({ project, index });
    }

    private renderPieChart(): void {
        const projectCountMap = this.calculateProjectCounts();
        const labels = Object.keys(projectCountMap);
        const data = Object.values(projectCountMap);

        this.pieChartData = this.createChartData(labels, data);
        this.pieChartOptions = this.createChartOptions();

        // If no project is selected, select the first one
        if (!this.selectedProject && labels.length > 0) {
            const firstProject = labels[0];
            this.projectSelected.emit({ project: firstProject, index: 0 });
        }
    }

    private calculateProjectCounts(): { [project: string]: number } {
        return this.contracts.reduce(
            (acc, contract) => {
                const project = contract.Project || 'Unknown';
                acc[project] = (acc[project] || 0) + 1;
                return acc;
            },
            {} as { [project: string]: number }
        );
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
            cutout: '50%',
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

    private createTooltipLabel(context: any): string {
        const label = context.label || '';
        const value = context.raw || 0;
        const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        return `${label}: ${value} (${percentage}%)`;
    }
}
