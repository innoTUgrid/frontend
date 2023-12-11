import { Component, ViewChild, inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { KpiService } from 'src/app/services/kpi.service';
import { MenuItem } from 'src/app/types/menu-item.model';
import { TimeUnit } from 'src/app/types/time-series-data.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  kpiService: KpiService = inject(KpiService);

  public menuItems: MenuItem[] = [
    { name: 'Overview', icon: 'gallery_thumbnail', route: '/overview' },
    { name: 'CO2 Emissions', icon: 'bubble_chart', route: '/co2emissions' },
    { name: 'Comparison', icon: 'compare_arrows', route: '/comparison' },
    { name: 'Reporting', icon: 'assignment', route: '/reporting' },
    { name: 'Datasets', icon: 'dataset', route: '/datasets' },
    { name: 'Energy Flow', icon: 'timeline', route: '/energyflow' },
    { name: 'Add view', icon: 'add_circle', route: '/addview' }
  ];

  public menuItemsOrg: MenuItem[] = [
    { name: 'Settings', icon: 'settings', route: '/settings' },
    { name: 'Info', icon: 'info', route: '/info' },
  ];

  isSelected(routeName: string): boolean {
    return this.router.url == routeName
  }

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      const timeInterval = {
        start: new Date(params['start']),
        end: new Date(params['end']),
        step: +params['step'], // convert to number
        stepUnit: params['stepUnit'] as TimeUnit
      };

      this.kpiService.updateTimeInterval(timeInterval);
    });

  }

}



