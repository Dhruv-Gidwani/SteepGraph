import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArasService } from './app/services/aras.service';
import { parseString } from 'xml2js';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent  {
    
}
