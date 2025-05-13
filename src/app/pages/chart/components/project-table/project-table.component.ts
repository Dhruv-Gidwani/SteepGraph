import { Component , Input, OnInit,ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-project-table',
  imports: [ChartModule,CommonModule, TableModule ,ButtonModule ,MultiSelectModule,FormsModule],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.scss'
})
export class ProjectTableComponent implements OnInit {
  @Input() projectTableData: any[] = [];
  @Input() customSort!: (event: any) => void;
  @Input() onGlobalFilter!: (event: any, dt: any) => void;
  @Input() exportData!: () => void;
  searchValue: string | undefined;
  representativeNames: string[] = [];

  ngOnInit() {

    // Initialize the Resource name value based on the project table data for filtering for multi select filter 
    const uniqueNames = new Set<string>();
    this.projectTableData.forEach((row) => {
      if (row['Resource Name']) {
        uniqueNames.add(row['Resource Name']);
      }
    });
    this.representativeNames = Array.from(uniqueNames);
  }

}
