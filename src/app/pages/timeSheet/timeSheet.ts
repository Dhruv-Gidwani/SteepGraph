import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ApiService } from '../../services/tgv.service';
import { parseString } from 'xml2js';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ExportService } from './components/project-table/Excel/excel';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderComponent } from './components/loader/loader.component';
import { timeSheetService } from '../../services/timeSheet.service';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { CardModule } from 'primeng/card';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
@Component({
    selector: 'app-timeSheet-demo',
    standalone: true,
    imports: [CommonModule, ChartModule, FluidModule, FormsModule, TableModule, ScrollPanelModule, SplitButtonModule, ButtonModule, ProjectTableComponent, ProgressSpinnerModule, LoaderComponent, PieChartComponent, CardModule, BarChartComponent],
    templateUrl: './timeSheet.html'
})
export class timeSheetDemo implements OnInit {
    isLoading: boolean = false;
    allContracts: any[] = [];
    filteredContracts: any[] = [];
    selectedProjectData: any[] = [];
    projectTableData: any[] = [];
    rawProjectData: any[] = [];
    selectedProject: string | null = null;
    selectedProjectIndex: number | null = null;
    selectedGeography: string | null = null;
    selectedGeographyIndex: number | null = null;
    selectedDepartment: string | null = null;

    filters = {
        startDate: '',
        endDate: ''
    };

    exportOptions: MenuItem[] | undefined;

    cwoStartDate: string = '';
    cwoEndDate: string = '';
    cwoStatus: string = '';

    
    constructor(
        private ApiService: ApiService,
        private cdr: ChangeDetectorRef,
        private exportService: ExportService,
        private timeSheetService: timeSheetService,
        private ngZone: NgZone
    ) {}

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
    };

    ngOnInit(): void {
        this.isLoading = true;

        this.timeSheetService.fetchtimeSheetItem().subscribe({
            next: (xmlData: string) => {
                parseString(xmlData, { explicitArray: false }, (err, result) => {
                    if (err) {
                        console.error('Error parsing XML', err);
                        this.isLoading = false;
                        return;
                    }

                    console.log('Parsed result:', result);
                    this.ngZone.run(() => {
                        const items = result?.['SOAP-ENV:Envelope']?.['SOAP-ENV:Body']?.Result?.Item;
                        const flatItems = Array.isArray(items) ? items : [items];

                        console.log('Raw items:', flatItems);

                        this.rawProjectData = flatItems
                            .filter((item) => !!item)
                            .map((item: any) => {
                                return {
                                    sg_employee: item?.sg_employee?.$?.keyed_name || 'N/A',
                                    sg_position_title: item?.sg_position_title?.$?.keyed_name || 'N/A',
                                    sg_employee_department: item?.sg_employee_department?.$?.keyed_name || 'N/A',
                                    ts_task_project: item?.sg_ts_task_project?.$?.keyed_name || 'N/A',
                                    sg_geography: item?.sg_geography || 'N/A',
                                    sg_role: item?.sg_role || 'N/A',
                                    billing_status: item?.sg_billing_status || 'N/A',
                                    billableqty: item?.sg_billableqty || '0'
                                };
                            });

                        this.groupProjectData(); // Call the grouping function here
                        console.log('raw projectTableData:', this.rawProjectData);
                        console.log('Mapped projectTableData:', this.projectTableData);
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    });
                });
            },
            error: (err) => {
                console.error('Error fetching timesheet data', err);
                this.isLoading = false;
            }
        });
    }

    onGeographySelected(event: { geography: string; index: number }): void {
        this.selectedGeography = event.geography;
        this.selectedGeographyIndex = event.index;
    }

    groupProjectData() {
        const result: {
            [employee: string]: {
                employeeMeta: {
                    sg_position_title: string;
                    sg_employee_department: string;
                    sg_geography: string;
                    sg_role: string;
                };
                projects: {
                    [project: string]: {
                        billing_status: string;
                        billableqty: number;
                    }[];
                };
            };
        } = {};

        this.rawProjectData.forEach((entry) => {
            const employee = entry.sg_employee;
            const project = entry.ts_task_project;
            const billing_status = entry.billing_status;
            const billableqty = parseFloat(entry.billableqty) || 0;

            if (!result[employee]) {
                result[employee] = {
                    employeeMeta: {
                        sg_position_title: entry.sg_position_title,
                        sg_employee_department: entry.sg_employee_department,
                        sg_geography: entry.sg_geography,
                        sg_role: entry.sg_role
                    },
                    projects: {}
                };
            }

            if (!result[employee].projects[project]) {
                result[employee].projects[project] = [];
            }

            result[employee].projects[project].push({ billing_status, billableqty });
        });

        // Convert to array format for easier iteration in HTML
        this.projectTableData = Object.entries(result).map(([employee, data]) => ({
            employee,
            sg_position_title: data.employeeMeta.sg_position_title,
            sg_employee_department: data.employeeMeta.sg_employee_department,
            sg_geography: data.employeeMeta.sg_geography,
            sg_role: data.employeeMeta.sg_role,
            projects: Object.entries(data.projects).map(([project, statuses]) => {
                const aggregated = statuses.reduce(
                    (acc, item) => {
                        if (!acc[item.billing_status]) {
                            acc[item.billing_status] = 0;
                        }
                        acc[item.billing_status] += item.billableqty;
                        return acc;
                    },
                    {} as { [status: string]: number }
                );

                return {
                    project,
                    billingDetails: Object.entries(aggregated).map(([status, total]) => ({
                        billing_status: status,
                        total_hours: total
                    }))
                };
            })
        }));
    }
}
