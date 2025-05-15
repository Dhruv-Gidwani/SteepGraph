import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pie-chart',
    imports: [ChartModule, CommonModule],
    templateUrl: './pie-chart.component.html',
    styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements OnChanges {
    @Input() data: any[] = [];
    @Input() selectedGeography: string | null = null;
    @Input() selectedGeographyIndex: number | null = null;

    @Output() geographySelected = new EventEmitter<{ geography: string; index: number }>();

    pieChartData: any;
    pieChartOptions: any;
    private isFirstLoad = true;

   
    ngOnChanges(): void {
        this.renderPieChart();

        // Auto-select first geography on first load
        if (this.isFirstLoad && this.pieChartData?.labels?.length > 0) {
            const firstGeography = this.pieChartData.labels[0];
            this.geographySelected.emit({ geography: firstGeography, index: 0 });
            this.isFirstLoad = false;
        }
    }
    
    onGeographyClick(geography: string): void {
        const index = this.pieChartData.labels.indexOf(geography);
        this.geographySelected.emit({ geography, index });
    }

    private renderPieChart(): void {
        const geographyCountMap = this.calculateGeographyCounts();
        const labels = Object.keys(geographyCountMap);
        const data = Object.values(geographyCountMap);

        this.pieChartData = this.createChartData(labels, data);
        this.pieChartOptions = this.createChartOptions();
    }

    private calculateGeographyCounts(): { [geography: string]: number } {
        return this.data.reduce(
            (acc, item) => {
                const geography = item.sg_geography || 'Unknown';
                acc[geography] = (acc[geography] || 0) + 1;
                return acc;
            },
            {} as { [geography: string]: number }
        );
    }

    private createChartData(labels: string[], data: number[]): any {
        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043'],
                    hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#FF8A65'],
                    offset: labels.map((_, index) => (index === this.selectedGeographyIndex ? 20 : 0))
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
                    const geography = chart.data.labels[index];
                    this.geographySelected.emit({ geography, index });
                }
            },
            plugins: {
                legend: {
                    display: false
                },
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
