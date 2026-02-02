export interface WeatherApiResponse {
    latitude: number;
    longitude: number;
    timezone: string;

    current: {
        time: Date;
        temperature_2m: number;
        apparent_temperature: number;
        relative_humidity_2m: number;
        precipitation: number;
        wind_speed_10m: number;
        weather_code: number;
    };

    current_units: {
        precipitation: string;
        wind_speed_10m: string;
    }

    hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation: number[];
        weather_code: number[];
    };

    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        weather_code: number[];
    }
}

export interface CurrentWeather {
    date: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    precipitation: number;
    windspeed: number;
    weatherCode: number;

    units: WeatherCurrentUnits;
}

export interface WeatherCurrentUnits {
    precipitation: string;
    windspeed: string;
}

export interface HourForecast {
    time: string;
    temperature: number;
    precipitation: number;
    weatherCode: number;
}

export interface GroupedHourlyForecast {
    weekday: string;
    forecast: HourForecast[];
}

export interface DailyForecast {
    date: Date;
    min: number;
    max: number;
    precipitation: number;
    weatherCode: number;
}

export interface WeatherData {
    current: CurrentWeather;
    //   hourly: HourForecast[];
    groupedHourly: GroupedHourlyForecast[];
    daily: DailyForecast[];
}

export interface LocationResponse {
    results: LocationData[];
}

export interface LocationData {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country_code: string;
    timezone: string;
    country: string;
}

export interface WeatherLocalStorageData {
    units: SelectedUnits;
    location: LocationData;
}

export interface SelectedUnits {
    temperature: 'celsius' | 'fahrenheit';
    windspeed: 'kmh' | 'mph';
    precipitation: 'mm' | 'inch';
}
