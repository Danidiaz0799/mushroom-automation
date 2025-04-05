import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-database',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class DatabaseComponent {
  constructor() {}
} 