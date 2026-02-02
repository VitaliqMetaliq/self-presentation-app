import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ScrollService {
    
    scrollTo(target: string, options: ScrollOptions = {}) {
    const element = document.querySelector(target);
    if (!element) return;

    const offset = options.offset ?? 80;

    const startY = window.scrollY;
    const rawTargetY = element.getBoundingClientRect().top + startY - offset;

    const minScrollY = 0;
    const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;

    const targetY = Math.max(minScrollY, Math.min(rawTargetY, maxScrollY));

    const distance = Math.abs(targetY - startY);
    if (distance < 2) return;

    const duration = Math.min(
        options.duration ?? 700,
        Math.max(250, distance * 0.9)
    );

    const easeOutCubic = (t: number) => 
        1 - Math.pow(1 - t, 3);

    const startTime = performance.now();

    const animate = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = easeOutCubic(progress);

        window.scrollTo(
            0,
            startY + (targetY - startY) * eased
        );

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
    
    }
}

export interface ScrollOptions { 
    offset?: number;
    duration?: number;
}