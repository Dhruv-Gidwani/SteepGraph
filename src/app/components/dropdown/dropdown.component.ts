import { Component, OnInit,Input ,EventEmitter,Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@Component({
    selector: 'dropdown-filter-demo',
    templateUrl: './dropdown.component.html',
    standalone: true,
    imports: [FormsModule, DropdownModule]
})
export class DropdownFilterDemo  {
    // @Input() projectOptions: { label: string; value: string }[] = [];
    //  @Input() selectedProject: string = '';
    //  @Input() employeeOptions: { label: string; value: string }[] = [];
    //  @Output() selectedProjectChange = new EventEmitter<string>();
     @Input() options: { label: string; value: string }[] = [];

  // Generic input for selected value
  @Input() selectedValue: string = '';

  // Label input (for dynamic label text)
  @Input() label: string = '';

  // Output event to notify parent about selection changes
  @Output() selectedValueChange = new EventEmitter<string>();

  // Called when dropdown value changes
  onChange(value: string) {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
  }
    
}