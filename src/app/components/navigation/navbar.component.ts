
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  navLinks = [
    { path: '/home', icon: 'home', label: 'Home' },
    { path: '/about', icon: 'info', label: 'About' },
    { path: '/contact', icon: 'email', label: 'Contact' }
  ];
}
