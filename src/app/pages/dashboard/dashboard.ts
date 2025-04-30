import { Component, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { ApiService } from '../../services/tgv.service';
// import { ArasService } from '../../services/aras.service';
import { ArasService } from '../../services/aras.service';
import { parseString } from 'xml2js';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {
    constructor(
        private apiService: ApiService,
        private arasService: ArasService
    ) {}

    // ngOnInit(): void {
    //     this.apiService.getTreeGridData().subscribe({
    //         next: (data) => {

    //             console.log('Tree Grid Data:', data);
    //         },
    //         error: (error) => {
    //             console.error('Error fetching data:', error);
    //         }
    //     });
    // }

    rawTreeGridData: any;
    transformedTreeGridData: any;

    ngOnInit(): void {
        this.apiService.getTreeGridData().subscribe({
            next: (data) => {
                // 1. Show RAW tree grid data
                this.rawTreeGridData = data;
                console.log('Raw Tree Grid Data:', this.rawTreeGridData);

                // 2. Extract headers and transform grid rows
                const headers = data.HeaderResult.map((header: any) => header.label);
                const gridRows = data.GridRows;

                const transformedData = gridRows.map((row: any) => {
                    const result: Record<string, any> = {};
                    result['Level'] = '1';

                    if (Array.isArray(row.cells)) {
                        row.cells.forEach((cell: any, index: number) => {
                            const key = headers[index] ?? `Unknown_${index}`;
                            const value = cell?.value ?? null;
                            result[key] = value;
                        });
                    }

                    return result;
                });

                // 3. Save and log the transformed data
                this.transformedTreeGridData = transformedData;
                console.log('Transformed Data:', this.transformedTreeGridData);
                console.log('First Row Sample:', this.transformedTreeGridData[0]);
                console.table(this.transformedTreeGridData);
            },
            error: (error) => {
                console.error('Error fetching data:', error);
            }
        });
    }
}
