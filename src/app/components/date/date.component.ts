import { Component ,Input,EventEmitter,Output, OnChanges, SimpleChanges } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'datepicker-icon-demo',
    templateUrl: './date.component.html',
    styleUrls: ['./date.component.scss'],
    standalone: true,
    imports: [DatePickerModule, FormsModule, FluidModule,CommonModule]
})
export class DatePickerIconDemo {
    @Input() label: string = '';
  @Input() dateStr: string = ''; // receive string date from parent
  @Output() dateStrChange = new EventEmitter<string>(); // emit string back
  @Input() showError: boolean = false;
  date: Date | undefined;

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['dateStr']) {
    if (this.dateStr) {
      this.date = new Date(this.dateStr); // normal flow
    } else {
      this.date = undefined; // handle reset (empty string)
    }
  }
}

 onSDateChange(value: Date) {
  this.dateStrChange.emit(this.formatDateToLocalString(value));
}

formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
}