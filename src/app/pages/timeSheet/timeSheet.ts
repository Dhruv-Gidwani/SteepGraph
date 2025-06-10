import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { XmlParserService } from '../../services/xml-parser.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ExportService } from './components/project-table/Excel/excel';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderComponent } from './components/loader/loader.component';
import { timeSheetService } from '../../services/timeSheet.service';
import { PositionService } from '../../services/position_title.service';
import { DepartmentService } from '../../services/department.service';
import { ProjectService } from '../../services/project.service';
import { EmployeeService } from '../../services/employee.service';
import { RegionService } from '../../services/region.service';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { CardModule } from 'primeng/card';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { MessageFormDemo } from '../../components/message-toast/message-toast.component';
import { MultiselectFilterDemo } from '../../components/multiselect/multiselect.component';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePickerIconDemo } from '../../components/date/date.component';
import { GlobalStateService } from '../../services/globalservicefilters';
@Component({
    selector: 'app-timeSheet-demo',
    standalone: true,
    imports: [
        DatePickerIconDemo,
        DatePickerModule,
        MultiselectFilterDemo,
        CommonModule,
        ChartModule,
        FluidModule,
        FormsModule,
        TableModule,
        ScrollPanelModule,
        SplitButtonModule,
        ButtonModule,
        ProjectTableComponent,
        ProgressSpinnerModule,
        LoaderComponent,
        PieChartComponent,
        CardModule,
        BarChartComponent
    ],
    templateUrl: './timeSheet.html'
})
export class timeSheetDemo {
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
    afterglobalfilter: any = null; // Variable to store the global filter state

    filters = {
        startDate: '',
        endDate: ''
    };

    exportOptions: MenuItem[] | undefined;
    startDate!: string;
    endDate!: string;
    emp_department: string[] = [];
    pro_department: string[] = []; //3/6/25
    project: string[] = [];
    positionTitle: string[] = [];
    geography: string[] = [];
    emp_name: string[] = [];
    selectedRole: string = '';
    rolesList: string[] = [];
    DepartmentList: string[] = [];
    ProjectList: string[] = [];
    EmployeeList: string[] = [];
    RegionList: string[] = [];
    showStartDateError: boolean = false;
    showEndDateError: boolean = false;
    totalDays: number = 0;
    projectOptions: { label: string; value: string }[] = [];
    employeeOptions: { label: string; value: string }[] = [];
    empDepartmentOptions: { label: string; value: string }[] = [];
    proDepartmentOptions: { label: string; value: string }[] = []; //3/6/25
    geographyOptions: { label: string; value: string }[] = [];
    positionTitleOptions: { label: string; value: string }[] = [];
    minEndDate: Date | null = null;
    isExpanded: boolean = false;
    expandedComponent: 'pie' | 'bar' | 'table' | null = null;

