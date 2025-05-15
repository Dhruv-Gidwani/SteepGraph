// import { Component } from '@angular/core';
// import { ProgressSpinner } from 'primeng/progressspinner';

// @Component({
//   selector: 'progress-spinner-basic-demo-loader',
//   templateUrl: 'loader.html', 
//   standalone: true,
//   imports: [ProgressSpinner]
// })
// export class LoaderComponent {}


import { Component } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
    selector: 'progress-spinner-basic-demo',
    templateUrl: 'loader.html',
    standalone: true,
    imports: [ProgressSpinner]
})
export class ProgressSpinnerBasicDemo {}
