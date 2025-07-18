import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ApiService } from '../../services/tgv.service';
import { ArasService } from '../../services/aras.service';
import { ArasService1 } from '../../services/aras1.service';
import { firstValueFrom } from 'rxjs';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ExportService } from './components/project-table/Excel/excel';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { BarChartComponent } from './components/bar-chart/bar-chart.component';
import { ProjectTableComponent } from './components/project-table/project-table.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderComponent } from './components/loader/loader.component';
import { ProjectDataMap } from './components/interfaces/interface';
import { XmlParserService } from '../../services/xml-parser.service';
import { MultiselectFilterDemo } from '../../components/multiselect/multiselect.component';

@Component({
    selector: 'app-chart-demo',
    standalone: true,
    imports: [
        MultiselectFilterDemo,
        CommonModule,
        ChartModule,
        FluidModule,
        FormsModule,
        TableModule,
        ScrollPanelModule,
        SplitButtonModule,
        ButtonModule,
        PieChartComponent,
        BarChartComponent,
        ProjectTableComponent,
        ProgressSpinnerModule,
        LoaderComponent
    ],
    templateUrl: './chart.html'
})
export class ChartDemo implements OnInit {
    pageKey: string = 'page2';
    isLoading: boolean = false;
    allContracts: any[] = [];
    filteredContracts: any[] = [];
    selectedProject: string | null = null;
    selectedProjectData: any[] = [];
    projectTableData: any[] = [];
    selectedProjectIndex: number | null = null;
    uniqueGeographies: string[] = [];
    uniqueBillingMethods: string[] = [];
    uniqueCustomers: string[] = [];
    showStartDateError: boolean = false;
    showEndDateError: boolean = false;
    minEndDate: Date | null = null;

    filters = {
        status: ['Active'] as string[],
        geography: [] as string[], // multi-select returns array of strings
        billingMethod: [] as string[], // multi-select returns array of strings
        project: [] as string[]
    };

    filtersRestored = false;
    uniqueStatuses: string[] = [];
    availableRoles: string[] = [];
    selectedRole: string = '';
    uniqueBillingStatuses: string[] = [];
    selectedBillingStatus: string = '';
    exportOptions: MenuItem[] | undefined;
    cwoStatus: string = 'Active';
    StatusList: string[] = ['Active'];
    RegionList: string[] = [];
    BillingMethodList: string[] = [];
    CustomerList: string[] = [];
    paramMap: Record<string, string> = {};
    tgvdXmlString: string = '';
    geographyOptionswc: { label: string; value: string }[] = [];
    billingMethodOptionswc: { label: string; value: string }[] = [];
    customerOptionswc: { label: string; value: string }[] = [];
    projectDistributionwc: { label: string; value: string }[] = [];
    statusoptionswc: { label: string; value: string }[] = [];
    isExpanded: boolean = false;
    expandedComponent: 'pie' | 'bar' | 'table' | null = null;
    private originalBillingMethods: string[] = [];
    private originalProjects: string[] = [];
    displayedProjects: string[] = [];
    fullDataset: any[] = [];

