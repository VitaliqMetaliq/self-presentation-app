import { CommonModule } from "@angular/common";
import { Component, inject, Renderer2 } from "@angular/core";
import { MobileNavComponent } from "../mobile-nav/mobile-nav.component";
import { ScrollService } from "../../services/scroll.service";

@Component({
    selector: 'app-navigation-bar',
    standalone: true,
    imports: [ CommonModule, MobileNavComponent ],
    providers: [ ScrollService ],
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent {
    private readonly renderer = inject(Renderer2);
    private isDarkTheme = false; // вынести в отдельный компонент
                                 // который будет управлять темой
    private readonly scrollService = inject(ScrollService);
    
    public navList = [
        { name: 'Главная', anchor: '#home' },
        { name: 'Проекты', anchor: '#projects' },
        { name: 'Технологии', anchor: '#skills' },
        { name: 'Контакты', anchor: '#contacts' }
    ];

    public onToggleClicked() {
        this.renderer.setAttribute(document.documentElement, 'class', 
            this.isDarkTheme ? 'dark-theme' : 'light-theme');

        this.isDarkTheme = !this.isDarkTheme;
    }

    public onNavClick(event: Event, anchor: string) {
        event.preventDefault();
        this.scrollService.scrollTo(anchor, { offset: 64, duration: 1000 });
    }
}