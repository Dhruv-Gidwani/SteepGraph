import { Component, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { ApiService } from '../../services/tgv.service';
// import { ArasService } from '../../services/aras.service';
import { ArasService } from '../../services/aras.service';
import { ArasService1 } from '../../services/aras1.service';

import { parseString } from 'xml2js';
import { Observable, map } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div>
    `
})
export class Dashboard implements OnInit {
    constructor(
        private apiService: ApiService,
        private arasService: ArasService,
        private arasService1 : ArasService1
    ) {}


    rawTreeGridData: any;
    transformedTreeGridData: any;

   
    ngOnInit(): void {
        this.arasService.fetchTgvdItem().subscribe({
            next: (response) => {
              const tgvdXmlString: string = response.toString();
              console.log('TGVD Response as String:', tgvdXmlString);
          
              // You can now pass `tgvdXmlString` to another component, service, or file.
            },
            error: (error) => {
              console.error('Error fetching AML TreeGrid data:', error);
            }
          });
          

        

          this.arasService1.fetchQBValueItem().subscribe({
            next: (response) => {
              parseString(response, { explicitArray: false }, (err: any, result: any) => {
                if (err) {
                  console.error('Error parsing AML XML:', err);
                  return;
                }
          
                try {
                  const items = result['SOAP-ENV:Envelope']['SOAP-ENV:Body']
                    .Result.Item.Relationships.Item;
          
                  const paramMap: Record<string, string> = {};
          
                  // Ensure it's always iterable (array or single object)
                  const itemArray = Array.isArray(items) ? items : [items];
          
                  itemArray.forEach((item: any) => {
                    const key = item.qd_parameter_name;
                    const value = item.user_input_default_value?._ || item.user_input_default_value;
          
                    if (key) {
                      paramMap[key] = value;
                    }
                  });
          
                  // Convert paramMap object to a string
                  const paramMapString = JSON.stringify(paramMap);
                  console.log('Extracted Parameter Map as String:', paramMapString);
          
                  // You can store or use paramMapString as needed
                  // Example: this.someOtherService.storeJsonString(paramMapString);
          
                } catch (e) {
                  console.error('Error processing AML data:', e);
                }
              });
            },
            error: (error) => {
              console.error('Error fetching AML TreeGrid data:', error);
            }
          });
          

    
        // Existing API call for Tree Grid Data
        this.apiService.getTreeGridData().subscribe({
            next: (data) => {
                this.rawTreeGridData = data;
                console.log('Raw Tree Grid Data:', this.rawTreeGridData);
    
                const headers = data.HeaderResult.map((header: any) => header.label);
                const gridRows = data.GridRows;
    
                const transformedData = gridRows.map((row: any) => {
                    const result: Record<string, any> = { Level: '1' };
    
                    if (Array.isArray(row.cells)) {
                        row.cells.forEach((cell: any, index: number) => {
                            const key = headers[index] ?? `Unknown_${index}`;
                            const value = cell?.value ?? null;
                            result[key] = value;
                        });
                    }
    
                    return result;
                });
    
                this.transformedTreeGridData = transformedData;
    
                // Display in the console
                console.log('Transformed Data:', this.transformedTreeGridData);
                console.log('First Row Sample:', this.transformedTreeGridData[0]);
                console.table(this.transformedTreeGridData);
            },
            error: (error) => {
                console.error('Error fetching data:', error);
            }
        });
    }
    
    
}
