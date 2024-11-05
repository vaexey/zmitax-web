import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from "./nav/nav-bar/nav-bar.component";
import { NavModule } from './nav/nav.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'zmitax-web';
}
