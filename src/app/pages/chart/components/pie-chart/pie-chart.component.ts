import { Component,Input, Output, EventEmitter } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pie-chart',
  imports: [ChartModule, CommonModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent {
  @Input() pieChartData: any;
  @Input() pieChartOptions: any;
  @Input() selectedProject: string | null = null;
  @Output() projectClick = new EventEmitter<string>();

  onProjectClick(project: string) {
    this.projectClick.emit(project);
  }
}

