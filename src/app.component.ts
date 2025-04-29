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
export class AppComponent implements OnInit{
    constructor(private arasService: ArasService) {
        
      }
    
      ngOnInit(): void {  {
        this.arasService.fetchTgvdItem().subscribe((xml: string) => {
          parseString(xml, { explicitArray: false }, (err, result) => {
            if (err) {
              console.error('XML Parse Error:', err);
              return;
            }
            const item = result.AML?.Item;
            const tgvdItem = item?.tgvd_item;
            console.log('Extracted tgvd_item:', tgvdItem);
          });
        });
      }
    }
}