    constructor(
        private cdr: ChangeDetectorRef,
        private exportService: ExportService,
        private timeSheetService: timeSheetService,
        private ngZone: NgZone,
        private PositionService: PositionService,
        private DepartmentService: DepartmentService,
        private ProjectService: ProjectService,
        private EmployeeService: EmployeeService,
        private RegionService: RegionService,
        private xmlParserService: XmlParserService,
        private globalState: GlobalStateService
    ) {}

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
    };
    private buildOptions(list: string[]): { label: string; value: string }[] {
        const sorted = [...list].filter((x) => x !== 'All').sort((a, b) => a.localeCompare(b));
        console.log('everytime sorted', sorted);
        return [...sorted.map((item) => ({ label: item, value: item }))]; // { label: 'All', value: '' },
    }
    ngOnInit(): void {
       
        const pageKey = 'page1';

        const savedFilter = this.globalState.getFilters(pageKey);
        const savedData = this.globalState.getFilteredData(pageKey);

        if (savedFilter && savedData.length > 0) {
            this.afterglobalfilter = savedFilter;
            this.projectTableData = savedData;

            this.startDate = savedFilter.startDate;
            this.endDate = savedFilter.endDate;
            this.emp_department = savedFilter.emp_department;
            this.project = savedFilter.project;
            this.pro_department = savedFilter.pro_department;
            this.positionTitle = savedFilter.positionTitle;
            this.geography = savedFilter.geography;
            this.emp_name = savedFilter.emp_name;
            this.selectedGeography = this.geography && this.geography.length === 1 ? this.geography[0] : 'All';
            this.selectedDepartment = this.emp_department && this.emp_department.length === 1 ? this.emp_department[0] : 'All';
        }

        this.PositionService.fetchRoleItem().subscribe({
            next: (response) => {
                // const rolesList: string[] = [];
                let parsedResponse: any = response;

                // If response is a string, try to parse it as JSON
                if (typeof response === 'string') {
                    try {
                        parsedResponse = JSON.parse(response);
                    } catch (e) {
                        console.error('Failed to parse response as JSON:', e);
                        return;
                    }
                }

                // Loop through the array inside "value" and extract sg_role
                if (parsedResponse && Array.isArray(parsedResponse.value)) {
                    for (const item of parsedResponse.value) {
                        if (item.keyed_name) {
                            this.rolesList.push(item.keyed_name);
                        }
                    }
                }
                this.rolesList.sort((a, b) => a.localeCompare(b));
                this.positionTitleOptions = this.buildOptions(this.rolesList);
            },
            error: (error) => {
                console.error('Error fetching role item:', error);
            }
        });

        // 2nd service
        this.DepartmentService.fetchDepartmentItem().subscribe({
            next: (response) => {
                // const rolesList: string[] = [];
                let parsedResponse: any = response;

                // If response is a string, try to parse it as JSON
                if (typeof response === 'string') {
                    try {
                        parsedResponse = JSON.parse(response);
                    } catch (e) {
                        console.error('Failed to parse response as JSON:', e);
                        return;
                    }
                }

                // Loop through the array inside "value" and extract sg_role
                if (parsedResponse && Array.isArray(parsedResponse.value)) {
                    for (const item of parsedResponse.value) {
                        if (item.keyed_name) {
                            this.DepartmentList.push(item.keyed_name);
                        }
                    }
                }
                this.DepartmentList.sort((a, b) => a.localeCompare(b));
                this.empDepartmentOptions = this.buildOptions(this.DepartmentList);
                this.proDepartmentOptions = this.buildOptions(this.DepartmentList);
                console.log('Extracted Department list:', this.DepartmentList);
            },
            error: (error) => {
                console.error('Error fetching role item:', error);
            }
        });

        //4th service
        this.EmployeeService.fetchEmployeeItem().subscribe({
            next: (response) => {
                console.log('Service response:', response);

                let parsedResponse: any = response;

                // If response is a string, try to parse it as JSON
                if (typeof response === 'string') {
                    try {
                        parsedResponse = JSON.parse(response);
                    } catch (e) {
                        console.error('Failed to parse response as JSON:', e);
                        return;
                    }
                }

                // Loop through the array inside "value" and extract sg_role
                if (parsedResponse && Array.isArray(parsedResponse.value)) {
                    for (const item of parsedResponse.value) {
                        if (item.keyed_name) {
                            this.EmployeeList.push(item.keyed_name);
                        }
                    }
                }
                this.EmployeeList.sort((a, b) => a.localeCompare(b));
                this.employeeOptions = this.buildOptions(this.EmployeeList);
                console.log('Extracted sg_role list:', this.EmployeeList);
            },
            error: (error) => {
                console.error('Error fetching role item:', error);
            }
        });

        //5th service
        this.RegionService.fetchRegionItem().subscribe({
            next: (response) => {
                console.log('Service response:', response);

                let parsedResponse: any = response;

                // If response is a string, try to parse it as JSON
                if (typeof response === 'string') {
                    try {
                        parsedResponse = JSON.parse(response);
                    } catch (e) {
                        console.error('Failed to parse response as JSON:', e);
                        return;
                    }
                }

                // Loop through the array inside "value" and extract sg_role
                if (parsedResponse && Array.isArray(parsedResponse.value)) {
                    for (const item of parsedResponse.value) {
                        if (item.value) {
                            this.RegionList.push(item.value);
                        }
                    }
                }
                this.RegionList.sort((a, b) => a.localeCompare(b));
                this.geographyOptions = this.buildOptions(this.RegionList);
                console.log('Extracted sg_role list:', this.RegionList);
            },
            error: (error) => {
                console.error('Error fetching role item:', error);
            }
        });
    }
    validateDates() {
        if (!this.startDate && !this.endDate) {
            console.log('Please select both start and end dates.');
            this.showStartDateError = true;
            this.showEndDateError = true;
        } else if (!this.startDate) {
            console.log('Please select a start date.');
            this.showStartDateError = true;
            this.showEndDateError = false;
        } else if (!this.endDate) {
            console.log('Please select an end date.');
            this.showStartDateError = false;
            this.showEndDateError = true;
        } else {
            this.showStartDateError = false;
            this.showEndDateError = false;
        }
    }
    onDateChange(field: 'start' | 'end', value: string) {
        if (field === 'start') {
            this.startDate = value;
            this.showStartDateError = !value;
            this.minEndDate = new Date(value);

            // Reset end date if it is earlier than the new start date
            if (this.endDate && new Date(this.endDate) < this.minEndDate) {
                this.endDate = '';
            }
        } else {
            this.endDate = value;
            this.showEndDateError = !value;
        }
    }

    onEndDateChange(date: Date) {
        this.endDate = date ? date.toISOString().split('T')[0] : '';
        this.filters.endDate = this.endDate;
        console.log('End Date:', this.endDate);
    }
    countWeekdays(startDateTs: Date, endDateTs: Date): number {
        let count = 0;
        let currentDate = new Date(startDateTs);

        // Loop through each day in the date range
        while (currentDate <= endDateTs) {
            const day = currentDate.getDay();
            // 0 = Sunday, 6 = Saturday
            if (day !== 0 && day !== 6) {
                count++;
            }
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return count;
    }

    applyFilters(): void {
        this.validateDates();
        this.isLoading = true;
        console.log('Start Date:', this.startDate);
        console.log('End Date:', this.endDate);
        this.timeSheetService
            .fetchtimeSheetItem(
                this.startDate,
                this.endDate,
                this.emp_department,
                // this.project,
                this.positionTitle,
                this.pro_department, //3/6/25
                this.geography,
                this.emp_name
            )
            .subscribe({
                next: async (xmlData: string) => {
                    console.log(this.startDate);
                    console.log(this.endDate);
                    const startDateTs = new Date(this.startDate);
                    const endDateTs = new Date(this.endDate);

                    this.totalDays = this.countWeekdays(startDateTs, endDateTs);
                    console.log('Total weekdays:', this.totalDays);
                    const result = await this.xmlParserService.parseXml(xmlData);
                    console.log('Parsed XML result:', result);
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
                                    sg_position_role: item?.sg_position_role?.$?.keyed_name || 'N/A',
                                    billing_status: item?.sg_billing_status || 'N/A',
                                    billableqty: item?.sg_billableqty || '0',
                                    sg_ts_activity_type: item?.sg_ts_activity_type || 'N/A',
                                    sg_ts_date: item?.sg_ts_date || 'N/A',
                                    sg_billing_method: item?.sg_billing_method || 'N/A'
                                };
                            });
                        console.log('Raw Project Data:', this.rawProjectData);

                        // this.afterglobalfilter = {
                        //     startDate: this.startDate,
                        //     endDate: this.endDate,
                        //     department: this.department,
                        //     project: this.project,
                        //     positionTitle: this.positionTitle,
                        //     geography: this.geography,
                        //     emp_name: this.emp_name
                        // };
                        const pageKey = 'page1';

                        this.afterglobalfilter = {
                            startDate: this.startDate,
                            endDate: this.endDate,
                            // department: this.department,
                            // project: this.project,
                            // positionTitle: this.positionTitle,
                            // geography: this.geography,
                            // emp_name: this.emp_name
                            emp_department: this.emp_department && this.emp_department.length ? this.emp_department : [],
                            pro_department: this.pro_department && this.pro_department.length ? this.pro_department : [],
                            project: this.project && this.project.length ? this.project : [],
                            positionTitle: this.positionTitle && this.positionTitle.length ? this.positionTitle : [],
                            geography: this.geography && this.geography.length ? this.geography : [],
                            emp_name: this.emp_name && this.emp_name.length ? this.emp_name : []
                        };
                        console.log('values filtering:', this.afterglobalfilter);

                        this.groupProjectData(); // Call the grouping function here
                        // this.globalState.filter = this.afterglobalfilter;
                        // this.globalState.filteredData = this.projectTableData;
                        this.globalState.setFilters(pageKey, this.afterglobalfilter);
                        this.globalState.setFilteredData(pageKey, this.projectTableData);

                        console.log('raw projectTableData:', this.rawProjectData);
                        console.log('Mapped projectTableData:', this.projectTableData);
                        this.isLoading = false;
                        this.cdr.detectChanges();
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
            [employeeKey: string]: {
                employeeMeta: {
                    sg_employee: string;
                    sg_position_title: string;
                    sg_employee_department: string;
                    sg_geography: string;
                    sg_position_role: string;
                };
                projects: {
                    [project: string]: {
                        billing_status: string;
                        billableqty: number;
                        count: number;
                        sg_position_role: string;
                        count_leave: number;
                        sg_billing_method: string;
                    }[];
                };
            };
        } = {};

        this.rawProjectData.forEach((entry) => {
            const employeeKey = `${entry.sg_employee}___${entry.sg_geography}`;
            const project = entry.ts_task_project;
            const billing_status = entry.billing_status;
            const sg_position_role = entry.sg_position_role;
            const billableqty = parseFloat(entry.billableqty) || 0;
            const sg_ts_activity_type = entry.sg_ts_activity_type;
            const sg_billing_method = entry.sg_billing_method;

            if (!result[employeeKey]) {
                result[employeeKey] = {
                    employeeMeta: {
                        sg_employee: entry.sg_employee,
                        sg_position_title: entry.sg_position_title,
                        sg_employee_department: entry.sg_employee_department,
                        sg_geography: entry.sg_geography,
                        sg_position_role
                    },
                    projects: {}
                };
            }

            if (!result[employeeKey].projects[project]) {
                result[employeeKey].projects[project] = [];
            }

            const existing = result[employeeKey].projects[project].find((p) => p.billing_status === billing_status && p.sg_position_role === sg_position_role);

            if (existing) {
                if (sg_ts_activity_type === 'Leave') {
                    existing.count_leave = (existing.count_leave || 0) + 1;
                }
                existing.billableqty += billableqty;
                existing.count += 1;
            } else {
                result[employeeKey].projects[project].push({
                    billing_status,
                    billableqty,
                    count: 1,
                    sg_position_role,
                    count_leave: 0,
                    sg_billing_method
                });
            }
        });

        // Iterate through rawProjectData to collect unique dates for each employee
        const employeeUniqueDates = new Map<string, Set<string>>();
        this.rawProjectData.forEach((entry) => {
            const employee = entry.sg_employee;
            const date = entry.sg_ts_date.split('T')[0]; // only use the date part
            if (!employeeUniqueDates.has(employee)) {
                employeeUniqueDates.set(employee, new Set());
            }

            employeeUniqueDates.get(employee)!.add(date);
        });

        // Prepare final result object with counts
        const ans: { [employee: string]: number } = {};
        employeeUniqueDates.forEach((dateSet, employee) => {
            ans[employee] = this.totalDays - dateSet.size;
        });
        console.log('ans:', ans);

        // Convert to array format for HTML
        this.projectTableData = Object.entries(result).map(([key, data]) => ({
            employee: data.employeeMeta.sg_employee,
            sg_position_title: data.employeeMeta.sg_position_title,
            sg_employee_department: data.employeeMeta.sg_employee_department,
            sg_geography: data.employeeMeta.sg_geography,
            sg_position_role: data.employeeMeta.sg_position_role,
            projects: Object.entries(data.projects).map(([project, statuses]) => {
                const billingDetails = statuses.map((item) => ({
                    billing_status: item.billing_status,
                    sg_billing_method: item.sg_billing_method,
                    total_hours: item.billableqty,
                    total_ts_fill_hrs: item.count * 8 - item.count_leave * 8,
                    sg_position_role: item.sg_position_role,
                    total_billable_hr_company:
                        item.billing_status?.toLowerCase() === 'billable' && (item.sg_billing_method === 'TM Billable - Rec' || item.sg_billing_method === 'TM Billable' || item.sg_billing_method === 'FC Billable')
                            ? parseFloat(String(item.billableqty)) || 0
                            : 0,
                    total_non_billable_hr: item.count * 8 - item.count_leave * 8 - (parseFloat(String(item.billableqty)) || 0),
                    total_leave: item.count_leave,
                    missing_timeSheet: Math.max(ans[data.employeeMeta.sg_employee] || 0, 0) * 8,
                    GCW_hrs: ans[data.employeeMeta.sg_employee] < 0 ? Math.abs(ans[data.employeeMeta.sg_employee]) * 8 : 0
                }));

                const totalBillableHrs_company = billingDetails.reduce((sum, item) => sum + item.total_billable_hr_company, 0);
                const totalTsFillHrs = billingDetails.reduce((sum, item) => sum + item.total_ts_fill_hrs, 0);
                const totalBillableHrs_person = billingDetails.reduce((sum, item) => sum + item.total_hours, 0);

                // Calculate company_billability
                const company_billability = totalTsFillHrs > 0 ? (totalBillableHrs_company * 100) / totalTsFillHrs : 0;
                const person_billability = totalTsFillHrs > 0 ? (totalBillableHrs_person * 100) / totalTsFillHrs : 0;

                return {
                    project,
                    billingDetails,
                    company_billability,
                    person_billability
                };
            })
        }));
    }

    toggleExpand(component: 'pie' | 'bar' | 'table' | null): void {
        this.isExpanded = !this.isExpanded;
        this.expandedComponent = this.isExpanded ? component : null;
    }

    handleGeographyClick(selectedGeography: string): void {
        this.ngZone.run(() => {
            this.selectedGeography = selectedGeography;

            // For "All", clear the filter
            this.geography = !selectedGeography ? [] : [selectedGeography];

            if (this.startDate && this.endDate) {
                this.applyFilters();
            }
        });
    }

    handleDepartmentClick(selectedDepartment: string): void {
        this.ngZone.run(() => {
            // Update the department filter

            if (!selectedDepartment) {
                // Reset department filter
                this.emp_department = [];
                this.selectedDepartment = null;
            } else {
                // Apply department filter
                this.emp_department = [selectedDepartment];
                this.selectedDepartment = selectedDepartment;
            }

            if (this.startDate && this.endDate) {
                this.applyFilters();
            }
        });
    }

    resetFilters(): void {
        // Reset filters
        this.startDate = '';
        this.endDate = '';
        this.minEndDate = null;
        this.emp_department = [];
        this.project = [];
        this.pro_department = [];
        this.positionTitle = [];
        this.geography = [];
        this.emp_name = [];

        // Reset selections
        this.selectedGeography = null;
        this.selectedGeographyIndex = null;
        this.selectedDepartment = null;

        // Clear data
        this.rawProjectData = [];
        this.projectTableData = [];
        this.showStartDateError = false;
        this.showEndDateError = false;
        const pageKey = 'page1';
        this.globalState.resetPageData(pageKey);
        this.afterglobalfilter = {};
        // this.globalState.filter = null;
        // this.globalState.filteredData = [];

        this.cdr.detectChanges();
    }
}
