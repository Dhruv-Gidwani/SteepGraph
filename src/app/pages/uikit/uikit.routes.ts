import { Routes } from '@angular/router';
import { ChartDemo } from './chartdemo';

export default [
    { path: 'charts', data: { breadcrumb: 'Charts' }, component: ChartDemo },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
