import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GroupedHourlyForecast, HourForecast, LocationData, LocationResponse, WeatherApiResponse, WeatherData } from "./weather-api.dto";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable()
export class OpenMeteoHttpService {
    private readonly forecastBaseUrl = 'https://api.open-meteo.com/v1/forecast';
    private readonly searchBaseUrl = 'https://geocoding-api.open-meteo.com/v1/search';

    private readonly http = inject(HttpClient);

    getLocations(name: string): Observable<LocationData[]> {
        return this.http.get<LocationResponse>(this.searchBaseUrl, {
            params: {
                name: name
            }
        }).pipe(
            map(e => e.results),
            catchError(this.handleError));
    }

    getWeather(lat: number, lon: number, 
               tempUnit?: string, 
               windUnit?: string, 
               precUnit?: string): Observable<WeatherData> {
        return this.http.get<WeatherApiResponse>(this.forecastBaseUrl, {
            params: {
                latitude: lat,
                longitude: lon,
                current: [
                    'temperature_2m',
                    'apparent_temperature',
                    'relative_humidity_2m',
                    'precipitation',
                    'wind_speed_10m',
                    'weather_code',
                ].join(','),

                hourly: [
                    'temperature_2m',
                    'precipitation',
                    'weather_code',
                ].join(','),

                daily: [
                    'temperature_2m_max',
                    'temperature_2m_min',
                    'precipitation_sum',
                    'weather_code',
                ].join(','),

                temperature_unit: tempUnit ?? 'celsius', 
                wind_speed_unit: windUnit ?? 'kmh', 
                precipitation_unit: precUnit ?? 'mm', 

                forecast_days: 7,
                timezone: 'auto',
            },
        }).pipe(
            map(this.mapToWeatherData),
            catchError(this.handleError));
    }

    private mapToWeatherData(response: WeatherApiResponse): WeatherData {
        return {
            current: {
                date: Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(response.current.time)),
                temperature: Math.round(response.current.temperature_2m),
                feelsLike: Math.round(response.current.apparent_temperature),
                humidity: response.current.relative_humidity_2m,
                precipitation: response.current.precipitation,
                windspeed: Math.round(response.current.wind_speed_10m),
                weatherCode: response.current.weather_code,
                units: { 
                    precipitation: response.current_units.precipitation,
                    windspeed: response.current_units.wind_speed_10m,
                }
            },

            groupedHourly: response.hourly.time.reduce((acc, timeStr, i) => {
                const date = new Date(timeStr);
                const hourData: HourForecast = {
                    time: date.toLocaleTimeString('en-US', { hour: 'numeric' }),
                    temperature: Math.round(response.hourly.temperature_2m[i]),
                    precipitation: response.hourly.precipitation[i],
                    weatherCode: response.hourly.weather_code[i],
                };

                const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
                const existingGroup = acc.find(e => e.weekday === weekday);
                if (existingGroup) {
                    existingGroup.forecast.push(hourData);
                } else {
                    acc.push({ weekday: weekday, forecast: [hourData] });
                }

                return acc;
            }, [] as GroupedHourlyForecast[]),

            daily: response.daily.time.map((date, i) => ({
                date: new Date(date),
                min: Math.round(response.daily.temperature_2m_min[i]),
                max: Math.round(response.daily.temperature_2m_max[i]),
                precipitation: response.daily.precipitation_sum[i],
                weatherCode: response.daily.weather_code[i],
            })),
        }
    }

    private handleError(error: HttpErrorResponse) {
        const message = error.error?.reason 
            ?? 'We couldn\'t connect to the server (API error). Please try again in a few moments.';
        
        console.error('[Weather API]', error);
        return throwError(() => new Error(message));
    }
}
