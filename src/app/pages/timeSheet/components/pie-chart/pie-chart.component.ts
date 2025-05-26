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
    @Output() geographyClick = new EventEmitter<string>();
    @Output() geographySelected = new EventEmitter<{ geography: string; index: number }>();

    firstGeography: string | null = null; //new
    pieChartData: any;
    pieChartOptions: any;
    displayedGeographies: string[] = [];
    private isFirstLoad = true;
    

    // ngOnChanges(): void {
    //     this.renderPieChart();

    //     const labels = this.pieChartData?.labels || [];

    //     if (labels.length > 1) {
    //         this.displayedGeographies = ['All', ...labels];

    //         if (this.isFirstLoad) {
    //             this.geographySelected.emit({ geography: 'All', index: -1 });
    //             this.isFirstLoad = false;
    //         }
    //     } else {
    //         this.displayedGeographies = labels;

    //         if (this.isFirstLoad && labels.length === 1) {
    //             this.geographySelected.emit({ geography: labels[0], index: 0 });
    //             this.isFirstLoad = false;
    //         }
    //     }
    // }
    ngOnChanges(): void {
        this.renderPieChart();

        const labels = this.pieChartData?.labels || [];

        if (labels.length > 1) {
            this.displayedGeographies = ['All', ...labels];
            // Set the first geography to be highlighted
            this.firstGeography = 'All';

            if (this.isFirstLoad) {
                this.geographySelected.emit({ geography: 'All', index: -1 });
                this.isFirstLoad = false;
            }
        } else {
            this.displayedGeographies = labels;
            // Set the first geography to be highlighted if available
            this.firstGeography = labels[0] || null;

            if (this.isFirstLoad && labels.length === 1) {
                this.geographySelected.emit({ geography: labels[0], index: 0 });
                this.isFirstLoad = false;
            }
        }
    }

    //geographyClick for simple string-based filtering
    //geographySelected for internal visual selection (like highlighting the selected item)
    onGeographyClick(geography: string): void {
    const index = geography === 'All' ? -1 : this.pieChartData.labels.indexOf(geography);

    // this.geographySelected.emit({ geography: geography === 'All' ? '' : geography, index });
    // this.geographyClick.emit(geography === 'All' ? '' : geography);
     if (this.selectedGeography === geography) {
    // User clicked the same geography again → toggle to 'All'
    this.selectedGeography = 'All';
    this.selectedGeographyIndex = -1;
    this.geographySelected.emit({ geography: '', index: -1 });
    this.geographyClick.emit('');
  } else {
    // User clicked a new geography
    this.selectedGeography = geography;
    this.selectedGeographyIndex = index;
    this.geographySelected.emit({ geography: geography === 'All' ? '' : geography, index });
    this.geographyClick.emit(geography === 'All' ? '' : geography);
  }

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
                    this.geographyClick.emit(geography);
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
        return `${label}_Employee: ${value} (${percentage}%)`;
    }
}
