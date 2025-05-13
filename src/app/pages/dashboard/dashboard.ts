import { Component, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerBasicDemo } from './components/loader';


@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget ,ProgressSpinnerBasicDemo ,CommonModule],
    template: `
    <ng-container *ngIf="isLoading; else dashboardContent">
        <progress-spinner-basic-demo />
    </ng-container>

    <ng-template #dashboardContent>
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
    </ng-template>
`
})
export class Dashboard implements OnInit {
    constructor(
    ) { }
    isLoading = true;
    rawTreeGridData: any;
    transformedTreeGridData: any;

    ngOnInit(): void {
        setTimeout(() => {
            this.isLoading = false;
          }, 1000);

    }
}
