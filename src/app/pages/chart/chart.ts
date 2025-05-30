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
import { billingMethodWCService } from '../../services/billingMethod_wc';
import { CustomerService } from '../../services/customer_wc';
import { MultiselectFilterDemo } from '../../components/multiselect/multiselect.component';
import { DatePickerIconDemo } from '../../components/date/date.component';
import { GlobalStateService } from '../../services/globalservicefilters';

@Component({
    selector: 'app-chart-demo',
    standalone: true,
    imports: [DatePickerIconDemo, MultiselectFilterDemo, CommonModule, ChartModule, FluidModule, FormsModule, TableModule, ScrollPanelModule, SplitButtonModule, ButtonModule, PieChartComponent, BarChartComponent, ProjectTableComponent, ProgressSpinnerModule, LoaderComponent],
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

    filters = {
        startDate: '',
        endDate: '',
        status: [] as string[],
        geography: [] as string[],       // multi-select returns array of strings
        billingMethod: [] as string[],   // multi-select returns array of strings
        // customer: [] as string[],
        project: [] as string[]
    };
    filtersRestored = false;
    uniqueStatuses: string[] = [];
    availableRoles: string[] = [];
    selectedRole: string = '';
    uniqueBillingStatuses: string[] = [];
    selectedBillingStatus: string = '';
    exportOptions: MenuItem[] | undefined;

    cwoStartDate: string = '';
    cwoEndDate: string = '';
    cwoStatus: string = '';
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

    constructor(
        private ApiService: ApiService,
        private cdr: ChangeDetectorRef,
        private arasService: ArasService,
        private arasService1: ArasService1,
        private exportService: ExportService,
        private xmlParserService: XmlParserService,
        private RegionService: RegionService,
        private billingMethodWCService: billingMethodWCService,
        private CustomerService: CustomerService,
        private globalState: GlobalStateService
    ) { }

    // Function to call exportToExcel from the service
    exportData = () => {
        this.exportService.exportToExcel(this.projectTableData);
    };
    private buildOptions(list: string[]): { label: string; value: string }[] {
        const sorted = [...list].filter(x => x !== 'All').sort((a, b) => a.localeCompare(b));
        return [ ...sorted.map(item => ({ label: item, value: item }))];   // { label: 'All', value: '' },
    }
    async ngOnInit(): Promise<void> {
        this.isLoading = true;
        // let tgvdXmlString: string = '';
        let paramMapString: string = '';
        let newsStr: string = '';
        const pageKey = 'page1';

        // const savedFilters = this.globalState.getFilters(this.pageKey);
        // const savedData = this.globalState.getFilteredData(this.pageKey);

        // if (savedFilters && savedData.length > 0) {
        //     this.filters = { ...savedFilters };
        //     this.filteredContracts = savedData;
        //     this.allContracts = savedData;
        //     this.isLoading = false;
        //     this.filtersRestored = true;
        //     this.cdr.detectChanges();
        //     // return;
        // }


        // service: fetch region item
        // this.RegionService.fetchRegionItem().subscribe({
        //     next: (response) => {
        //         console.log('Service response:', response);

        //         let parsedResponse: any = response;

        //         // If response is a string, try to parse it as JSON
        //         if (typeof response === 'string') {
        //             try {
        //                 parsedResponse = JSON.parse(response);
        //             } catch (e) {
        //                 console.error('Failed to parse response as JSON:', e);
        //                 return;
        //             }
        //         }

        //         // Loop through the array inside "value" and extract sg_role
        //         if (parsedResponse && Array.isArray(parsedResponse.value)) {
        //             for (const item of parsedResponse.value) {
        //                 if (item.value) {
        //                     this.RegionList.push(item.value);
        //                 }
        //             }
        //         }
        //         this.RegionList.sort((a, b) => a.localeCompare(b));
        //         console.log('Extracted sg_role list:', this.RegionList);
        //         this.geographyOptionswc = this.buildOptions(this.RegionList);
        //     },
        //     error: (error) => {
        //         console.error('Error fetching role item:', error);
        //     }
        // });

        // service: fetch status item
        // this.statusoptionswc = [
        //     { label: 'Active', value: 'Active' }
        // ];
        this.statusoptionswc = this.buildOptions(this.StatusList);
        console.log('Status options:', this.statusoptionswc);

        // service: fetch Billing method item
        // this.billingMethodWCService.fetchBillingItem().subscribe({
        //     next: (response) => {
        //         console.log('Service response:', response);

        //         let parsedResponse: any = response;

        //         // If response is a string, try to parse it as JSON
        //         if (typeof response === 'string') {
        //             try {
        //                 parsedResponse = JSON.parse(response);
        //             } catch (e) {
        //                 console.error('Failed to parse response as JSON:', e);
        //                 return;
        //             }
        //         }

        //         // Loop through the array inside "value" and extract sg_role
        //         if (parsedResponse && Array.isArray(parsedResponse.value)) {
        //             for (const item of parsedResponse.value) {
        //                 if (item.value) {
        //                     this.BillingMethodList.push(item.value);
        //                 }
        //             }
        //         }
        //         this.BillingMethodList.sort((a, b) => a.localeCompare(b));
        //         this.billingMethodOptionswc = this.buildOptions(this.BillingMethodList);
        //         console.log('Extracted sg_role list:', this.BillingMethodList);
        //     },
        //     error: (error) => {
        //         console.error('Error fetching role item:', error);
        //     }
        // });

        // serice: fetch customer item
        // this.CustomerService.fetchCustomerItem().subscribe({
        //     next: (response) => {
        //         // const rolesList: string[] = [];
        //         let parsedResponse: any = response;

        //         // If response is a string, try to parse it as JSON
        //         if (typeof response === 'string') {
        //             try {
        //                 parsedResponse = JSON.parse(response);
        //             } catch (e) {
        //                 console.error('Failed to parse response as JSON:', e);
        //                 return;
        //             }
        //         }

        //         // Loop through the array inside "value" and extract sg_role
        //         if (parsedResponse && Array.isArray(parsedResponse.value)) {
        //             for (const item of parsedResponse.value) {
        //                 if (item.keyed_name) {
        //                     this.CustomerList.push(item.keyed_name);
        //                 }
        //             }
        //         }
        //         this.CustomerList.sort((a, b) => a.localeCompare(b));
        //         this.customerOptionswc = this.buildOptions(this.CustomerList);
        //         console.log('Extracted Department list:', this.CustomerList);
        //     },
        //     error: (error) => {
        //         console.error('Error fetching role item:', error);
        //     }
        // });

        // if (this.filtersRestored) {
        //     return;  //  Only apply if nothing was restored
        // }


        try {
            // 1st service: fetch TGVD XML
            const tgvdResponse = await firstValueFrom(this.arasService.fetchTgvdItem());
            this.tgvdXmlString = tgvdResponse.toString();

            // 2nd service: fetch QB values and parse XML
            const qbResponse = await firstValueFrom(this.arasService1.fetchQBValueItem());
            const result = await this.xmlParserService.parseXml(qbResponse);
            // Convert callback-style parseString to a promise
            console.log("Hello", result)
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
            console.log("default paramap", paramMap)

            // this.cwoStartDate = paramMap['sg_cwo_start'].split('T')[0];
            // this.cwoEndDate = paramMap['sg_cwo_end'].split('T')[0];
            this.cwoStatus = paramMap['sg_work_contract_state'];
            // this.filters.startDate = this.cwoStartDate;
            // this.filters.endDate = this.cwoEndDate;
            this.filters.status = [this.cwoStatus];

            // paramMapString = JSON.stringify(paramMap);

            this.paramMap = paramMap; // Save for reuse
            paramMapString = JSON.stringify(this.paramMap);
            // 3rd service 
            // update cwo date to financial yr to current date 
            const updatedParamMapFinance = { ...this.paramMap };
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0 = Jan, 3 = Apr

            // Determine financial year start: If before April, go to previous year
            const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
            const fyEndYear = currentYear +1;
            updatedParamMapFinance['sg_cwo_start'] = `${fyStartYear}-04-01T00:00:00`;
            const today = new Date();
            updatedParamMapFinance['sg_cwo_end'] = `${fyEndYear}-03-31T00:00:00`;
            console.log(updatedParamMapFinance);
            this.cwoStartDate = updatedParamMapFinance['sg_cwo_start'].split('T')[0];
            this.cwoEndDate = updatedParamMapFinance['sg_cwo_end'].split('T')[0];
            this.filters.startDate = this.cwoStartDate;
            this.filters.endDate = this.cwoEndDate;
            await this.fetchAndProcessContracts(updatedParamMapFinance, this.tgvdXmlString);

            // console.log('Parsed parameter map:', paramMapString);
            // newsStr = JSON.stringify({"sg_work_contract_state":"Active","sg_wct_project":"*","sg_project_manager":"*","sg_pwo_start":"2024-04-01T00:00:00","sg_pwo_end":"2027-03-31T00:00:00","sg_rate_card":"*","sg_cwo_start":"2025-04-01T00:00:00","sg_cwo_end":"2027-03-31T00:00:00","sg_position_role":"*","sg_pwo_total":"0","sg_cwo_owner":"*","sg_billing_status":"*","sg_effort_type":"*"});
            // // 3rd service: get TreeGrid data

            // const data = await firstValueFrom(this.ApiService.getTreeGridData(this.tgvdXmlString, paramMapString));

            // // Process received contract data
            // this.allContracts = data;
            // this.filteredContracts = [...this.allContracts];

            // this.uniqueStatuses = [...new Set(this.allContracts.map((c) => c.Status?.trim() || 'Unknown'))];
            // this.uniqueGeographies = [...new Set(this.allContracts.map((c) => c.Geography?.trim() || 'Unknown'))];
            // this.uniqueBillingMethods = [...new Set(this.allContracts.map((c) => c['Billing Method']?.trim() || 'Unknown'))];
            // this.uniqueCustomers = [...new Set(this.allContracts.map((c) => c.Customer?.trim() || 'Unknown'))];

            // const projectNames = this.allContracts.map((c) => (c.Project?.trim() && c.Project.trim().length > 0 ? c.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`));

            // const tempLabels = [...new Set(projectNames)];
            // this.selectedProject = tempLabels[0];
            // this.selectedProjectIndex = 0;

            // //this.renderPieChart();

            // const projectDataMap: { [project: string]: any[] } = {};
            // this.allContracts.forEach((contract) => {
            //     const projectKey = contract.Project?.trim() && contract.Project.trim().length > 0 ? contract.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`;

            //     if (!projectDataMap[projectKey]) projectDataMap[projectKey] = [];
            //     projectDataMap[projectKey].push(contract);
            // });

            // if (this.selectedProject && projectDataMap[this.selectedProject]) {
            //     this.handleProjectSelection(this.selectedProject, projectDataMap);
            // }


            // Apply filters
            const { startDate, endDate, status, geography, billingMethod, project } = this.filters;    // temp remove-customer 
            const userStart = startDate ? new Date(startDate) : null;
            const userEnd = endDate ? new Date(endDate) : null;
            this.filteredContracts = this.allContracts.filter((item) => {
                const itemStart = new Date(item['Start Date']);
                const itemEnd = new Date(item['End Date']);
                const isDateMatch = userStart && userEnd && itemStart >= userStart && itemEnd <= userEnd;


                // const statusMatch = !status || item.Status?.toString().toLowerCase() === status.toLowerCase();
                // const geographyMatch = !geography || item.Geography?.toString().toLowerCase() === geography.toLowerCase();
                // const billingMethodMatch = !billingMethod || item['Billing Method']?.toString().toLowerCase() === billingMethod.toLowerCase();
                // const customerMatch = !customer || item.Customer?.toString().toLowerCase() === customer.toLowerCase();
                const statusMatch = !status.length || status.some(s => s.toLowerCase() === (item.Status?.toString().toLowerCase() || ''));

                // For multiselect filters: check if the item's value is in the selected array (case insensitive)
                const geographyMatch = !geography.length || geography.some(g => g.toLowerCase() === (item.Geography?.toString().toLowerCase() || ''));
                const billingMethodMatch = !billingMethod.length || billingMethod.some(b => b.toLowerCase() === (item['Billing Method']?.toString().toLowerCase() || ''));
                // const customerMatch = !customer.length || customer.some(c => c.toLowerCase() === (item.Customer?.toString().toLowerCase() || ''));
                const projectMatch = !project.length || project.some(c => c.toLowerCase() === (item.Project?.toString().toLowerCase() || ''));

                return isDateMatch && statusMatch && geographyMatch && billingMethodMatch && projectMatch;
            });

            // Reset everything if no data matches filters
            if (this.filteredContracts.length === 0) {
                this.resetComponentState();
                return;
            }

            // Continue with normal filter processing
            this.updateProjectsAfterFilter();


        } catch (error) {
            console.error('Error in sequential service calls:', error);
        } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    }

    async fetchAndProcessContracts(paramMap: Record<string, string>, tgvdXmlString: string): Promise<void> {
        console.log("passed", paramMap)
        const paramMapString = JSON.stringify(paramMap);
        const data = await firstValueFrom(this.ApiService.getTreeGridData(tgvdXmlString, paramMapString));

        // Process received contract data
        this.allContracts = data;       // assign recieved data to allcontract variable 
        this.filteredContracts = [...this.allContracts];   // assign data to filtercontract also 

        this.uniqueStatuses = [...new Set(this.allContracts.map((c) => c.Status?.trim() || 'Unknown'))];
        this.uniqueGeographies = [...new Set(this.allContracts.map((c) => c.Geography?.trim() || 'Unknown'))];
        this.uniqueBillingMethods = [...new Set(this.allContracts.map((c) => c['Billing Method']?.trim() || 'Unknown'))];
        this.uniqueCustomers = [...new Set(this.allContracts.map((c) => c.Customer?.trim() || 'Unknown'))];
        console.log("Vaibhav", this.uniqueGeographies);
        // data in filter goes by data by below lines 
        this.uniqueGeographies.sort((a, b) => a.localeCompare(b));
        this.uniqueBillingMethods.sort((a, b) => a.localeCompare(b));

        this.geographyOptionswc = this.buildOptions(this.uniqueGeographies);
        this.billingMethodOptionswc = this.buildOptions(this.uniqueBillingMethods);




        const projectNames = this.allContracts.map((c) => (c.Project?.trim() && c.Project.trim().length > 0 ? c.Project.trim() : `Unknown_${Math.random().toString(36).substring(2, 6)}`));
        console.log("Project distribution:", projectNames);
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
        console.log("Projectdatamap:", Object.keys(projectDataMap))
        if (this.selectedProject && projectDataMap[this.selectedProject]) {
            this.handleProjectSelection(this.selectedProject, projectDataMap);
        }
        this.projectDistributionwc = this.buildOptions(Object.keys(projectDataMap));
        console.log(this.projectDistributionwc);
    }



    async applyFilters(): Promise<void> {
        const { startDate, endDate, status, geography, billingMethod, project } = this.filters;  // temp-remove customer
        const userStart = startDate ? new Date(startDate) : null;
        const userEnd = endDate ? new Date(endDate) : null;
        const updatedParamMap = { ...this.paramMap };

        // Update date filters
        if (startDate) {
            const sd = new Date(startDate);
            updatedParamMap['sg_cwo_start'] = `${sd.getFullYear()}-${(sd.getMonth() + 1).toString().padStart(2, '0')}-${sd.getDate().toString().padStart(2, '0')}T00:00:00`;
        }

        if (endDate) {
            const ed = new Date(endDate);
            updatedParamMap['sg_cwo_end'] = `${ed.getFullYear()}-${(ed.getMonth() + 1).toString().padStart(2, '0')}-${ed.getDate().toString().padStart(2, '0')}T00:00:00`;

        }

        await this.fetchAndProcessContracts(updatedParamMap, this.tgvdXmlString);
        // Apply filters
        this.filteredContracts = this.allContracts.filter((item) => {
            const itemStart = new Date(item['Start Date']);
            const itemEnd = new Date(item['End Date']);
            const isDateMatch = userStart && userEnd && itemStart >= userStart && itemEnd <= userEnd;


            // const statusMatch = !status || item.Status?.toString().toLowerCase() === status.toLowerCase();
            // const geographyMatch = !geography || item.Geography?.toString().toLowerCase() === geography.toLowerCase();
            // const billingMethodMatch = !billingMethod || item['Billing Method']?.toString().toLowerCase() === billingMethod.toLowerCase();
            // const customerMatch = !customer || item.Customer?.toString().toLowerCase() === customer.toLowerCase();
            const statusMatch = !status.length || status.some(s => s.toLowerCase() === (item.Status?.toString().toLowerCase() || ''));

            // For multiselect filters: check if the item's value is in the selected array (case insensitive)
            const geographyMatch = !geography.length || geography.some(g => g.toLowerCase() === (item.Geography?.toString().toLowerCase() || ''));
            const billingMethodMatch = !billingMethod.length || billingMethod.some(b => b.toLowerCase() === (item['Billing Method']?.toString().toLowerCase() || ''));
            // const customerMatch = !customer.length || customer.some(c => c.toLowerCase() === (item.Customer?.toString().toLowerCase() || ''));
            const projectMatch = !project.length || project.some(c => c.toLowerCase() === (item.Project?.toString().toLowerCase() || ''));

            return isDateMatch && statusMatch && geographyMatch && billingMethodMatch && projectMatch;
        });
        console.log("filtered contarct", this.filteredContracts)
        // Reset everything if no data matches filters
        if (this.filteredContracts.length === 0) {
            this.resetComponentState();
            return;
        }

        // Continue with normal filter processing
        this.updateProjectsAfterFilter();

        // this.globalState.setFilters(this.pageKey, this.filters);
        // this.globalState.setFilteredData(this.pageKey, this.filteredContracts);

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
        // this.globalState.resetPageData(this.pageKey);
        this.filters = {
            startDate: this.cwoStartDate,
            endDate: this.cwoEndDate,
            status: [this.cwoStatus],
            geography: [] as string[],
            billingMethod: [] as string[],
            // customer: [] as string[],
            project: [] as string[]
        };
        this.selectedRole = '';
        this.selectedBillingStatus = '';

        this.applyFilters();
        // this.cdr.detectChanges();
    }
}
