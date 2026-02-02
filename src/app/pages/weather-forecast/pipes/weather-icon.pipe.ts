import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'weatherIcon',
    standalone: true,
})
export class WeatherIconPipe implements PipeTransform {
    transform(weatherCode: number): string {
        const type = WEATHER_CODE_MAP[weatherCode] ?? WeatherType.Sunny;

        return `./pages/weather-forecast/icon-${type}.webp`;
    }
}

// Сопоставить enum с иконками погоды
export enum WeatherType {
    Drizzle = 'drizzle',
    Fog = 'fog',
    Overcast = 'overcast',
    PartlyCloudy = 'partly-cloudy',
    Rain = 'rain',
    Snow = 'snow',
    Storm = 'storm',
    Sunny = 'sunny'
}

export const WEATHER_CODE_MAP: Record<number, WeatherType> = { // переделать нахуй
    0: WeatherType.Sunny,
    1: WeatherType.Sunny,
    2: WeatherType.PartlyCloudy,
    3: WeatherType.Overcast,
    45: WeatherType.Fog,
    48: WeatherType.Fog,
    51: WeatherType.Drizzle,
    53: WeatherType.Drizzle,
    55: WeatherType.Drizzle,
    56: WeatherType.Drizzle,
    57: WeatherType.Drizzle,
    61: WeatherType.Rain,
    63: WeatherType.Rain,
    65: WeatherType.Rain,
    66: WeatherType.Rain,
    67: WeatherType.Rain,
    71: WeatherType.Snow,
    73: WeatherType.Snow,
    75: WeatherType.Snow,
    77: WeatherType.Snow,
    80: WeatherType.Rain,
    81: WeatherType.Rain,
    82: WeatherType.Rain,
    85: WeatherType.Snow,
    86: WeatherType.Snow,
    95: WeatherType.Storm,
    96: WeatherType.Storm,
    99: WeatherType.Storm
}