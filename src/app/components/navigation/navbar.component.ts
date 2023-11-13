import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
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
    { name: 'CO2 Emissions', icon: 'bubble_chart', route: '/co2emissions' },
    { name: 'Comparison', icon: 'compare_arrows', route: '/comparison' },
    { name: 'Reporting', icon: 'assignment', route: '/reporting' },
    { name: 'Datasets', icon: 'dataset', route: '/datasets' },
    { name: 'Add view', icon: 'add_circle', route: '/addview' }
  ];

  public menuItemsOrg: MenuItem[] = [
    { name: 'Settings', icon: 'settings', route: '/settings' },
    { name: 'Info', icon: 'info', route: '/info' },
  ];

  selectedMenuItem: string = 'Overview'


  isSelected(menuItemName: string): boolean {
    return this.selectedMenuItem == menuItemName
  }

  selectMenuItem(menuItemName: string): void {
    this.selectedMenuItem = menuItemName;
  }

}



