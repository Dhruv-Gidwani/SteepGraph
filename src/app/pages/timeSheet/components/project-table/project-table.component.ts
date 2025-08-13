import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
@Component({
    selector: 'app-project-table',
    standalone: true,
    imports: [ChartModule, CommonModule, TableModule, ButtonModule, MultiSelectModule, FormsModule, TooltipModule],
    templateUrl: './project-table.component.html',
    styleUrl: './project-table.component.scss'
})
export class ProjectTableComponent implements OnInit {
    @Input() projectTableData: any[] = [];
    @Input() customSort!: (event: any) => void;
    @Input() exportData!: () => void;
    @Input() isExpanded: boolean = false;
    @Input() expandedComponent: 'pie' | 'bar' | 'table' | null = null;
    @Output() toggleExpand = new EventEmitter<'table'>();
    @Input() isSummaryView: boolean = false;

    searchValue: string | undefined;
    flatData: any[] = [];
    EmployeeNames: any[] = [];
    PositionTitle: any[] = [];
    Department: any[] = [];
    Project: any[] = [];
    Geography: any[] = [];
    Role: any[] = [];
    BillingStatus: any[] = [];
    BillingMethod: any[] = [];

    // ngOnInit() {
    //     console.log('Project Table Data:', this.projectTableData);
    //     this.flatData = this.flattenData(this.projectTableData);
    //     this.flatData.sort((a, b) => a.employee.localeCompare(b.employee));
    //     this.EmployeeNames = [...new Set(this.flatData.map((emp) => emp.employee))].sort();
    //     this.PositionTitle = [...new Set(this.flatData.map((emp) => emp.sg_position_title))].sort();
    //     this.Department = [...new Set(this.flatData.map((emp) => emp.sg_employee_department))].sort();
    //     this.Project = [...new Set(this.flatData.map((emp) => emp.project))].sort();
    //     this.Geography = [...new Set(this.flatData.map((emp) => emp.sg_geography))].sort();
    //     this.Role = [...new Set(this.flatData.map((emp) => emp.sg_position_role))].sort();
    //     this.BillingStatus = [...new Set(this.flatData.map((emp) => emp.billing_status))].sort();
    //     this.BillingMethod = [...new Set(this.flatData.map((emp) => emp.sg_billing_method))].sort();
    // }
    ngOnInit() {
        if (!this.isSummaryView) {
            this.flatData = this.flattenData(this.projectTableData);
            this.flatData.sort((a, b) => a.employee.localeCompare(b.employee));

            this.EmployeeNames = [...new Set(this.flatData.map((emp) => emp.employee))].sort();
            this.PositionTitle = [...new Set(this.flatData.map((emp) => emp.sg_position_title))].sort();
            this.Department = [...new Set(this.flatData.map((emp) => emp.sg_employee_department))].sort();
            this.Project = [...new Set(this.flatData.map((emp) => emp.project))].sort();
            this.Geography = [...new Set(this.flatData.map((emp) => emp.sg_geography))].sort();
            this.Role = [...new Set(this.flatData.map((emp) => emp.sg_position_role))].sort();
            this.BillingStatus = [...new Set(this.flatData.map((emp) => emp.billing_status))].sort();
            this.BillingMethod = [...new Set(this.flatData.map((emp) => emp.sg_billing_method))].sort();
        }
    }

    // Convert nested structure into flat array
    flattenData(data: any[]): any[] {
        const flatData: any[] = [];

        data.forEach((emp) => {
            emp.projects.forEach((proj: any) => {
                proj.billingDetails.forEach((detail: any, index: number) => {
                    flatData.push({
                        employee: emp.employee,
                        sg_position_title: emp.sg_position_title,
                        sg_employee_department: emp.sg_employee_department,
                        sg_geography: emp.sg_geography,
                        project: proj.project,
                        sg_position_role: detail.sg_position_role,
                        billing_status: detail.billing_status,
                        sg_billing_method: detail.sg_billing_method,
                        total_ts_fill_hrs: detail.total_ts_fill_hrs,
                        total_billable_hr_company: detail.total_billable_hr_company,
                        total_billable_hr_person: detail.total_billable_hr_person,
                        total_hours: detail.total_hours,
                        total_non_billable_hr: detail.total_non_billable_hr,
                        company_billability: proj.company_billability,
                        person_billability: proj.person_billability,
                        total_leave: detail.total_leave,
                        missing_timeSheet: detail.missing_timeSheet,
                        GCW_hrs: detail.GCW_hrs
                    });
                });
            });
        });

        return flatData;
    }

    // Handle global search
    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        const searchValue = input.value.toLowerCase();
        this.searchValue = searchValue;

        const filtered = this.flattenData(this.projectTableData).filter((item) => Object.values(item).some((val) => val?.toString().toLowerCase().includes(searchValue)));

        this.flatData = filtered.sort((a, b) => a.employee.localeCompare(b.employee));
    }
}
