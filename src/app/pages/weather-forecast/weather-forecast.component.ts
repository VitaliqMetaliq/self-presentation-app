import { CommonModule } from "@angular/common";
import { Component, effect, ElementRef, HostListener, inject, signal, ViewChild, ViewEncapsulation } from "@angular/core";
import { WeatherForecastStore } from "./persistence/weather-forecast.store";
import { OpenMeteoHttpService } from "./http-client/open-meteo-http.service";
import { WeekdayPipe } from "./pipes/weekday.pipe";
import { WeatherIconPipe } from "./pipes/weather-icon.pipe";
import { LocationData, SelectedUnits, WeatherLocalStorageData } from "./http-client/weather-api.dto";

@Component({
    selector: 'app-weather-forecast',
    templateUrl: './weather-forecast.component.html',
    styleUrls: ['./weather-forecast.component.scss'],
    imports: [CommonModule, WeekdayPipe, WeatherIconPipe],
    providers: [WeatherForecastStore, OpenMeteoHttpService],
    standalone: true,
    encapsulation: ViewEncapsulation.ShadowDom
})
export class WeatherForecastComponent {
    readonly store = inject(WeatherForecastStore);
    private readonly storageKey: string = 'vg-weather-forecast-key';
    public isUnitsOpen = signal(false);
    public isDropdownOpen = signal(false);
    public selectedUnits = signal<SelectedUnits>({ temperature: 'celsius', windspeed: 'kmh', precipitation: 'mm' });
    public location = signal<LocationData>({ id: 498817, country: 'Russia', name: 'St Petersburg', country_code: 'RU', latitude: 59.93863, longitude: 30.31413, timezone: 'Europe/Moscow' });
    public isSearchOpen = signal(false);

    @ViewChild('selectRef') selectRef!: ElementRef;
    @ViewChild('unitsRef') unitsRef!: ElementRef;
    @ViewChild('searchRef') searchRef!: ElementRef;

    private selectUnitsEffect = effect(() => {
        const units = this.selectedUnits();
        const location = this.location();
        this.store.loadForecast(location.latitude, location.longitude, units);
        localStorage.setItem(this.storageKey, JSON.stringify({ units, location }));
    });
    

    ngOnInit() {
        const unitsString = localStorage.getItem(this.storageKey);
        if (unitsString !== null) {
            const parsed = JSON.parse(unitsString) as WeatherLocalStorageData;
            this.selectedUnits.set(parsed.units);
            this.location.set(parsed.location);
        }
    }

    onSearchClick(query: string) {
        if (query.length > 0) {
            this.isSearchOpen.set(true);
            this.store.loadLocations(query);
        }
    }

    selectLocation(location: LocationData, event: Event) {
        event.stopPropagation();
        this.isSearchOpen.set(false);
        this.location.set(location);
    }

    selectDay(weekday: string) {
        this.store.selectedWeekday.set(weekday);
        this.isDropdownOpen.set(false);
    }

    toggleUnits(event: Event) {
        event.stopPropagation();
        this.isUnitsOpen.update(v => !v);
    }

    toggleDropdown(event: Event) {
        event.stopPropagation();
        this.isDropdownOpen.update(v => !v);
    }

    onRetryClick() {
        this.store.loadForecast(59.95, 30.19, this.selectedUnits());
    }

    onUnitChange(unit: string, value: string) {
        switch (unit) {
            case 'temperature':
                this.selectedUnits.update((v) => ({ ...v, temperature: value as 'celsius' | 'fahrenheit' }));
                break;
            case 'windspeed':
                this.selectedUnits.update((v) => ({ ...v, windspeed: value as 'kmh' | 'mph' }));
                break;
            case 'precipitation':
                this.selectedUnits.update((v) => ({ ...v, precipitation: value as 'mm' | 'inch' }));
                break;
        }
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        const target = event.target as Node;
        if (!this.selectRef.nativeElement.contains(target)) {
            this.isDropdownOpen.set(false);
        }

        if (!this.unitsRef.nativeElement.contains(target)) {
            this.isUnitsOpen.set(false);
        }

        if (this.searchRef && !this.searchRef.nativeElement.contains(target)) {
            this.isSearchOpen.set(false);
        }
    }
}

