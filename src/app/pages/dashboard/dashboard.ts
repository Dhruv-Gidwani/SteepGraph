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

    rawTreeGridData: any;
    transformedTreeGridData: any;

        ngOnInit(): void {
        this.apiService.getTreeGridData().subscribe({
            next: (transformedData) => {
                // Save transformed data
                this.transformedTreeGridData = transformedData;
    
                // Display in the console
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
