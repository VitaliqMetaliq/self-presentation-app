import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { RockPaperScissorsComponent } from './pages/rock-paper-scissors/rock-paper-scissors.component';

export const routes: Routes = [
    { path: '', component: MainPageComponent },
    { 
        path: 'rock-paper-scissors', 
        loadComponent: () => import('./pages/rock-paper-scissors/rock-paper-scissors.component')
            .then(c => c.RockPaperScissorsComponent) 
    },
    {
        path: 'weather-forecast',
        loadComponent: () => import('./pages/weather-forecast/weather-forecast.component')
            .then(c => c.WeatherForecastComponent)
    },
    { path: '**', redirectTo: '' },
];
