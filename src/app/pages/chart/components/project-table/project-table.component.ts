import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';
import { TableData, MonthData } from '../interfaces/interface';
import { ExportService } from './Excel/excel';

@Component({
    selector: 'app-project-table',
    imports: [ChartModule, CommonModule, TableModule, ButtonModule, MultiSelectModule, FormsModule],
    providers: [ExportService],
    templateUrl: './project-table.component.html',
    styleUrl: './project-table.component.scss'
})
export class ProjectTableComponent implements OnChanges {
    @Input() data: TableData[] = [];

    @ViewChild('dt2') table!: Table;
    
    displayedData: TableData[] = [];
    ResourcesNames: string[] = [];
    TSapproverNames: string[] = [];
    BillingMethod: string[] = [];
    Role: string[] = [];
    PositionTitle: string[] = [];
    BillingStatus: string[] = [];
    currentYear: number = new Date().getFullYear();

    constructor(private exportService: ExportService) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.processTableData();
            this.updateRepresentativeNames();
            this.updateTSapproverNames();
            this.updateBillingMethodNames();
            this.updateRoleNames();
            this.updatePositionTitleNames();
            this.updateBillingStatusNames();
             console.log('Initial data:', this.data);
        }
    }

    public formatDates(row: TableData): { [key: string]: any } {
        const formatDate = (dateString: string): string => {
            const date = new Date(dateString);
            return !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : '';
        };

        const formattedStart = formatDate(row['Start Date']);
        const formattedEnd = formatDate(row['End Date']);

        return {
            'Start Date': formattedStart,
            'End Date': formattedEnd,
            'Start Date Object': formattedStart ? new Date(formattedStart) : null,
            'End Date Object': formattedEnd ? new Date(formattedEnd) : null
        };
    }

    // private processTableData(): void {
    //     this.displayedData = this.data.map((row) => ({
    //         ...row,
    //         ...this.formatDates(row),
    //         ...this.createMonthMap(row)
    //     }));
    //     //this.calculateRowspan();
    //     this.updateRepresentativeNames();
    // }
    // private processTableData(): void {
    //     this.displayedData = this.data.map((row) => {
    //         const formatted = this.formatDates(row);
    //         const monthMap = this.createMonthMap(row);

    //         return {
    //             ...row,
    //             ...formatted,
    //             ...monthMap,
    //             // Convert dates to Date objects for sorting
    //             'Start Date': new Date(row['Start Date']),
    //             'End Date': new Date(row['End Date']),
    //             // Maintain the existing numeric conversions
    //             ResUti: Number(row['Resource Utilization']),
    //             HrRate: Number(row['Hourly Rate']),
    //             alloHrs: Number(row['Allocated Hrs.']),
    //             remHrs: Number(row['Rem. Hrs.']),
    //             // Add sortable date fields
    //             startDateSort: new Date(row['Start Date']).getTime(),
    //             endDateSort: new Date(row['End Date']).getTime()
    //         };
    //     });

    //     this.updateRepresentativeNames();
    // }
    private processTableData(): void {
    this.displayedData = this.data.map((row) => {
        const formatted = this.formatDates(row);
        const monthMap = this.createMonthMap(row);
        const startDate = new Date(row['Start Date']);
        const endDate = new Date(row['End Date']);

        return {
            ...row,
            ...formatted,
            ...monthMap,
            // Keep original string dates for display
            'Start Date': formatted['Start Date'],
            'End Date': formatted['End Date'],
            // Add date objects and timestamps for sorting
            'Start Date Object': startDate,
            'End Date Object': endDate,
            startDateSort: startDate.getTime(),
            endDateSort: endDate.getTime(),
            // Maintain the existing numeric conversions
            ResUti: Number(row['Resource Utilization']),
            HrRate: Number(row['Hourly Rate']),
            alloHrs: Number(row['Allocated Hrs.']),
            remHrs: Number(row['Rem. Hrs.'])
        };
    });

    this.updateRepresentativeNames();
    this.updateTSapproverNames();
    this.updateBillingMethodNames();
    this.updateRoleNames();
    this.updatePositionTitleNames();
    this.updateBillingStatusNames();
    
}
    onGlobalFilter(event: Event, table: Table): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    private createMonthMap(row: TableData): { monthData: { [key: string]: MonthData } } {
        const monthData: { [key: string]: MonthData } = {};
        const formattedStartDate = this.formatDate(row['Start Date']);
        const formattedEndDate = this.formatDate(row['End Date']);

        if (!formattedStartDate || !formattedEndDate) {
            return { monthData };
        }

        const startDate = new Date(formattedStartDate);
        const endDate = new Date(formattedEndDate);
        const currentYear = new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize all months with empty values and default background
        months.forEach((month) => {
            monthData[`${month}-${currentYear}`] = {
                day: '',
                color: 'transparent'
            };
        });

        // Only process if the dates are in the current year
        if (startDate.getFullYear() <= currentYear && endDate.getFullYear() >= currentYear) {
            const yearStartDate = startDate.getFullYear() < currentYear ? 0 : startDate.getMonth();
            const yearEndDate = endDate.getFullYear() > currentYear ? 11 : endDate.getMonth();

            // Fill in the progress bar
            for (let i = yearStartDate; i <= yearEndDate; i++) {
                const monthKey = `${months[i]}-${currentYear}`;
                monthData[monthKey].color = '#22c55e'; // Single green color #4CAF50
            }

            // Add start date if it's in current year
            if (startDate.getFullYear() === currentYear) {
                const startMonthKey = `${months[startDate.getMonth()]}-${currentYear}`;
                monthData[startMonthKey].day = String(startDate.getDate());
            }

            // Add end date if it's in current year
            if (endDate.getFullYear() === currentYear) {
                const endMonthKey = `${months[endDate.getMonth()]}-${currentYear}`;
                monthData[endMonthKey].day = String(endDate.getDate());
            }
        }

        return { monthData };
    }

    private formatDate(dateString: string): string | null {
        const date = new Date(dateString);
        return !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
    }

    private updateRepresentativeNames(): void {
        this.ResourcesNames = [...new Set(this.displayedData.map((row) => row['Resource Name']).filter(Boolean))];
    }
    private updateTSapproverNames(): void {
        this.TSapproverNames = [...new Set(this.displayedData.map((row) => row['TS Approver']).filter(Boolean))];
    }
    private updateBillingMethodNames(): void {
        this.BillingMethod = [...new Set(this.displayedData.map((row) => row['Billing Method']).filter(Boolean))];
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

            // Create the final export object
            return {
                Project: row.Project,
                'Work Contract Name': row['Work Contract Name'],
                'Project Manager': row['Project Manager'],
                'Billing Method': row['Billing Method'],
                'PWO Name': row['PWO Name'],
                'Position Role': row['Position Role'],
                'WCT Status': row['WCT Status'],
                'Resource Name': row['Resource Name'],
                'TS Approver': row['TS Approver'],
                'Position Title': row['Position Title'],
                'Billing Status': row['Billing Status'],
                'Resource Utilization': row['Resource Utilization'],
                'Hourly Rate': row['Hourly Rate'],
                Currency: row['Currency'],
                'Allocated Hrs.': row['Allocated Hrs.'],
                'Rem. Hrs.': row['Rem. Hrs.'],
                'Start Date': row['Start Date'],
                'End Date': row['End Date'],
                ...monthValues
            };
        });

        this.exportService.exportToExcel(exportData);
    }
}
