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
import { RegionService } from '../../services/region.service';
import{billingMethodWCService} from '../../services/billingMethod_wc';
import{CustomerService} from '../../services/customer_wc';

@Component({
    selector: 'app-chart-demo',
    standalone: true,
    imports: [CommonModule, ChartModule, FluidModule, FormsModule, TableModule, ScrollPanelModule, SplitButtonModule, ButtonModule, PieChartComponent, BarChartComponent, ProjectTableComponent, ProgressSpinnerModule, LoaderComponent],
    templateUrl: './chart.html'
})
export class ChartDemo implements OnInit {
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

    filters = {
        startDate: '',
        endDate: '',
        status: 'Active',
        geography: '',
        billingMethod: '',
        customer: ''
    };

    uniqueStatuses: string[] = [];
    availableRoles: string[] = [];
    selectedRole: string = '';
    uniqueBillingStatuses: string[] = [];
    selectedBillingStatus: string = '';
    exportOptions: MenuItem[] | undefined;

    cwoStartDate: string = '';
    cwoEndDate: string = '';
    cwoStatus: string = '';
    RegionList: string[] = [];
    BillingMethodList: string[] = [];
    CustomerList: string[] = [];

    constructor(
        private ApiService: ApiService,
        private cdr: ChangeDetectorRef,
        private arasService: ArasService,
        private arasService1: ArasService1,
        private exportService: ExportService,
        private xmlParserService: XmlParserService,
        private RegionService: RegionService,
        private billingMethodWCService: billingMethodWCService,
        private CustomerService: CustomerService
    ) {}

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
    };

    async ngOnInit(): Promise<void> {
        this.isLoading = true;
        let tgvdXmlString: string = '';
        let paramMapString: string = '';

        // service: fetch region item
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
                console.log('Extracted sg_role list:', this.RegionList);
            },
            error: (error) => {
                console.error('Error fetching role item:', error);
            }
        });

        // service: fetch Billing method item
          this.billingMethodWCService.fetchBillingItem().subscribe({
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
                            this.BillingMethodList.push(item.value);
                        }
                    }
                }
                this.BillingMethodList.sort((a, b) => a.localeCompare(b));
                console.log('Extracted sg_role list:', this.BillingMethodList);
            },
            error: (error) => {
                console.error('Error fetching role item:', error);
            }
        });

        // serice: fetch customer item
         this.CustomerService.fetchCustomerItem().subscribe({
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
                            this.CustomerList.push(item.keyed_name);
                        }
                    }
                }
                this.CustomerList.sort((a, b) => a.localeCompare(b));
                console.log('Extracted Department list:', this.CustomerList);
            },
            error: (error) => {
                console.error('Error fetching role item:', error);
            }
        });



        try {
            // 1st service: fetch TGVD XML
            const tgvdResponse = await firstValueFrom(this.arasService.fetchTgvdItem());
            tgvdXmlString = tgvdResponse.toString();

            // 2nd service: fetch QB values and parse XML
            const qbResponse = await firstValueFrom(this.arasService1.fetchQBValueItem());
            const result = await this.xmlParserService.parseXml(qbResponse);
            // Convert callback-style parseString to a promise
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
            
            this.cwoStartDate = paramMap['sg_cwo_start'].split('T')[0];
            this.cwoEndDate = paramMap['sg_cwo_end'].split('T')[0];
            this.cwoStatus = paramMap['sg_work_contract_state'];
            this.filters.startDate = this.cwoStartDate;
            this.filters.endDate = this.cwoEndDate;
            this.filters.status = this.cwoStatus;

            paramMapString = JSON.stringify(paramMap);

            // 3rd service: get TreeGrid data
            const data = await firstValueFrom(this.ApiService.getTreeGridData(tgvdXmlString, paramMapString));

            // Process received contract data
            this.allContracts = data;
            this.filteredContracts = [...this.allContracts];

            this.uniqueStatuses = [...new Set(this.allContracts.map((c) => c.Status?.trim() || 'Unknown'))];
            this.uniqueGeographies = [...new Set(this.allContracts.map((c) => c.Geography?.trim() || 'Unknown'))];
            this.uniqueBillingMethods = [...new Set(this.allContracts.map((c) => c['Billing Method']?.trim() || 'Unknown'))];
            this.uniqueCustomers = [...new Set(this.allContracts.map((c) => c.Customer?.trim() || 'Unknown'))];

            const projectNames = this.allContracts.map((c) => (c.Project?.trim() && c.Project.trim().length > 0 ? c.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`));

            const tempLabels = [...new Set(projectNames)];
            this.selectedProject = tempLabels[0];
            this.selectedProjectIndex = 0;

            //this.renderPieChart();

            const projectDataMap: { [project: string]: any[] } = {};
            this.allContracts.forEach((contract) => {
                const projectKey = contract.Project?.trim() && contract.Project.trim().length > 0 ? contract.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`;

                if (!projectDataMap[projectKey]) projectDataMap[projectKey] = [];
                projectDataMap[projectKey].push(contract);
            });

            if (this.selectedProject && projectDataMap[this.selectedProject]) {
                this.handleProjectSelection(this.selectedProject, projectDataMap);
            }

            
        } catch (error) {
            console.error('Error in sequential service calls:', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    applyFilters(): void {
        const { startDate, endDate, status, geography, billingMethod, customer } = this.filters;
        const userStart = startDate ? new Date(startDate) : null;
        const userEnd = endDate ? new Date(endDate) : null;

        // Apply filters
        this.filteredContracts = this.allContracts.filter((item) => {
            const itemStart = new Date(item['Start Date']);
            const itemEnd = new Date(item['End Date']);
            const isDateMatch = !userStart || !userEnd || (itemEnd >= userStart && itemStart <= userEnd);

            const statusMatch = !status || item.Status?.toString().toLowerCase() === status.toLowerCase();
            const geographyMatch = !geography || item.Geography?.toString().toLowerCase() === geography.toLowerCase();
            const billingMethodMatch = !billingMethod || item['Billing Method']?.toString().toLowerCase() === billingMethod.toLowerCase();
            const customerMatch = !customer || item.Customer?.toString().toLowerCase() === customer.toLowerCase();

            return isDateMatch && statusMatch && geographyMatch && billingMethodMatch && customerMatch;
        });

        // Reset everything if no data matches filters
        if (this.filteredContracts.length === 0) {
            this.resetComponentState();
            return;
        }

        // Continue with normal filter processing
        this.updateProjectsAfterFilter();
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
            const firstProject = tempLabels[0];
            this.selectedProject = firstProject;
            this.selectedProjectIndex = tempLabels.indexOf(firstProject);
            this.handleProjectSelection(firstProject, projectDataMap);
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
        const projectDataMap = this.buildProjectDataMap();
        this.selectedProject = event.project;
        this.selectedProjectIndex = event.index;
        this.handleProjectSelection(event.project, projectDataMap);
    }

    private buildProjectDataMap(): ProjectDataMap {
        return this.filteredContracts.reduce((acc, contract) => {
            const project = contract.Project || 'Unknown';
            if (!acc[project]) {
                acc[project] = [];
            }
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
            startDate: this.cwoStartDate,
            endDate: this.cwoEndDate,
            status: this.cwoStatus,
            geography: '',
            billingMethod: '',
            customer: ''
        };
        this.selectedRole = '';
        this.selectedBillingStatus = '';
        this.filteredContracts = this.allContracts;

        this.applyFilters();
        this.cdr.detectChanges();
    }
}
