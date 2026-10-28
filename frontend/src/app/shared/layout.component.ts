import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent, ToastComponent],
  template: `
    <div class="d-flex flex-column min-vh-100 bg-light">
      <app-navbar></app-navbar>
      <div class="d-flex flex-grow-1">
        <app-sidebar></app-sidebar>
        <main class="flex-grow-1 p-4 overflow-auto" style="max-height: calc(100vh - 64px); background-color: #f8fafc;">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast></app-toast>
    </div>
  `
})
export class LayoutComponent {}