    constructor(
        private ApiService: ApiService,
        private cdr: ChangeDetectorRef,
        private arasService: ArasService,
        private arasService1: ArasService1,
        private exportService: ExportService,
        private xmlParserService: XmlParserService
    ) {}

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
    };
    private buildOptions(list: string[]): { label: string; value: string }[] {
        const sorted = [...list].filter((x) => x !== 'All').sort((a, b) => a.localeCompare(b));
        return [...sorted.map((item) => ({ label: item, value: item }))]; // { label: 'All', value: '' },
    }

    async ngOnInit(): Promise<void> {
        this.isLoading = true;
        let paramMapString: string = '';
        const pageKey = 'page1';
        this.statusoptionswc = this.buildOptions(this.StatusList);

        try {
            // 1st service: fetch TGVD XML
            const tgvdResponse = await firstValueFrom(this.arasService.fetchTgvdItem());
            this.tgvdXmlString = tgvdResponse.toString();

            // 2nd service: fetch QB values and parse XML
            const qbResponse = await firstValueFrom(this.arasService1.fetchQBValueItem());
            const result = await this.xmlParserService.parseXml(qbResponse);

            const paramMap = await new Promise<Record<string, string>>((resolve, reject) => {
                try {
                    const items = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'].Result.Item.Relationships.Item;
                    const itemArray = Array.isArray(items) ? items : [items];
                    const map: Record<string, string> = {};

                    itemArray.forEach((item: any) => {
                        const key = item.qd_parameter_name;
                        const value = item.user_input_default_value?._ || item.user_input_default_value;
                        if (key) map[key] = value;
                    });

                    resolve(map);
                } catch (parseError) {
                    reject(parseError);
                }
            });

            this.cwoStatus = paramMap['sg_work_contract_state'];
            this.filters.status = [this.cwoStatus];
            this.paramMap = paramMap;
            paramMapString = JSON.stringify(this.paramMap);

            // 3rd service: fetch contracts
            const updatedParamMap = { ...this.paramMap };
            updatedParamMap['sg_work_contract_state'] = 'Active';

            await this.fetchAndProcessContracts(updatedParamMap, this.tgvdXmlString);

            // ✅ NEW: Save full dataset for filtering
            this.fullDataset = [...this.allContracts];

            // ✅ NEW: Do not manually filter here — just apply filters using the central method
            await this.applyFilters();

            // ✅ Reset selection defaults after filters applied
            this.selectedProject = 'All';
            this.selectedProjectIndex = -1;
        } catch (error) {
            console.error('Error in sequential service calls:', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    private getNormalizedProjectName(project: string | null | undefined): string {
        const name = project?.trim();
        return name && name.length > 0 ? name : 'Unknown';
    }

    async fetchAndProcessContracts(paramMap: Record<string, string>, tgvdXmlString: string): Promise<void> {
        console.log('passed', paramMap);
        const paramMapString = JSON.stringify(paramMap);
        const data = await firstValueFrom(this.ApiService.getTreeGridData(tgvdXmlString, paramMapString));

        // Process received contract data
        this.allContracts = data; // assign recieved data to allcontract variable
        this.filteredContracts = [...this.allContracts]; // assign data to filtercontract also

        this.uniqueStatuses = [...new Set(this.allContracts.map((c) => c.Status?.trim() || 'Unknown'))];
        this.uniqueGeographies = [...new Set(this.allContracts.map((c) => c.Geography?.trim() || 'Unknown'))];
        this.uniqueBillingMethods = [...new Set(this.allContracts.map((c) => c['Billing Method']?.trim() || 'Unknown'))];
        this.uniqueCustomers = [...new Set(this.allContracts.map((c) => c.Customer?.trim() || 'Unknown'))];

        // Store original values here, after creating unique lists but before sorting
        this.originalBillingMethods = [...this.uniqueBillingMethods];

        // data in filter goes by data by below lines
        this.uniqueGeographies.sort((a, b) => a.localeCompare(b));
        this.uniqueBillingMethods.sort((a, b) => a.localeCompare(b));

        this.geographyOptionswc = this.buildOptions(this.uniqueGeographies);
        this.billingMethodOptionswc = this.buildOptions(this.uniqueBillingMethods);

        //const projectNames = this.allContracts.map((c) => (c.Project?.trim() && c.Project.trim().length > 0 ? c.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`));
        const projectNames = this.allContracts.map((c) => this.getNormalizedProjectName(c.Project));

        this.originalProjects = [...new Set(projectNames)];
        console.log('Project distribution:', projectNames);
        const tempLabels = [...new Set(projectNames)];
        this.selectedProject = tempLabels[0];
        this.selectedProjectIndex = 0;

        const projectDataMap: { [project: string]: any[] } = {};
        this.allContracts.forEach((contract) => {
            //const projectKey = contract.Project?.trim() && contract.Project.trim().length > 0 ? contract.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`;
            const projectKey = this.getNormalizedProjectName(contract.Project);

            if (!projectDataMap[projectKey]) projectDataMap[projectKey] = [];
            projectDataMap[projectKey].push(contract);
        });
        console.log('Projectdatamap:', Object.keys(projectDataMap));
        if (this.selectedProject && projectDataMap[this.selectedProject]) {
            this.handleProjectSelection(this.selectedProject, projectDataMap);
        }
        this.projectDistributionwc = this.buildOptions(Object.keys(projectDataMap));
        console.log(this.projectDistributionwc);
    }

    // Update the updateDependentFilters method
    private updateDependentFilters(): void {
        const { geography, billingMethod } = this.filters;

        // If no filters are selected, restore original values
        if (!geography.length && !billingMethod.length) {
            this.billingMethodOptionswc = this.buildOptions(this.originalBillingMethods);
            this.projectDistributionwc = this.buildOptions(this.originalProjects);
            return;
        }

        // Filter contracts based on selected criteria
        const filteredContracts = this.allContracts.filter((contract) => {
            const geographyMatch = !geography.length || geography.some((g) => g.toLowerCase() === (contract.Geography?.toString().toLowerCase() || ''));
            const billingMethodMatch = !billingMethod.length || billingMethod.some((b) => b.toLowerCase() === (contract['Billing Method']?.toString().toLowerCase() || ''));
            return geographyMatch && billingMethodMatch;
        });

        // Update billing method options if geography is selected
        if (geography.length && !billingMethod.length) {
            const filteredBillingMethods = [...new Set(filteredContracts.map((c) => c['Billing Method']?.trim() || 'Unknown').filter(Boolean))].sort();
            this.billingMethodOptionswc = this.buildOptions(filteredBillingMethods);
        }

        // Update project options based on all filters
        const filteredProjects = [...new Set(filteredContracts.map((c) => c.Project?.trim() || 'Unknown').filter(Boolean))].sort();
        this.projectDistributionwc = this.buildOptions(filteredProjects);

        // Clear invalid selections
        this.filters.billingMethod = this.filters.billingMethod.filter((bm) => this.billingMethodOptionswc.some((opt) => opt.value === bm));
        this.filters.project = this.filters.project.filter((p) => this.projectDistributionwc.some((opt) => opt.value === p));
    }

    // Add method to handle billing method changes
    onBillingMethodChange(event: string[]): void {
        this.filters.billingMethod = event;
        this.updateDependentFilters();
        this.cdr.detectChanges();
    }
    // Add method to handle geography filter changes
    onGeographyChange(event: string[]): void {
        this.filters.geography = event;
        this.updateDependentFilters();
        this.cdr.detectChanges();
    }

    async applyFilters(): Promise<void> {
        const { status, geography, billingMethod, project } = this.filters;

        this.filteredContracts = this.fullDataset.filter((item) => {
            // Active status only
            const statusMatch = item.Status?.toString().toLowerCase() === 'active';
            if (!statusMatch) return false;

            // Geography match
            const geographyMatch = !geography.length || geography.some((g) => g.toLowerCase() === (item.Geography?.toString().toLowerCase() || 'n/a'));
            if (!geographyMatch) return false;

            // Billing method match
            const billingMethodMatch = !billingMethod.length || billingMethod.some((b) => b.toLowerCase() === (item['Billing Method']?.toString().toLowerCase() || 'n/a'));
            if (!billingMethodMatch) return false;

            // Project match (normalized)
            const projectMatch = !project.length || project.some((c) => this.getNormalizedProjectName(c).toLowerCase() === this.getNormalizedProjectName(item.Project).toLowerCase());

            return projectMatch;
        });

        if (this.filteredContracts.length === 0) {
            this.resetComponentState(); // Reset charts and tables
            return;
        }

        // Derive displayed projects from filtered data
        const filteredProjectNames = [...new Set(this.filteredContracts.map((c) => this.getNormalizedProjectName(c.Project)))];

        this.projectDistributionwc = [{ label: 'All', value: '' }, ...this.buildOptions(filteredProjectNames)];
        this.displayedProjects = filteredProjectNames;
        // Call function to sync other views like pie chart
        this.updateProjectsAfterFilter();
    }

    onProjectSelected(project: string): void {
        if (!project || project === 'All') {
            this.filters.project = [];
        } else if (this.filters.project.includes(project)) {
            this.filters.project = []; // Deselect if already selected
        } else {
            this.filters.project = [project]; // Select only this
        }

        // this.applyFilters();
        const projectDataMap = this.buildProjectDataMap();
        this.onProjectClick({ project, index: -1 }); // index can be -1 for dropdown
    }

    toggleExpand(component: 'pie' | 'bar' | 'table') {
        if (this.expandedComponent === component && this.isExpanded) {
            // Collapse the component
            this.isExpanded = false;
            this.expandedComponent = null;

            // Re-render with current selection
            if (component === 'pie' && this.selectedProject) {
                const projectDataMap = this.buildProjectDataMap();
                this.handleProjectSelection(this.selectedProject, projectDataMap);
            }
        } else {
            // Expand the selected component
            this.expandedComponent = component;
            this.isExpanded = true;
        }
        this.cdr.detectChanges();
    }

    private resetComponentState(): void {
        this.selectedProject = null;
        this.selectedProjectIndex = null;
        this.projectTableData = [];
        this.selectedProjectData = [];
        this.availableRoles = [];
        this.uniqueBillingStatuses = [];
        this.selectedRole = '';
        this.selectedBillingStatus = '';
        this.cdr.detectChanges();
    }

    private updateProjectsAfterFilter(): void {
        const projectDataMap = this.buildProjectDataMap();
        const tempLabels = Object.keys(projectDataMap);

        if (tempLabels.length > 0) {
            this.selectedProject = 'All';
            this.selectedProjectIndex = -1;
            this.selectedProjectData = this.filteredContracts;
            this.projectTableData = this.filteredContracts;
            // Optionally update filters, roles, etc.
            this.availableRoles = [...new Set(this.selectedProjectData.map((c) => c['Position Role']).filter(Boolean))];
            this.uniqueBillingStatuses = [...new Set(this.selectedProjectData.map((c) => c['Billing Status']).filter(Boolean))];
            this.selectedRole = '';
            this.selectedBillingStatus = '';
        } else {
            this.resetComponentState();
        }
        this.cdr.detectChanges();
    }

    onGlobalFilter(event: Event, dt: any) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }

    onProjectClick(event: { project: string; index: number }): void {
        const normalizedProject = this.getNormalizedProjectName(event.project);

        const isSameProjectSelected = this.filters.project.length === 1 && this.getNormalizedProjectName(this.filters.project[0]).toLowerCase() === normalizedProject.toLowerCase();

        if (normalizedProject === 'All' || isSameProjectSelected) {
            // 🔁 Case: Deselect or 'All' selected -> reset everything
            this.selectedProject = 'All';
            this.selectedProjectIndex = -1;
            this.filters.project = [];

            this.applyFilters(); // 🔁 Triggers rebuild of filteredContracts, displayedProjects, etc.

            // 🔁 Reset bar chart and table data
            this.selectedProjectData = this.filteredContracts;
            this.projectTableData = this.selectedProjectData;

            // 🔁 Reset subfilters
            this.updateRolesAndBillingList(this.selectedProjectData);
            this.selectedRole = '';
            this.selectedBillingStatus = '';

            this.cdr.detectChanges();
        } else {
            // ✅ Case: Selecting a new specific project
            this.selectedProject = normalizedProject;
            this.selectedProjectIndex = event.index;
            this.filters.project = [normalizedProject];

            const projectDataMap = this.buildProjectDataMap();
            this.selectedProjectData = projectDataMap[normalizedProject] || [];
            this.projectTableData = this.selectedProjectData;

            this.displayedProjects = [normalizedProject];

            this.updateRolesAndBillingList(this.selectedProjectData);
            this.selectedRole = '';
            this.selectedBillingStatus = '';

            this.cdr.detectChanges();
        }
    }

    private updateRolesAndBillingList(data: any[]): void {
        this.availableRoles = [...new Set(data.map((c) => c['Position Role']).filter(Boolean))];
        this.uniqueBillingStatuses = [...new Set(data.map((c) => c['Billing Status']).filter(Boolean))];
    }

    private buildProjectDataMap(): ProjectDataMap {
        return this.filteredContracts.reduce((acc, contract) => {
            const project = this.getNormalizedProjectName(contract.Project);
            if (!acc[project]) acc[project] = [];
            acc[project].push(contract);
            return acc;
        }, {} as ProjectDataMap);
    }

    handleProjectSelection(project: string, projectDataMap: ProjectDataMap): void {
        this.selectedProject = project;
        this.selectedProjectData = projectDataMap[project] || [];
        this.projectTableData = this.selectedProjectData;

        // Get unique values for filters
        this.availableRoles = [...new Set(this.selectedProjectData.map((c) => c['Position Role']).filter(Boolean))];
        this.uniqueBillingStatuses = [...new Set(this.selectedProjectData.map((c) => c['Billing Status']).filter(Boolean))];

        // Reset filters when changing projects
        this.selectedRole = '';
        this.selectedBillingStatus = '';

        this.cdr.detectChanges();
    }

    onRoleChanged(role: string): void {
        this.selectedRole = role;
        this.cdr.detectChanges();
    }

    onBillingStatusChanged(status: string): void {
        this.selectedBillingStatus = status;
        this.cdr.detectChanges();
    }

    resetFilters(): void {
        this.filters = {
            status: ['Active'],
            geography: [],
            billingMethod: [],
            project: []
        };

        // Reset to original options
        this.billingMethodOptionswc = this.buildOptions(this.originalBillingMethods);
        this.displayedProjects = [...this.originalProjects];
        this.projectDistributionwc = this.buildOptions(this.originalProjects);
        this.selectedRole = '';
        this.selectedBillingStatus = '';
        this.applyFilters();
    }
}
