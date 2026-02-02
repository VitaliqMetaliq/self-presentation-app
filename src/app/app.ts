import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { NavigationBarComponent } from './features/navigation-bar/navigation-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet], //NavigationBarComponent
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('self-presentation-app');
}
