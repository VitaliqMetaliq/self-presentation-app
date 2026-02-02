import { Component, computed, inject, signal, ViewEncapsulation } from "@angular/core";
import { TagCloudComponent, TagCloudConfig, TagCloudItem } from "../../features/tag-cloud/tag-cloud.component";
import { Router } from "@angular/router";
import { NavigationBarComponent } from "../../features/navigation-bar/navigation-bar.component";
import { ConfirmPopupComponent } from "../../features/confirm-popup/confirm-popup.component";

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: [ './main-page.component.scss' ],
    imports: [TagCloudComponent, NavigationBarComponent, ConfirmPopupComponent],
    standalone: true,
})
export class MainPageComponent {
    private router: Router = inject(Router);
    public selectedLink: string | null = null;
    public gitHubLink = 'https://github.com/VitaliqMetaliq';
    public tgLink = 'https://t.me/vitaliqmetaliq';
    public linkedinLink = 'https://www.linkedin.com/in/vitaly-grishunov-12242b208/';
    public isPopupOpen = signal(false);

    public tags: TagCloudItem[] = [
        { id: 1, name: 'Typescript', link: 'https://www.typescriptlang.org/docs/' },
        { id: 2, name: '.NET', link: 'https://learn.microsoft.com/en-us/dotnet/' },
        { id: 3, name: 'RxJS', link: 'https://rxjs.dev/' },
        { id: 4, name: 'NgRX', link: 'https://ngrx.io/' },
        { id: 5, name: 'Docker', link: 'https://www.docker.com/' },
        { id: 6, name: 'PostgreSQL', link: 'https://www.postgresql.org/' },
        { id: 7, name: 'Angular', link: 'https://angular.io/' },
        { id: 8, name: 'SignalR', link: 'https://learn.microsoft.com/en-US/aspnet/signalr/' },
        { id: 9, name: 'EF Core', link: 'https://learn.microsoft.com/en-US/ef/core/' },
        { id: 10, name: 'Git', link: 'https://git-scm.com/docs' },
        { id: 11, name: 'RabbitMQ', link: 'https://www.rabbitmq.com/docs' },
        { id: 12, name: 'Kafka', link: 'https://kafka.apache.org/41/getting-started/introduction/' },
        { id: 13, name: 'Ant Design', link: 'https://ant.design/docs/spec/introduce' },
        { id: 14, name: 'Tailwind CSS', link: 'https://tailwindcss.com/docs/installation/using-vite' },
        { id: 15, name: 'JavaScript', link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
        { id: 16, name: 'ngneat', link: 'https://github.com/ngneat' },
        { id: 17, name: 'Angular Material', link: 'https://material.angular.dev/components/categories' },
        { id: 18, name: 'YARP', link: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/getting-started?view=aspnetcore-10.0' },
        { id: 19, name: 'gRPC', link: 'https://grpc.io/docs/' },
        { id: 20, name: 'MediatR', link: 'https://github.com/LuckyPennySoftware/MediatR/wiki' },
        { id: 21, name: 'Openiddict', link: 'https://documentation.openiddict.com/guides/' },
        { id: 22, name: 'MSSQL', link: 'https://learn.microsoft.com/en-us/sql/?view=sql-server-ver17' },
        { id: 23, name: 'xUnit', link: 'https://xunit.net/index.html?tabs=cs' },
        { id: 24, name: 'Hangfire', link: 'https://docs.hangfire.io/en/latest/' },
    ];

    public cloudConfig: TagCloudConfig = {
        radius: 250,
        dragSensetivity: 0.3,
        autoRotationSpeed: 0.0006,
        autoRotationVector: { x: 0.5, y: 1, z: 0 },
        itemScale: {
            min: 0.5,
            max: 1.4
        },
        aspect: { x: 1.2, y: 1.2, z: 1 }
    };

    private scrollY = signal(0);
    private sectionHeight = 0;
    private contentHeight = 0;

    public bgTranslateY = computed(() => {
        const scroll = this.scrollY();
        const sectionH = this.sectionHeight;

        const maxScroll = sectionH;
        const clamped = Math.min(scroll, maxScroll);

        return -clamped * 0.1;
    });

    public bgPositionY = computed(() => {
        const scroll = Math.min(this.scrollY(), this.sectionHeight);
        return 50 + scroll * 0.05;
    });

    public photoTranslateY = computed(() => {
        const scroll = this.scrollY();
        const sectionHeight = this.sectionHeight;
        const contentHeight = this.contentHeight;
        
        const speedFactor = 0.25;
        const maxTranslate = Math.max(0, (sectionHeight - contentHeight) / 2);
        return Math.min(scroll * speedFactor, maxTranslate);
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

    public onContactClick(event: Event, link: string) {
        event.preventDefault();
        this.selectedLink = link;
        this.isPopupOpen.set(true);
    }

    public onPopupConfirm() {
        if (this.selectedLink) {
            window.open(this.selectedLink, '_blank', 'noopener');
        }

        this.closePopup();
    }

    public closePopup() {
        this.isPopupOpen.set(false);
        this.selectedLink = null;
    }

    public onTagClicked(link: string) {
        this.selectedLink = link;
        this.isPopupOpen.set(true);
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