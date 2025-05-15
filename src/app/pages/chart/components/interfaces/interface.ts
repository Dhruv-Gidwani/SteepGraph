export interface Contract {
    Project: string;
    'Work Contract Name': string;
    'Project Manager': string;
    'Billing Method': string;
    'Resource Name': string;
    'Position Role': string;
    'Allocated Hrs.': number;
    'Rem. Hrs.': number;
    'Start Date': string;
    'End Date': string;
    'TS Approver': string;
    Status: string;
    Geography: string;
    Customer: string;
    [key: string]: any;
}

export interface Filters {
    startDate: string;
    endDate: string;
    status: string;
    geography: string;
    billingMethod: string;
    customer: string;
}

export interface ProjectDataMap {
    [project: string]: Contract[];
}

export interface BarChartData {
    labels: string[];
    datasets: {
        label: string;
        backgroundColor: string;
        data: number[];
    }[];
}

export interface ResourceData {
    [resource: string]: {
        allocated: number;
        remaining: number;
    };
}

export interface TableData extends Contract {
    monthData?: { [key: string]: MonthData };
    'Start Date Object'?: Date | null;
    'End Date Object'?: Date | null;
}

export interface MonthData {
    day: string;
    color: string;
}

export interface TableState {
    globalFilter: string;
    sortField: string;
    sortOrder: number;
}
