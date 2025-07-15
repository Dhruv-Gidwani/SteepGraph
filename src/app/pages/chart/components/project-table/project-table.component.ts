import { Component, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { TableData, MonthData } from '../interfaces/interface';
import { ExportService } from './Excel/excel';
import { TooltipModule } from 'primeng/tooltip';
@Component({
    selector: 'app-project-table',
    imports: [ChartModule, CommonModule, TableModule, ButtonModule, MultiSelectModule, FormsModule, TooltipModule],
    providers: [ExportService],
    templateUrl: './project-table.component.html',
    styleUrl: './project-table.component.scss'
})
export class ProjectTableComponent implements OnChanges {
    @Input() data: TableData[] = [];
    @Input() isExpanded: boolean = false;
    @Input() expandedComponent: 'pie' | 'bar' | 'table' | null = null;
    @Output() toggleExpand = new EventEmitter<'table'>();

    @ViewChild('dt2') table!: Table;

    displayedData: TableData[] = [];
    ProjectNames: string[] = [];
    WorkContractNames: string[] = [];
    PWONames: string[] = [];
    ResourcesNames: string[] = [];
    TSapproverNames: string[] = [];
    ProjectManagerNames: string[] = [];
    CWOStatusOptions: string[] = [];
    CurrencyOptions: string[] = [];
    BillingMethod: string[] = [];
    RateCard: string[] = [];
    Role: string[] = [];
    PositionTitle: string[] = [];
    BillingStatus: string[] = [];
    currentYear: number = new Date().getFullYear();

    constructor(private exportService: ExportService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.processTableData();
            this.updateProjectNames();
            this.updateWorkContractNames();
            this.updatePWONames();
            this.updateRepresentativeNames();
            this.updateTSapproverNames();
            this.updateProjectManagerNames();
            this.updateCWOStatusOptions();
            this.updateCurrencyOptions();
            this.updateBillingMethodNames();
            this.updateRateCardNames();
            this.updateRoleNames();
            this.updatePositionTitleNames();
            this.updateBillingStatusNames();
            console.log('Initial data:', this.data);
        }
    }

    public formatDates(row: TableData): { [key: string]: any } {
        // const formatDate = (dateString: string): string => {
        //     const date = new Date(dateString);
        //     return !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : '';
        // };
        const formatDate = (dateString: string): string => {
            if (!dateString) return '';
            // Use only the date part, ignore the time and timezone
            return dateString.split('T')[0];
        };

        const formattedLastTsDate = formatDate(row['Last Ts Date']);
        const formattedStart = formatDate(row['Start Date']);
        const formattedEnd = formatDate(row['End Date']);

        return {
            'Last Ts Date': formattedLastTsDate,
            'Start Date': formattedStart,
            'End Date': formattedEnd,
            'Last Ts Date Object': formattedLastTsDate ? new Date(formattedLastTsDate) : null,
            'Start Date Object': formattedStart ? new Date(formattedStart) : null,
            'End Date Object': formattedEnd ? new Date(formattedEnd) : null
        };
    }

    private processTableData(): void {
        this.displayedData = this.data.map((row) => {
            const formatted = this.formatDates(row);
            const monthMap = this.createMonthMap(formatted);
            const lastTsDate = new Date(row['Last Ts Date']);
            const startDate = new Date(row['Start Date']);
            const endDate = new Date(row['End Date']);

            return {
                ...row,
                ...formatted,
                ...monthMap,
                // Keep original string dates for display
                'Last Ts Date': formatted['Last Ts Date'],
                'Start Date': formatted['Start Date'],
                'End Date': formatted['End Date'],
                // Add date objects and timestamps for sorting
                'Last Ts Date Object': lastTsDate,
                'Start Date Object': startDate,
                'End Date Object': endDate,
                startDateSort: startDate.getTime(),
                endDateSort: endDate.getTime(),
                // Maintain the existing numeric conversions
                ResUti: Number(row['Resource Utilization']),
                HrRate: Number(row['Hourly Rate']),
                alloHrs: Number(row['Allocated Hrs.']),
                consumedHrs: Number(row['Consumed Hrs.']),
                remHrs: Number(row['Rem. Hrs.'])
            };
        });

        // Sort by Work Contract Name, then by Resource Name
        this.displayedData.sort((a, b) => {
            const wcA = (a['Work Contract Name'] || '').toLowerCase();
            const wcB = (b['Work Contract Name'] || '').toLowerCase();
            if (wcA < wcB) return -1;
            if (wcA > wcB) return 1;
            // If WC is the same, sort by Resource Name
            const resA = (a['Resource Name'] || '').toLowerCase();
            const resB = (b['Resource Name'] || '').toLowerCase();
            if (resA < resB) return -1;
            if (resA > resB) return 1;
            return 0;
        });

        this.updateProjectNames();
        this.updateWorkContractNames();
        this.updatePWONames();
        this.updateRepresentativeNames();
        this.updateTSapproverNames();
        this.updateProjectManagerNames();
        this.updateCWOStatusOptions();
        this.updateCurrencyOptions();
        this.updateBillingMethodNames();
        this.updateRateCardNames();
        this.updateRoleNames();
        this.updatePositionTitleNames();
        this.updateBillingStatusNames();
    }
    onGlobalFilter(event: Event, table: Table): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    private createMonthMap(row: { [key: string]: any }): { monthData: { [key: string]: MonthData } } {
        const monthData: { [key: string]: MonthData } = {};
        const formattedStartDate = row['Start Date']; // Should be 'YYYY-MM-DD'
        const formattedEndDate = row['End Date'];

        if (!formattedStartDate || !formattedEndDate) {
            return { monthData };
        }

        const [startYear, startMonth, startDay] = formattedStartDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = formattedEndDate.split('-').map(Number);
        const currentYear = new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        months.forEach((month) => {
            monthData[`${month}-${currentYear}`] = {
                day: '',
                color: 'transparent'
            };
        });

        if (startYear <= currentYear && endYear >= currentYear) {
            const yearStartMonth = startYear < currentYear ? 0 : startMonth - 1;
            const yearEndMonth = endYear > currentYear ? 11 : endMonth - 1;

            for (let i = yearStartMonth; i <= yearEndMonth; i++) {
                const monthKey = `${months[i]}-${currentYear}`;
                monthData[monthKey].color = '#22c55e';
            }

            // Defensive: Only assign day if valid
            if (startYear === currentYear && Number.isInteger(startMonth) && startMonth >= 1 && startMonth <= 12 && Number.isInteger(startDay) && startDay >= 1 && startDay <= 31) {
                const startMonthKey = `${months[startMonth - 1]}-${currentYear}`;
                if (monthData[startMonthKey]) {
                    monthData[startMonthKey].day = String(startDay);
                }
            }
            if (endYear === currentYear && Number.isInteger(endMonth) && endMonth >= 1 && endMonth <= 12 && Number.isInteger(endDay) && endDay >= 1 && endDay <= 31) {
                const endMonthKey = `${months[endMonth - 1]}-${currentYear}`;
                if (monthData[endMonthKey]) {
                    monthData[endMonthKey].day = String(endDay);
                }
            }
        }

        return { monthData };
    }

    private formatDate(dateString: string): string | null {
        const date = new Date(dateString);
        return !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
    }
    private updateProjectNames(): void {
        this.ProjectNames = [...new Set(this.displayedData.map((row) => row['Project']).filter(Boolean))];
    }
    private updateWorkContractNames(): void {
        this.WorkContractNames = [...new Set(this.displayedData.map((row) => row['Work Contract Name']).filter(Boolean))];
    }
    private updatePWONames(): void {
        this.PWONames = [...new Set(this.displayedData.map((row) => row['PWO Name']).filter(Boolean))];
    }
    private updateRepresentativeNames(): void {
        this.ResourcesNames = [...new Set(this.displayedData.map((row) => row['Resource Name']).filter(Boolean))];
    }
    private updateTSapproverNames(): void {
        this.TSapproverNames = [...new Set(this.displayedData.map((row) => row['TS Approver']).filter(Boolean))];
    }
    private updateProjectManagerNames(): void {
        this.ProjectManagerNames = [...new Set(this.displayedData.map((row) => row['Project Manager']).filter(Boolean))];
    }
    private updateCWOStatusOptions(): void {
        this.CWOStatusOptions = [...new Set(this.displayedData.map((row) => row['WCT Status']).filter(Boolean))];
    }
    private updateCurrencyOptions(): void {
        this.CurrencyOptions = [...new Set(this.displayedData.map((row) => row['Currency']).filter(Boolean))];
    }
    private updateBillingMethodNames(): void {
        this.BillingMethod = [...new Set(this.displayedData.map((row) => row['Billing Method']).filter(Boolean))];
    }
    private updateRateCardNames(): void {
        this.RateCard = [...new Set(this.displayedData.map((row) => row['Rate Card']).filter(Boolean))];
    }
    private updateRoleNames(): void {
        this.Role = [...new Set(this.displayedData.map((row) => row['Position Role']).filter(Boolean))];
    }
    private updatePositionTitleNames(): void {
        this.PositionTitle = [...new Set(this.displayedData.map((row) => row['Position Title']).filter(Boolean))];
    }
    private updateBillingStatusNames(): void {
        this.BillingStatus = [...new Set(this.displayedData.map((row) => row['Billing Status']).filter(Boolean))];
    }

    exportToExcel(): void {
        const exportData = this.displayedData.map((row) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Define proper type for monthValues
            const monthValues: { [key: string]: string } = {};

            months.forEach((month) => {
                const monthKey = `${month}-${this.currentYear}`;
                monthValues[month] = row.monthData?.[monthKey]?.day || '';
            });

            return {
                Project: row.Project,
                'Work Contract Name': row['Work Contract Name'],
                'PWO Name': row['PWO Name'],
                'Resource Name': row['Resource Name'],
                'Allocated Hrs.': row['Allocated Hrs.'],
                'Consumed Hrs.': row['Consumed Hrs.'],
                'Rem. Hrs.': row['Rem. Hrs.'],
                'Billing Status': row['Billing Status'],
                'Rate Card': row['Rate Card'],
                'Position Role': row['Position Role'],
                'TS Approver': row['TS Approver'],
                'Position Title': row['Position Title'],
                'Resource Utilization': row['Resource Utilization'],
                'Hourly Rate': row['Hourly Rate'],
                'Billing Method': row['Billing Method'],
                'Project Manager': row['Project Manager'],
                'WCT Status': row['WCT Status'],
                Currency: row['Currency'],
                'Last Ts Date': row['Last Ts Date'],
                'Start Date': row['Start Date'],
                'End Date': row['End Date'],
                ...monthValues
            };
        });

        this.exportService.exportToExcel(exportData);
    }
}
