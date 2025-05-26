// // global-state.service.ts
// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root' // makes it a singleton
// })
// export class GlobalStateService {
//   public filter: any = null;
//   public filteredData: any[] = [];
// }
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalStateService {
  private filters: { [page: string]: any } = {};
  private filteredDataMap: { [page: string]: any[] } = {};

  // Set filters for a specific page
  setFilters(page: string, filters: any): void {
    this.filters[page] = filters;
  }

  // Get filters for a specific page
  getFilters(page: string): any {
    return this.filters[page] || null;
  }

  // Set filtered data for a specific page
  setFilteredData(page: string, data: any[]): void {
    this.filteredDataMap[page] = data;
  }

  // Get filtered data for a specific page
  getFilteredData(page: string): any[] {
    return this.filteredDataMap[page] || [];
  }

  // Reset filter and data for a specific page
  resetPageData(page: string): void {
    delete this.filters[page];
    delete this.filteredDataMap[page];
  }
}
