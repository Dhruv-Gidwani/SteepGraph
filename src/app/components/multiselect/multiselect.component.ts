import { Component, OnInit,Input ,EventEmitter,Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'multi-select-basic-demo',
    templateUrl: './multiselect.component.html',
    standalone: true,
    imports: [FormsModule,MultiSelectModule]
})
export class MultiselectFilterDemo  {
    // @Input() projectOptions: { label: string; value: string }[] = [];
    //  @Input() selectedProject: string = '';
    //  @Input() employeeOptions: { label: string; value: string }[] = [];
    //  @Output() selectedProjectChange = new EventEmitter<string>();
     @Input() options: { label: string; value: string }[] = [];

  // Generic input for selected value
  @Input() selectedValue: string[] = [];

  // Label input (for dynamic label text)
  @Input() label: string = '';
  @Input() isDisabled: boolean = false;
  // Output event to notify parent about selection changes
  @Output() selectedValueChange = new EventEmitter<string[]>();

  // Called when dropdown value changes
  onChange(value: string[]) {
    this.selectedValue = value;
    this.selectedValueChange.emit(value);
  }
    
}