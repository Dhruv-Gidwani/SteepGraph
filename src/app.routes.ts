import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { ChartDemo } from './app/pages/chart/chart';
import { Login } from './app/guards/login/login';
import { AuthGuard } from './app/guards/auth.guard';
import{timeSheetDemo} from './app/pages/timeSheet/timeSheet';
export const appRoutes: Routes = [
    { path: '', component: Login },

    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
            { path: 'workcontract', component: ChartDemo },
            { path: 'timesheet', component: timeSheetDemo },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },

    { path: '', redirectTo: '', pathMatch: 'full' }, // Default: Redirect to login

    { path: '**', redirectTo: '' }
];
