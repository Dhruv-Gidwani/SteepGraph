import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { XmlParserService } from '../../services/xml-parser.service';
import { ButtonModule } from 'primeng/button';
import { ExportService } from './components/project-table/Excel/excel';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderComponent } from './components/loader/loader.component';
import { timeSheetService } from '../../services/timeSheet.service';
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
    projectTableData: any[] = [];
    rawProjectData: any[] = [];
    selectedGeography: string | null = null;
    selectedGeographyIndex: number | null = null;
    selectedDepartment: string | null = null;
    afterglobalfilter: any = null; // Variable to store the global filter state
    startDate: string = this.formatDateToYMD(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    endDate: string = this.formatDateToYMD(new Date());
    emp_department: string[] = [];
    pro_department: string[] = [];
    project: string[] = [];
    positionTitle: string[] = [];
    geography: string[] = [];
    emp_name: string[] = [];
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
    private static hasVisited: boolean = false;
    private fullDataset: any[] = [];
    totalWorkingDays: number = 0;

    constructor(
        private cdr: ChangeDetectorRef,
        private exportService: ExportService,
        private timeSheetService: timeSheetService,
        private ngZone: NgZone,
        private xmlParserService: XmlParserService,
        private globalState: GlobalStateService
    ) {}

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
    };

    //Sorting and building options for the multiselect dropdowns
    private buildOptions(list: string[]): { label: string; value: string }[] {
        const sorted = [...list].filter((x) => x !== 'All').sort((a, b) => String(a).localeCompare(String(b)));
        console.log('everytime sorted', sorted);
        return [...sorted.map((item) => ({ label: item, value: item }))];
    }

    ngOnInit(): void {
        const pageKey = 'page1';
        const savedFilter = this.globalState.getFilters(pageKey);
        const savedData = this.globalState.getFilteredData(pageKey);

        if (savedFilter && savedData.length > 0) {
            this.showSecondaryFilters = true;
            this.afterglobalfilter = savedFilter;
            this.projectTableData = savedData;

            // Get unfiltered data for the date range
            this.getUnfilteredData(savedFilter.startDate, savedFilter.endDate).then(() => {
                // Restore filters after getting full dataset
                this.restoreFilters(savedFilter);
                this.applyFilters();
            });
        } else {
            if (!timeSheetDemo.hasVisited) {
                const today = new Date();
                this.startDate = this.formatDateToYMD(new Date(today.getFullYear(), today.getMonth(), 1));
                this.endDate = this.formatDateToYMD(today);
                this.fetchInitialData();
                timeSheetDemo.hasVisited = true;
            }
        }
    }

    private async getUnfilteredData(startDate: string, endDate: string): Promise<void> {
        try {
            // Get unfiltered data for the date range
            const xmlData = await firstValueFrom(this.timeSheetService.fetchtimeSheetItem(startDate, endDate, [], [], [], [], [], []));

            const result = await this.xmlParserService.parseXml(xmlData);
            const items = result?.['SOAP-ENV:Envelope']?.['SOAP-ENV:Body']?.Result?.Item;
            const flatItems = Array.isArray(items) ? items : [items];

            // Store the full dataset
            this.fullDataset = this.processRawData(flatItems);

            // Populate all filter options
            this.populateFilterOptions();
        } catch (error) {
            console.error('Error fetching unfiltered data:', error);
        }
    }

    // Update restoreFilters to handle null values
    private restoreFilters(savedFilter: any): void {
        this.startDate = savedFilter.startDate || '';
        this.endDate = savedFilter.endDate || '';
        this.emp_department = Array.isArray(savedFilter.emp_department) ? savedFilter.emp_department : [];
        this.project = Array.isArray(savedFilter.project) ? savedFilter.project : [];
        this.pro_department = Array.isArray(savedFilter.pro_department) ? savedFilter.pro_department : [];
        this.positionTitle = Array.isArray(savedFilter.positionTitle) ? savedFilter.positionTitle : [];
        this.geography = Array.isArray(savedFilter.geography) ? savedFilter.geography : [];
        this.emp_name = Array.isArray(savedFilter.emp_name) ? savedFilter.emp_name : [];

        // Restore selected states
        this.selectedGeography = this.geography?.length === 1 ? this.geography[0] : null;
        this.selectedDepartment = this.emp_department?.length === 1 ? this.emp_department[0] : null;

        this.showSecondaryFilters = true;
    }

    formatDateToYMD(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onDateChange(field: 'start' | 'end', value: string) {
        if (field === 'start') {
            this.startDate = value;
            this.showStartDateError = !value;
            this.minEndDate = new Date(value);

            if (this.endDate && new Date(this.endDate) < this.minEndDate) {
                this.endDate = '';
            }
        } else {
            this.endDate = value;
            this.showEndDateError = !value;
        }

        // Clear stored dataset when dates change
        this.fullDataset = [];

        // Fetch new data only when both dates are selected
        if (this.startDate && this.endDate) {
            this.fetchInitialData();
        }
    }

    async fetchInitialData(): Promise<void> {
        this.validateDates();
        if (this.showStartDateError || this.showEndDateError) return;

        this.isLoading = true;

        try {
            if (this.startDate && this.endDate) {
                try {
                    this.totalWorkingDays = await this.calculateWorkingDaysExcludingWeekendsAndHolidays(this.startDate, this.endDate);
                } catch (holidayError) {
                    console.error('❌ Failed to calculate working days:', holidayError);
                    this.totalWorkingDays = 0;
                }
            }

            // First call: Get all data for the date range to populate filter options
            const allDataResponse = await firstValueFrom(this.timeSheetService.fetchtimeSheetItem(this.startDate, this.endDate, [], [], [], [], [], []));
            console.log('All data response:', allDataResponse);
            // Store current filter selections
            const currentFilters = {
                emp_department: [...this.emp_department],
                positionTitle: [...this.positionTitle],
                pro_department: [...this.pro_department],
                geography: [...this.geography],
                emp_name: [...this.emp_name],
                project: [...this.project]
            };

            // Process all data to populate filter options
            const allDataResult = await this.xmlParserService.parseXml(allDataResponse);
            const allItems = allDataResult?.['SOAP-ENV:Envelope']?.['SOAP-ENV:Body']?.Result?.Item;
            const allFlatItems = Array.isArray(allItems) ? allItems : [allItems];

            // Store full dataset and populate filter options
            this.fullDataset = this.processRawData(allFlatItems);
            console.log('Full dataset:', this.fullDataset);
            this.populateFilterOptions();

            // Second call: Get filtered data if filters are applied
            const hasActiveFilters = Object.values(currentFilters).some((filter) => filter.length > 0);

            if (hasActiveFilters) {
                const filteredResponse = await firstValueFrom(
                    this.timeSheetService.fetchtimeSheetItem(
                        this.startDate,
                        this.endDate,
                        currentFilters.emp_department,
                        currentFilters.positionTitle,
                        currentFilters.pro_department,
                        currentFilters.geography,
                        currentFilters.emp_name,
                        currentFilters.project
                    )
                );

                const filteredResult = await this.xmlParserService.parseXml(filteredResponse);
                const filteredItems = filteredResult?.['SOAP-ENV:Envelope']?.['SOAP-ENV:Body']?.Result?.Item;
                const filteredFlatItems = Array.isArray(filteredItems) ? filteredItems : [filteredItems];
                this.rawProjectData = this.processRawData(filteredFlatItems);
            } else {
                this.rawProjectData = [...this.fullDataset];
            }

            // Restore filter selections
            this.emp_department = currentFilters.emp_department;
            this.positionTitle = currentFilters.positionTitle;
            this.pro_department = currentFilters.pro_department;
            this.geography = currentFilters.geography;
            this.emp_name = currentFilters.emp_name;
            this.project = currentFilters.project;

            this.showSecondaryFilters = true;
            console.log('Raw project data:', this.rawProjectData);
            this.groupProjectData();
            this.updateGlobalState();
            this.cdr.detectChanges();
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    private populateFilterOptions(): void {
        if (!this.fullDataset.length) {
            console.warn('No data available to populate filter options');
            return;
        }

        const departments = new Set<string>();
        const positions = new Set<string>();
        const geographies = new Set<string>();
        const projectDept = new Set<string>();
        const employees = new Set<string>();
        const projects = new Set<string>();

        this.fullDataset.forEach((item: any) => {
            // Include all values, including 'N/A'
            departments.add(item.sg_employee_department);
            positions.add(item.sg_position_title);
            projectDept.add(item.sg_project_department);
            geographies.add(item.sg_geography);
            employees.add(item.sg_employee);
            projects.add(item.project);
        });

        // Update filter options
        this.empDepartmentOptions = this.buildOptions(Array.from(departments));
        this.positionTitleOptions = this.buildOptions(Array.from(positions));
        this.proDepartmentOptions = this.buildOptions(Array.from(projectDept));
        this.geographyOptions = this.buildOptions(Array.from(geographies));
        this.employeeOptions = this.buildOptions(Array.from(employees));
        this.projectOptions = this.buildOptions(Array.from(projects));
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

    private processRawData(items: any[]): any[] {
        return items
            .filter((item) => !!item)
            .map((item: any) => ({
                billableqty: parseFloat(item.sg_billableqty) || 0,
                billing_status: item.sg_billing_status || 'N/A',
                project: item.sg_ts_task_project?.$?.keyed_name || 'N/A',
                sg_billing_method: item.sg_billing_method || 'N/A',
                sg_employee: item?.sg_employee?.$?.keyed_name || 'N/A',
                sg_employee_department: item?.sg_employee_department?.$?.keyed_name || 'N/A',
                sg_geography: item.sg_geography || 'N/A',
                sg_position_role: item?.sg_position_role?.$?.keyed_name || 'N/A',
                sg_position_title: item.sg_position_title?.$?.keyed_name || 'N/A',
                sg_project_department: item?.sg_department?.$?.keyed_name || 'N/A',
                sg_ts_activity_type: item.sg_ts_activity_type || 'N/A',
                sg_ts_date: item.sg_ts_date || 'N/A'
            }));
    }

    async applyFilters(): Promise<void> {
        this.isLoading = true;

        try {
            //await this.calculateWorkingDaysAndMissingHrs();
            try {
                this.totalWorkingDays = await this.calculateWorkingDaysExcludingWeekendsAndHolidays(this.startDate, this.endDate);
            } catch (holidayError) {
                console.error('❌ Failed to calculate working days:', holidayError);
                this.totalWorkingDays = 0;
            }

            // Filter the stored dataset without making a service call
            this.rawProjectData = this.fullDataset.filter((item) => {
                return (
                    this.filterByArray(this.emp_department, item.sg_employee_department) &&
                    this.filterByArray(this.positionTitle, item.sg_position_title) &&
                    this.filterByArray(this.pro_department, item.sg_project_department) &&
                    this.filterByArray(this.geography, item.sg_geography) &&
                    this.filterByArray(this.emp_name, item.sg_employee) &&
                    this.filterByArray(this.project, item.project)
                );
            });

            this.groupProjectData();
            this.updateGlobalState();
            this.cdr.detectChanges();
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            this.isLoading = false;
        }
    }

    private filterByArray(filterArray: string[], value: string): boolean {
        return filterArray.length === 0 || filterArray.includes(value || 'N/A');
    }

    private async calculateWorkingDaysExcludingWeekendsAndHolidays(start: string, end: string): Promise<number> {
        const holidays: string[] = await firstValueFrom(this.timeSheetService.getHolidaysInRange(start, end));

        const startDate = new Date(start);
        const endDate = new Date(end);
        const holidaySet = new Set(holidays.map((dateStr) => dateStr.split('T')[0]));

        let workingDays = 0;
        let current = new Date(startDate);

        while (current <= endDate) {
            const day = current.getDay(); // Sunday = 0, Saturday = 6
            const dateStr = current.toISOString().split('T')[0];

            if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) {
                workingDays++;
            }

            current.setDate(current.getDate() + 1);
        }

        console.log('✅ Working Days (excluding weekends & holidays):', workingDays);
        //console.log('🗓️ Holidays:', [...holidaySet]);
        console.log('🗓️ Holidays:', Array.from(holidaySet));

        return workingDays;
    }

    groupProjectData() {
        const result: {
            [employeeKey: string]: {
                employeeMeta: {
                    sg_employee: string;
                    sg_position_title: string;
                    sg_employee_department: string;
                    sg_geography: string;
                    sg_project_department: string;
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
                        sg_ts_activity_type: string;
                    }[];
                };
            };
        } = {};

        this.rawProjectData.forEach((entry) => {
            //Extract Raw Fields from the Entry
            const employeeKey = `${entry.sg_employee}___${entry.sg_geography}`;
            const project = entry.project;
            const billing_status = entry.billing_status;
            const sg_position_role = entry.sg_position_role;
            const billableqty = parseFloat(entry.billableqty) || 0;
            const sg_ts_activity_type = entry.sg_ts_activity_type;
            const sg_billing_method = entry.sg_billing_method;

            //Initialize Employee If Not Already Added
            if (!result[employeeKey]) {
                result[employeeKey] = {
                    employeeMeta: {
                        sg_employee: entry.sg_employee,
                        sg_position_title: entry.sg_position_title,
                        sg_employee_department: entry.sg_employee_department,
                        sg_geography: entry.sg_geography,
                        sg_project_department: entry.sg_project_department,
                        sg_position_role
                    },
                    projects: {}
                };
            }

            //Initialize Project Array for This Employee If Not Present
            if (!result[employeeKey].projects[project]) {
                result[employeeKey].projects[project] = [];
            }

            //Try to find if an existing entry already exists for this project with the same billing_status and role. Also, check for sg_ts_activity_type
            const existing = result[employeeKey].projects[project].find((p) => p.billing_status === billing_status && p.sg_position_role === sg_position_role && p.sg_ts_activity_type === sg_ts_activity_type);

            //If Found → Aggregate Into It
            if (existing) {
                if (sg_ts_activity_type === 'Leave') {
                    // TF: Need to check half day leave
                    existing.count_leave = (existing.count_leave || 0) + 1;
                } else if (sg_ts_activity_type === 'HalfDay_Delivery') {
                    existing.count_leave = (existing.count_leave || 0) + 0.5;
                }
                existing.billableqty += billableqty;
                existing.count += 1;
            }
            //If Not Found → Push a New Entry
            else {
                let initial_count_leave = 0;
                if (sg_ts_activity_type === 'Leave') {
                    initial_count_leave = 1;
                } else if (sg_ts_activity_type === 'HalfDay_Delivery') {
                    initial_count_leave = 0.5;
                }
                result[employeeKey].projects[project].push({
                    billing_status,
                    billableqty,
                    count: 1,
                    sg_position_role,
                    count_leave: initial_count_leave,
                    sg_billing_method,
                    sg_ts_activity_type
                });
            }
        });

        // Iterate through rawProjectData to collect unique dates for each employee
        const employeeUniqueDates = new Map<string, Set<string>>();
        this.rawProjectData.forEach((entry) => {
            const employee = entry.sg_employee;
            const dateStr = entry.sg_ts_date;

            if (!employee || !dateStr) return; // Guard clause to skip invalid entries

            const date = dateStr.split('T')[0]; // safe now
            if (!employeeUniqueDates.has(employee)) {
                employeeUniqueDates.set(employee, new Set());
            }

            employeeUniqueDates.get(employee)!.add(date);
        });

        // Calculate Missing Timesheet Days
        const ans: { [employee: string]: number } = {};
        employeeUniqueDates.forEach((dateSet, employee) => {
            // ans[employee] = this.totalDays - dateSet.size;
            ans[employee] = this.totalWorkingDays - dateSet.size;
        });
        console.log('Missing Timesheet Days: ', ans);

        // Convert to array format for HTML
        this.projectTableData = Object.entries(result).map(([key, data]) => ({
            // This gives static info like name, geography, title, department, etc.
            employee: data.employeeMeta.sg_employee,
            sg_position_title: data.employeeMeta.sg_position_title,
            sg_employee_department: data.employeeMeta.sg_employee_department,
            sg_geography: data.employeeMeta.sg_geography,
            sg_project_department: data.employeeMeta.sg_project_department,
            sg_position_role: data.employeeMeta.sg_position_role,
            // Each project may have multiple statuses
            projects: Object.entries(data.projects).map(([project, statuses]) => {
                // For Each Status → Compute Detailed Billing Info
                const billingDetails = statuses.map((item) => ({
                    billing_status: item.billing_status,
                    sg_billing_method: item.sg_billing_method,
                    total_hours: item.billableqty,
                    total_ts_fill_hrs: ['Learning', 'HalfDay_Delivery', 'Delivery'].includes(item.sg_ts_activity_type) ? item.billableqty : 0,
                    sg_position_role: item.sg_position_role,
                    total_billable_hr_company:
                        item.billing_status === 'Billable' && (item.sg_billing_method === 'TM Billable - Rec' || item.sg_billing_method === 'TM Billable' || item.sg_billing_method === 'FC Billable') ? parseFloat(String(item.billableqty)) || 0 : 0,
                    total_billable_hr_person:
                        (item.billing_status === 'Billable' || item.billing_status === 'Extension') &&
                        (item.sg_billing_method === 'TM Billable - Rec' || item.sg_billing_method === 'TM Billable' || item.sg_billing_method === 'FC Billable' || item.sg_billing_method === 'PR Billable')
                            ? parseFloat(String(item.billableqty)) || 0
                            : 0,
                    total_non_billable_hr: !['Billable', 'Extension', 'Learning', 'Onboarding'].includes(item.billing_status) ? item.billableqty : 0,
                    total_leave: item.count_leave, // leave + half day Delivery
                    missing_timeSheet: Math.max(ans[data.employeeMeta.sg_employee] || 0, 0) * 8,
                    GCW_hrs: ['GCWFull', 'GCWHalf'].includes(item.sg_ts_activity_type) ? item.billableqty : 0
                }));

                const totalBillableHrs_company = billingDetails.reduce((sum, item) => sum + item.total_billable_hr_company, 0);
                const totalTsFillHrs = billingDetails.reduce((sum, item) => sum + item.total_ts_fill_hrs, 0);
                const totalBillableHrs_person = billingDetails.reduce((sum, item) => sum + item.total_billable_hr_person, 0);

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

    toggleExpand(component: 'pie' | 'bar' | 'table' | null): void {
        this.isExpanded = !this.isExpanded;
        this.expandedComponent = this.isExpanded ? component : null;
    }

    handleGeographyClick(selectedGeography: string): void {
        this.ngZone.run(() => {
            // Toggle logic: if already selected, reset; else, select
            if (!selectedGeography || selectedGeography === 'All' || this.geography[0] === selectedGeography) {
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
            // Toggle logic: if already selected, reset; else, select
            if (!selectedDepartment || this.emp_department[0] === selectedDepartment) {
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

            this.cdr.detectChanges();
        });
    }

    resetFilters(): void {
        try {
            this.isLoading = true;

            // Keep current date range
            const currentDateRange = {
                startDate: this.startDate,
                endDate: this.endDate
            };

            // Reset filter selections
            this.emp_department = [];
            this.project = [];
            this.pro_department = [];
            this.positionTitle = [];
            this.geography = [];
            this.emp_name = [];

            // Reset selection states
            this.selectedGeography = null;
            this.selectedGeographyIndex = null;
            this.selectedDepartment = null;

            this.ngZone.run(async () => {
                // Use existing fullDataset without making service call
                this.rawProjectData = [...this.fullDataset];

                // Calculate total days
                this.totalWorkingDays = await this.calculateWorkingDaysExcludingWeekendsAndHolidays(currentDateRange.startDate, currentDateRange.endDate);

                // Update table data
                this.groupProjectData();

                // Repopulate filter options
                this.populateFilterOptions();

                // Update global state with reset filters but keep date range
                const pageKey = 'page1';
                this.afterglobalfilter = {
                    startDate: currentDateRange.startDate,
                    endDate: currentDateRange.endDate,
                    emp_department: [],
                    pro_department: [],
                    project: [],
                    positionTitle: [],
                    geography: [],
                    emp_name: []
                };

                // Save full dataset and filters in global state
                this.globalState.setFilters(pageKey, this.afterglobalfilter);
                this.globalState.setFilteredData(pageKey, this.projectTableData);
                this.globalState.setFullDataset(pageKey, this.fullDataset);

                this.cdr.detectChanges();
            });
        } catch (error) {
            console.error('Error resetting filters:', error);
        } finally {
            this.isLoading = false;
        }
    }
}
