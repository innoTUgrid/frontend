import { Component, ViewChild, inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { DataService } from '@app/services/data.service';
import { Subscription } from 'rxjs';
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
    { name: 'Info', icon: 'info', route: '/info' },
  ];

  isSelected(routeName: string): boolean {
    return this.router.url == routeName
  }

  constructor(private router: Router) {
  }

  subscriptions: Subscription[] = []

  ngOnInit() {
    const s0 = this.dataService.metaInfo.subscribe((metaInfo) => {
      if (metaInfo) {
        this.loading = false
      } else {
        this.loading = true
      }
    })

    // on route change set loading to false if current route is on info page
    const s1 = this.router.events.subscribe((event) => {
      if (this.router.url == '/info') {
        this.loading = false
      } else if (this.dataService.metaInfo.getValue() === undefined) {
        this.loading = true
      }
    })

    this.subscriptions.push(s0, s1)
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}



