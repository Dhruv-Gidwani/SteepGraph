import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Reports by
        <a href="https://steepgraph.com/" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">SteepGraph</a>
    </div>`
})
export class AppFooter {}
