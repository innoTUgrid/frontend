import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { MenuItem } from 'src/app/types/menu-item.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  public menuItems: MenuItem[] = [
    { name: 'Overview', icon: 'gallery_thumbnail', route: '/overview' },
    { name: 'CO₂ Emissions Compared', icon: 'compare_arrows', route: '/comparison' },
    { name: 'Reporting', icon: 'assignment', route: '/reporting' },
    { name: 'Datasets', icon: 'dataset', route: '/datasets' },
    { name: 'Energy Flow', icon: 'timeline', route: '/energyflow' },
  ];

  public menuItemsOrg: MenuItem[] = [
    { name: 'Settings', icon: 'settings', route: '/settings' },
    { name: 'Info', icon: 'info', route: '/info' },
  ];

  isSelected(routeName: string): boolean {
    return this.router.url == routeName
  }

  constructor(private router: Router) {}
}



