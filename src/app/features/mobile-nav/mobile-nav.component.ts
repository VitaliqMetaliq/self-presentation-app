import { CommonModule } from "@angular/common";
import { Component, effect, inject, input, signal } from "@angular/core";
import { ScrollService } from "../../services/scroll.service";

@Component({
    selector: 'app-mobile-nav',
    standalone: true,
    imports: [CommonModule],
    providers: [ ScrollService ],
    templateUrl: './mobile-nav.component.html',
    styleUrls: [ './mobile-nav.component.scss' ]
})
export class MobileNavComponent {
    private readonly scrollService = inject(ScrollService);
    private touchStartX = 0;
    private touchEndX = 0;

    public navList = input.required<{name: string, anchor: string}[]>();

    public mobileOpen = signal(false);

    private bodyStyleUpdate = effect(() => {
        document.body.style.overflow = this.mobileOpen()
            ? 'hidden'
            : 'auto';
    });
    
    public toggleMobileNav() {
        this.mobileOpen.update(v => !v);
    }

    public onBackdropClick() {
        this.mobileOpen.set(false);
    }

    public onNavClick(event: Event, anchor: string) {
        event.preventDefault();
        this.mobileOpen.set(false);
        this.scrollService.scrollTo(anchor, { offset: 64, duration: 1000 });
    }

    public onTouchStart(event: TouchEvent) {
        this.touchStartX = event.touches[0].clientX;
    }

    public onTouchMove(event: TouchEvent) {
        this.touchEndX = event.touches[0].clientX;
    }

    public onTouchEnd() {
        const deltaX = this.touchEndX - this.touchStartX;
        if (deltaX > 70) {
            this.mobileOpen.set(false);
        }
    }
}