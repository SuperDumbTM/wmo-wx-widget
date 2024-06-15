import { TempUnit } from "./enums"

export interface Country {
    id: number
    name: string
    orgName: string
    logo: string
    url: string
}

export interface City {
    id: number
    name: string
    country: Country
    latitude: number
    longitude: number
    forecast: boolean
    climate: boolean
    isCapital: boolean
}

export interface Forecast {
    date: string
    description: string
    weather: string
    temp: Temperature
    icon: string
}

export interface ForecastCity {
    name: string
    stationName: string
    latitude: number
    longitude: number
    isCapital: boolean
    timeZone: string
    isDST: boolean
}

export interface FutureWeather {
    issueAt: Date
    country: Country
    city: ForecastCity
    forecasts: Array<Forecast>
}

export interface Temperature {
    unit: TempUnit
    max: number
    min: number
}

export interface Wind {
    direction: string
    speed: number | null
}

export interface Sun {
    rise: Date
    set: Date
}

export interface PresentWeather {
    city: City
    issueAt: Date | null
    temp: number | null
    tempUnit: TempUnit | null
    rh: number | null
    weather: string | null
    icon: string | null
    wind: Wind | null
    sun: Sun
}