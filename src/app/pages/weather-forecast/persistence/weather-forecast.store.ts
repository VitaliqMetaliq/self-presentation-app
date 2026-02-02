import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { OpenMeteoHttpService } from "../http-client/open-meteo-http.service";
import { LocationData, SelectedUnits, WeatherData } from "../http-client/weather-api.dto";

@Injectable()
export class WeatherForecastStore { // типа этот сервис отвечает за лоадинг и получение данных
    private readonly service = inject(OpenMeteoHttpService);

    readonly weather = signal<WeatherData | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly search = signal<LocationData[] | null>(null);
    readonly selectedWeekday = signal<string | null>(null);
    readonly locationsLoading = signal(false);

    readonly current = computed(() => this.weather()?.current);

    readonly selectedHourly = computed(() => { // должен возвращать 24 часовых
        const selected = this.selectedWeekday();
        if (!selected) return null;

        return this.weather()?.groupedHourly.find(e => e.weekday === selected) ?? null;
    });

    readonly weekdays = computed(() => this.weather()?.groupedHourly.map(g => g.weekday) ?? []);

    private readonly initWeekdaysEffect = effect(() => {
        const days = this.weekdays();
        if (!this.selectedWeekday() && days.length) {
            this.selectedWeekday.set(days[0]);
        }
    });

    // readonly hourly = computed(() => this.weather()?.hourly ?? []); // вместо этого - другая модель
    // если this.weather().hourly будет другой моделью, 

    readonly daily = computed(() => this.weather()?.daily ?? []);
    // readonly locations = computed(() => this.search() ?? []);

    loadForecast(lat: number, lon: number, units?: SelectedUnits) {
        this.loading.set(true);
        this.error.set(null);

        this.service.getWeather(lat, lon, units?.temperature, units?.windspeed, units?.precipitation).subscribe({
            next: data => this.weather.set(data),
            error: err => this.error.set(err.message),
            complete: () => this.loading.set(false),
        });
    }

    loadLocations(name: string) {
        this.locationsLoading.set(true); // по сути, тут должен быть другой лоадинг
        this.error.set(null); // и другая ошибка

        this.service.getLocations(name).subscribe({
            next: data => this.search.set(data),
            error: err => this.search.set(null), // this.error.set(err.message),
            complete: () => this.locationsLoading.set(false), // searchLoading
        });
    }
}