import { Component, ViewChild, inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { MenuItem } from 'src/app/types/menu-item.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  dataService: DataService = inject(DataService)
  loading: boolean = false

  public menuItems: MenuItem[] = [
    { name: 'Overview', icon: 'gallery_thumbnail', route: '/overview' },
    { name: 'CO₂ Emissions', icon: 'cloud', route: '/comparison' },
    { name: 'Energy Flow', icon: 'timeline', route: '/energyflow' },
    { name: 'Reporting', icon: 'assignment', route: '/reporting' },
    { name: 'Datasets', icon: 'dataset', route: '/datasets' },
    
  ];

  public menuItemsOrg: MenuItem[] = [
    { name: 'Settings', icon: 'settings', route: '/settings' },
    { name: 'Info', icon: 'info', route: '/info' },
  ];

  isSelected(routeName: string): boolean {
    return this.router.url == routeName
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.dataService.metaInfo.subscribe((metaInfo) => {
      if (metaInfo) {
        this.loading = false
      } else {
        this.loading = true
      }
    })
  }
}



