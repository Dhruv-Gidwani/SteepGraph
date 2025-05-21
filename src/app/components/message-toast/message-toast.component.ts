import { Component,Input  } from '@angular/core';
import { Message } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'message-form-demo',
    templateUrl: './message-toast.component.html',
    standalone: true,
    imports: [Message, InputTextModule,CommonModule]
})
export class MessageFormDemo {
   @Input() text: string = '';
  @Input() type: 'success' | 'info' | 'warn' | 'error' = 'info';
}