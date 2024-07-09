import Image from "next/image";

import {FutureWeather, PresentWeather} from "@/libs/wmo/definition";
import {Locale} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";

function CurrentWeather({weather}: {weather: PresentWeather}) {
  return (
    <>
      <div className="flex my-1">
        <span className="text-gray-600">
          <i className="bi bi-geo"></i>
          <span className="me-1">{weather.city.name}</span>
        </span>
      </div>

      <div className="flex justify-around items-center my-1">
        <Image
          src={weather.icon!}
          width={60}
          height={40}
          alt="Weather Icon"
        ></Image>

        <span className="font-medium text-lg">
          {`${weather.temp}${weather.tempUnit}`}
        </span>

        <div className="flex mx-2" style={{height: "2.5rem"}}>
          <div className="vr"></div>
        </div>

        <div className="flex flex-col">
          <div className="flex my-1">
            <span className="text-muted">
              <i className="bi bi-droplet-half"></i> {`${weather.rh || "--"}%`}
            </span>
          </div>
          <div className="flex my-1">
            <span className="text-muted">
              <i className="bi bi-wind"></i>{" "}
              {weather.wind
                ? `${weather.wind.direction} ${weather.wind.speed || "--"} m/s`
                : "--"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function Forecasts({
  locale,
  forecast,
}: {
  locale: Locale;
  forecast: FutureWeather;
}) {
  if (forecast.forecasts.length == 0) {
    return (
      <div className="flex flex-row justify-center items-center m-1 h-20 rounded-border">
        <span className="text-red-600">Forecast Not Available</span>
      </div>
    );
  }

  return forecast.forecasts.map(function (wx, idx) {
    let _d = new Date(wx.date);

    return (
      <div className="flex flex-row m-1 rounded-border" key={idx}>
        <div
          className="flex flex-col justify-center items-center"
          style={{minWidth: "30%"}}
        >
          <span className="text-gray-400" style={{fontSize: "0.57rem"}}>
            {_d.toLocaleString(wmo.wmoToIso639(locale), {weekday: "long"})}{" "}
          </span>
          <span>{_d.getDate()}</span>
        </div>

        <div className="flex grow justify-center items-center">
          <Image
            src={wx.icon!}
            width={60}
            height={40}
            alt="Weather Icon"
          ></Image>
        </div>

        <div
          className="flex flex-col justify-center items-center"
          style={{minWidth: "30%"}}
        >
          <span className="text-sky-600 mx-1">
            <i className="bi bi-thermometer-low"></i>
            {`${wx.temp.min ?? "--"}${wx.temp.unit}`}
          </span>
          <span className="text-red-600 mx-1">
            <i className="bi bi-thermometer-high"></i>
            {`${wx.temp.max ?? "--"}${wx.temp.unit}`}
          </span>
        </div>
      </div>
    );
  });
}

export default function VerticalLayout({
  locale,
  weather,
  forecast,
}: {
  locale: Locale;
  weather: PresentWeather;
  forecast: FutureWeather;
}) {
  return (
    <div className="flex flex-col flex-nowrap">
      <div className="flex flex-col items-center m-1 rounded-border">
        <CurrentWeather weather={weather}></CurrentWeather>
      </div>

      <Forecasts locale={locale} forecast={forecast}></Forecasts>
    </div>
  );
}
