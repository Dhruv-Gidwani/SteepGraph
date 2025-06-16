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
import { MultiselectFilterDemo } from '../../components/multiselect/multiselect.component';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePickerIconDemo } from '../../components/date/date.component';
import { GlobalStateService } from '../../services/globalservicefilters';
import { firstValueFrom } from 'rxjs';
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
    pro_department: string[] = [];
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
    proDepartmentOptions: { label: string; value: string }[] = [];
    geographyOptions: { label: string; value: string }[] = [];
    positionTitleOptions: { label: string; value: string }[] = [];
    minEndDate: Date | null = null;
    isExpanded: boolean = false;
    expandedComponent: 'pie' | 'bar' | 'table' | null = null;
    showSecondaryFilters: boolean = false;
    isFirstVisit: boolean = true;
    private fullDataset: any[] = [];

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

    // private buildOptions(list: string[]): { label: string; value: string }[] {
    //     const sorted = [...list].filter((x) => x !== 'All').sort((a, b) => a.localeCompare(b));
    //     console.log('everytime sorted', sorted);
    //     return [...sorted.map((item) => ({ label: item, value: item }))];
    // }
    private buildOptions(list: string[]): { label: string; value: string }[] {
        // Filter out 'N/A' and null/undefined values, then sort
        const sorted = [...list].filter((x) => x && x !== 'All' && x !== 'N/A' && x.trim() !== '').sort((a, b) => a.localeCompare(b));

        return sorted.map((item) => ({ label: item, value: item }));
    }

    ngOnInit(): void {
        const pageKey = 'page1';
        const savedFilter = this.globalState.getFilters(pageKey);
        const savedData = this.globalState.getFilteredData(pageKey);

        if (savedFilter && savedData.length > 0) {
            this.showSecondaryFilters = true;
            this.afterglobalfilter = savedFilter;
            this.projectTableData = savedData;

            // Restore saved filters
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

            // If we have saved dates, fetch the filter options
            if (this.startDate && this.endDate) {
                this.fetchFilterOptions();
            }
        } else {
            // First visit - show only date filters
            this.isFirstVisit = true;
            this.showSecondaryFilters = false;
        }
    }

    onDateChange(field: 'start' | 'end', value: string) {
        if (field === 'start') {
            this.startDate = value;
            this.showStartDateError = !value;
            this.minEndDate = new Date(value);

            if (this.endDate && new Date(this.endDate) < this.minEndDate) {
                this.endDate = '';
            }

            // Clear stored dataset when start date changes
            this.fullDataset = [];
        } else {
            this.endDate = value;
            this.showEndDateError = !value;

            // Clear stored dataset when end date changes
            this.fullDataset = [];
        }

        // Only fetch new data when both dates are selected
        if (this.startDate && this.endDate) {
            this.fetchInitialData();
        }
    }

    async fetchInitialData(): Promise<void> {
        this.validateDates();

        if (this.showStartDateError || this.showEndDateError) {
            return;
        }

        this.isLoading = true;
        this.isFirstVisit = false;

        try {
            // Fetch filter options first
            await this.fetchFilterOptions();

            // Fetch data only if we don't have it for the current date range
            const xmlData = await firstValueFrom(this.timeSheetService.fetchtimeSheetItem(this.startDate, this.endDate, [], [], [], [], []));

            const result = await this.xmlParserService.parseXml(xmlData);
            const items = result?.['SOAP-ENV:Envelope']?.['SOAP-ENV:Body']?.Result?.Item;
            const flatItems = Array.isArray(items) ? items : [items];

            // Store the full dataset
            this.fullDataset = this.processRawData(flatItems);

            // Process the data to populate filter options
            this.ngZone.run(async () => {
                // Extract unique values for filters from fullDataset
                const departments = new Set<string>();
                const positions = new Set<string>();
                const geographies = new Set<string>();
                const employees = new Set<string>();
                const projects = new Set<string>();
                this.fullDataset.forEach((item: any) => {
                    // Only add non-N/A values
                    if (item.sg_employee_department !== 'N/A') {
                        departments.add(item.sg_employee_department);
                    }
                    if (item.sg_position_title !== 'N/A') {
                        positions.add(item.sg_position_title);
                    }
                    if (item.sg_geography !== 'N/A') {
                        geographies.add(item.sg_geography);
                    }
                    if (item.sg_employee !== 'N/A') {
                        employees.add(item.sg_employee);
                    }
                    if (item.project !== 'N/A') {
                        projects.add(item.project);
                    }
                });

                // Update filter options
                this.empDepartmentOptions = this.buildOptions(Array.from(departments));
                this.positionTitleOptions = this.buildOptions(Array.from(positions));
                this.geographyOptions = this.buildOptions(Array.from(geographies));
                this.employeeOptions = this.buildOptions(Array.from(employees));
                this.projectOptions = this.buildOptions(Array.from(projects));
                this.proDepartmentOptions = this.buildOptions(Array.from(departments));

                this.showSecondaryFilters = true;

                // Initialize with unfiltered data
                this.rawProjectData = [...this.fullDataset];
                this.groupProjectData();

                this.isLoading = false;
                this.cdr.detectChanges();
            });
        } catch (error) {
            console.error('Error fetching initial data:', error);
            this.isLoading = false;
        }
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

    // Method to fetch filter options
    private async fetchFilterOptions(): Promise<void> {
        try {
            // Position Titles
            const positionResponse = await firstValueFrom(this.PositionService.fetchRoleItem());
            this.processPositionResponse(positionResponse);

            // Departments
            const departmentResponse = await firstValueFrom(this.DepartmentService.fetchDepartmentItem());
            this.processDepartmentResponse(departmentResponse);

            // Employees
            const employeeResponse = await firstValueFrom(this.EmployeeService.fetchEmployeeItem());
            this.processEmployeeResponse(employeeResponse);

            //Projects
            const projectResponse = await firstValueFrom(this.ProjectService.fetchProjectItem());
            this.processProject(projectResponse);

            // Regions
            const regionResponse = await firstValueFrom(this.RegionService.fetchRegionItem());
            this.processRegionResponse(regionResponse);
        } catch (error) {
            console.error('Error fetching filter options:', error);
        }
    }

    // Helper methods to process responses
    private processPositionResponse(response: any): void {
        let parsedResponse = this.parseResponse(response);
        if (parsedResponse?.value) {
            this.rolesList = parsedResponse.value.filter((item: any) => item.keyed_name).map((item: any) => item.keyed_name);
            this.rolesList.sort((a, b) => a.localeCompare(b));
            this.positionTitleOptions = this.buildOptions(this.rolesList);
        }
    }

    private processDepartmentResponse(response: any): void {
        let parsedResponse = this.parseResponse(response);
        if (parsedResponse?.value) {
            this.DepartmentList = parsedResponse.value.filter((item: any) => item.keyed_name).map((item: any) => item.keyed_name);
            this.DepartmentList.sort((a, b) => a.localeCompare(b));
            this.empDepartmentOptions = this.buildOptions(this.DepartmentList);
            this.proDepartmentOptions = this.buildOptions(this.DepartmentList);
        }
    }

    private processEmployeeResponse(response: any): void {
        let parsedResponse = this.parseResponse(response);
        if (parsedResponse?.value) {
            this.EmployeeList = parsedResponse.value.filter((item: any) => item.keyed_name).map((item: any) => item.keyed_name);
            this.EmployeeList.sort((a, b) => a.localeCompare(b));
            this.employeeOptions = this.buildOptions(this.EmployeeList);
        }
    }

    private processProject(response: any): void {
        let parsedResponse = this.parseResponse(response);
        if (parsedResponse?.value) {
            this.ProjectList = parsedResponse.value.filter((item: any) => item.keyed_name).map((item: any) => item.keyed_name);
            this.ProjectList.sort((a, b) => a.localeCompare(b));
            this.projectOptions = this.buildOptions(this.ProjectList);
        }
    }

    private processRegionResponse(response: any): void {
        let parsedResponse = this.parseResponse(response);
        if (parsedResponse?.value) {
            this.RegionList = parsedResponse.value.filter((item: any) => item.value).map((item: any) => item.value);
            this.RegionList.sort((a, b) => a.localeCompare(b));
            this.geographyOptions = this.buildOptions(this.RegionList);
        }
    }

    private parseResponse(response: any): any {
        if (typeof response === 'string') {
            try {
                return JSON.parse(response);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                return null;
            }
        }
        return response;
    }

    private processRawData(items: any[]): any[] {
        return items
            .filter((item) => !!item)
            .map((item: any) => ({
                sg_employee: item?.sg_employee?.$?.keyed_name || 'N/A',
                sg_position_title: item?.sg_position_title?.$?.keyed_name || 'N/A',
                sg_employee_department: item?.sg_employee_department?.$?.keyed_name || 'N/A',
                ts_task_project: item?.sg_ts_task_project?.$?.keyed_name || 'N/A',
                sg_geography: item?.sg_geography || 'N/A',
                sg_position_role: item?.sg_position_role?.$?.keyed_name || 'N/A',
                project: item?.sg_ts_task_project?.$?.keyed_name || 'N/A',
                billing_status: item?.sg_billing_status || 'N/A',
                billableqty: item?.sg_billableqty || '0',
                sg_ts_activity_type: item?.sg_ts_activity_type || 'N/A',
                sg_ts_date: item?.sg_ts_date || 'N/A',
                sg_billing_method: item?.sg_billing_method || 'N/A'
            }));
    }

    async applyFilters(): Promise<void> {
        this.isLoading = true;

        try {
            // Calculate total days
            const startDateTs = new Date(this.startDate);
            const endDateTs = new Date(this.endDate);
            this.totalDays = this.countWeekdays(startDateTs, endDateTs);

            // Filter the stored dataset
            this.rawProjectData = this.fullDataset.filter((item) => {
                const empDepartmentMatch = !this.emp_department.length || this.emp_department.includes(item.sg_employee_department);

                const positionMatch = !this.positionTitle.length || this.positionTitle.includes(item.sg_position_title);

                const proDepartmentMatch = !this.pro_department.length || this.pro_department.includes(item.sg_employee_department);

                const geographyMatch = !this.geography.length || this.geography.includes(item.sg_geography);

                const employeeMatch = !this.emp_name.length || this.emp_name.includes(item.sg_employee);

                const projectMatch = !this.project.length || this.project.includes(item.project);

                return empDepartmentMatch && positionMatch && proDepartmentMatch && geographyMatch && employeeMatch && projectMatch;
            });

            // Update table data
            this.groupProjectData();

            // Update global state
            this.updateGlobalState();

            this.cdr.detectChanges();
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            this.isLoading = false;
        }
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

    private updateGlobalState(): void {
        const pageKey = 'page1';
        this.afterglobalfilter = {
            startDate: this.startDate,
            endDate: this.endDate,
            emp_department: this.emp_department,
            pro_department: this.pro_department,
            project: this.project,
            positionTitle: this.positionTitle,
            geography: this.geography,
            emp_name: this.emp_name
        };

        this.globalState.setFilters(pageKey, this.afterglobalfilter);
        this.globalState.setFilteredData(pageKey, this.projectTableData);
    }

    onEndDateChange(date: Date) {
        this.endDate = date ? date.toISOString().split('T')[0] : '';
        this.filters.endDate = this.endDate;
        console.log('End Date:', this.endDate);
    }

    toggleExpand(component: 'pie' | 'bar' | 'table' | null): void {
        this.isExpanded = !this.isExpanded;
        this.expandedComponent = this.isExpanded ? component : null;
    }

    handleGeographyClick(selectedGeography: string): void {
        this.ngZone.run(() => {
            // Update the geography filter
            if (!selectedGeography || selectedGeography === 'All') {
                // Reset geography filter
                this.geography = [];
                this.selectedGeography = null;
                this.selectedGeographyIndex = null;
            } else {
                // Apply geography filter
                this.geography = [selectedGeography];
                this.selectedGeography = selectedGeography;
                this.selectedGeographyIndex = this.geographyOptions.findIndex((opt) => opt.value === selectedGeography);
            }

            if (this.startDate && this.endDate) {
                this.applyFilters();
            }

            this.cdr.detectChanges();
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
        if (this.isFirstVisit) {
            // First visit - clear everything including dates
            this.startDate = '';
            this.endDate = '';
            this.minEndDate = null;
            this.showSecondaryFilters = false;
            this.isFirstVisit = false;
        } else {
            // Subsequent resets - keep dates, reset other filters to "All"
            this.emp_department = [];
            this.project = [];
            this.pro_department = [];
            this.positionTitle = [];
            this.geography = [];
            this.emp_name = [];
            this.project = [];

            // Keep showing secondary filters
            this.showSecondaryFilters = true;

            // Re-fetch data with only date filters
            if (this.startDate && this.endDate) {
                this.fetchInitialData();
            }
        }

        // Reset selections and data
        this.selectedGeography = null;
        this.selectedGeographyIndex = null;
        this.selectedDepartment = null;
        this.rawProjectData = [];
        this.projectTableData = [];
        this.showStartDateError = false;
        this.showEndDateError = false;

        // Reset global state
        const pageKey = 'page1';
        this.globalState.resetPageData(pageKey);
        this.afterglobalfilter = {};

        this.cdr.detectChanges();
    }
}
