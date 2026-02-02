import { Component, computed, inject, signal, ViewEncapsulation } from "@angular/core";
import { TagCloudComponent, TagCloudConfig, TagCloudItem } from "../../features/tag-cloud/tag-cloud.component";
import { Router } from "@angular/router";
import { NavigationBarComponent } from "../../features/navigation-bar/navigation-bar.component";

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: [ './main-page.component.scss' ],
    imports: [TagCloudComponent, NavigationBarComponent],
    standalone: true,
})
export class MainPageComponent {
    private router: Router = inject(Router);

    public tags: TagCloudItem[] = [
        { id: 1, name: 'Typescript', link: 'https://www.typescriptlang.org/docs/' },
        { id: 2, name: '.NET', link: 'https://learn.microsoft.com/en-us/dotnet/' },
        { id: 3, name: 'RxJS', link: 'https://rxjs.dev/' },
        { id: 4, name: 'NgRX', link: 'https://ngrx.io/' },
        { id: 5, name: 'Docker', link: 'https://www.docker.com/' },
        { id: 6, name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
        { id: 7, name: 'Angular', link: 'https://angular.io/' },
        { id: 8, name: 'some', link: 'someLink' },
        { id: 9, name: 'someOne', link: 'someOneLink' },
        { id: 10, name: 'someTwo', link: 'someTwoLink' },
        { id: 11, name: 'Typescript', link: 'https://www.typescriptlang.org/docs/' },
        { id: 12, name: '.NET', link: 'https://learn.microsoft.com/en-us/dotnet/' },
        { id: 13, name: 'RxJS', link: 'https://rxjs.dev/' },
        { id: 14, name: 'NgRX', link: 'https://ngrx.io/' },
        { id: 15, name: 'Docker', link: 'https://www.docker.com/' },
        { id: 16, name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
        { id: 17, name: 'Angular', link: 'https://angular.io/' },
        { id: 18, name: 'some', link: 'someLink' },
        { id: 19, name: 'someOne', link: 'someOneLink' },
        { id: 20, name: 'someTwo', link: 'someTwoLink' },
    ];

    public cloudConfig: TagCloudConfig = {
        radius: 250,
        dragSensetivity: 0.3,
        autoRotationSpeed: 0.0006,
        autoRotationVector: { x: 0, y: 1, z: 0 },
        itemScale: {
            min: 0.5,
            max: 1.4
        },
        aspect: { x: 1.2, y: 1.2, z: 1 }
    };

    private scrollY = signal(0);
    // private sectionTop = 0;
    private sectionHeight = 0;
    private contentHeight = 0;

    public bgTranslateY = computed(() => {
        const scroll = this.scrollY();
        const sectionH = this.sectionHeight;

        // ограничиваем движение фона
        const maxScroll = sectionH;
        const clamped = Math.min(scroll, maxScroll);

        return -clamped * 0.1;
    });

    public bgPositionY = computed(() => {
        const scroll = Math.min(this.scrollY(), this.sectionHeight);
        return 50 + scroll * 0.05; // 0.05 %
    });

    public photoTranslateY = computed(() => {
        const scroll = this.scrollY();
        const sectionHeight = this.sectionHeight;
        const contentHeight = this.contentHeight;
        
        const speedFactor = 0.25;
        const maxTranslate = Math.max(0, (sectionHeight - contentHeight) / 2);
        return Math.min(scroll * speedFactor, maxTranslate);
    });

    public textOpacity = computed(() => {
        const current = this.photoTranslateY();
        const max = Math.max(1, this.sectionHeight - this.contentHeight);

        const progress = current / max;

        if (progress <= 0.4) return 1;
        if (progress >= 0.85) return 0;

        return 1 - (progress - 0.4) / (0.85 - 0.4);
    });

    public ngAfterViewInit() {
        this.updateSectionDimensions();

        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    }

    public goToProject(route: string) {
        this.router.navigate([route]);
    }

    ngOnDestroy(): void {
        window.removeEventListener('scroll', this.onScroll);
    }

    private onScroll(event: Event): void {
        this.scrollY.set(window.scrollY);
    }

    private updateSectionDimensions(): void {
        const section = document.getElementById('home');
        const content = document.querySelector('.main-info-inner') as HTMLElement;
        if (section) {
            this.contentHeight = content.offsetHeight;
            this.sectionHeight = section.offsetHeight;
        }
    }
}