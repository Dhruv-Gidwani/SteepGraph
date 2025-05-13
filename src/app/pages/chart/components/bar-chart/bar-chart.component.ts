import { Component , Input,EventEmitter, Output} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [ChartModule,CommonModule,FormsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent {
  @Input() selectedProject!: string;
  @Input() availableRoles: string[] = [];
  @Input() uniqueBillingStatuses: string[] = [];
  @Input() selectedRole: string = '';
  @Input() selectedBillingStatus: string = '';
  @Input() barChartData: any;
  @Input() barChartOptions: any;
  @Input() filterBarChart!: () => void;
  @Output() roleChanged = new EventEmitter<string>();
  @Output() billingStatusChanged = new EventEmitter<string>();

  onRoleChange(role: string) {
    this.roleChanged.emit(role);
  }

  onBillingStatusChange(status: string) {
    this.billingStatusChanged.emit(status);
  }
}



