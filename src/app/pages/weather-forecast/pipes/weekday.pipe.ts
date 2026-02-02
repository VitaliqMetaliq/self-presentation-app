import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'weekday',
    standalone: true
})
export class WeekdayPipe implements PipeTransform {
    transform(date: Date | string): string {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
        }).format(new Date(date));
    }
}