import { Component } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';
@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [ProgressSpinner],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent  {

}


