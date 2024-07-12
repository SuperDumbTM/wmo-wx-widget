import Image from "next/image";

import {FutureWeather, PresentWeather} from "@/libs/wmo/definition";
import {Locale} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";
import {getTranslations} from "next-intl/server";

async function CurrentWeather({weather}: {weather: PresentWeather}) {
  const t = await getTranslations("weather");

  return (
    <>
      <div className="flex">
        <span className="text-gray-600 max-w-60 overflow-hidden whitespace-nowrap text-ellipsis">
          <i className="bi bi-geo"></i>
          <span className="me-1">{weather.city.name}</span>
        </span>
      </div>

      <div className="flex items-center my-1">
        <Image
          src={weather.icon!}
          width={70}
          height={50}
          alt="Weather Icon"
        ></Image>

        <div className="flex flex-col items-center my-1">
          <span className="font-bold text-2xl">
            {`${weather.temp || "--"}${weather.tempUnit}`}
          </span>
        </div>
        {/* <div className="flex flex-col items-center my-1 max-w-32">
          <span className="font-bold text-2xl">
            {`${weather.temp || "--"}${weather.tempUnit}`}
          </span>
          <span className="w-full text-xs truncate">
            {weather.weather ? t(weather.weather) : ""}
          </span>
        </div> */}
      </div>

      <div className="flex my-1 max-w-50">
        <span className="w-full text-xs truncate">
          {weather.weather ? t(weather.weather) : ""}
        </span>
      </div>

      <div className="flex flex-row">
        <span className="mx-1">
          <i className="bi bi-droplet-half"></i> {`${weather.rh || "--"}%`}
        </span>
        <span className="mx-1">
          <i className="bi bi-wind"></i>{" "}
          {weather.wind
            ? `${weather.wind.direction} ${weather.wind.speed || "--"} m/s`
            : "--"}
        </span>
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
      <div className="flex w-75">
        <span className="text-red-600">Forecast Not Available</span>
      </div>
    );
  }

  return forecast.forecasts.map(function (wx, idx) {
    let _d = new Date(wx.date);

    return (
      <div className="flex flex-col flex-1 h-auto" key={idx}>
        <div
          className="flex flex-col justify-center items-center"
          style={{fontSize: "0.75rem"}}
        >
          <span
            className="text-gray-400"
            style={{
              whiteSpace: "nowrap",
              overflow: "ellipsis",
            }}
          >
            {_d.toLocaleString(wmo.wmoToIso639(locale), {weekday: "long"})}{" "}
          </span>
          <span>{_d.getDate()}</span>
        </div>

        <div
          className="flex justify-center items-center my-2"
          style={{minWidth: "30%"}}
        >
          <Image
            src={wx.icon!}
            width={50}
            height={30}
            alt="Weather Icon"
          ></Image>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center">
          <span className="text-sky-600 mx-1">
            {forecast.forecasts.length >= 7 ? (
              ""
            ) : (
              <i className="bi bi-thermometer-low"></i>
            )}
            {`${wx.temp.min ?? "--"}${wx.temp.unit}`}
          </span>
          <span className="text-red-600 mx-1">
            {forecast.forecasts.length >= 7 ? (
              ""
            ) : (
              <i className="bi bi-thermometer-high"></i>
            )}
            {`${wx.temp.max ?? "--"}${wx.temp.unit}`}
          </span>
        </div>
      </div>
    );
  });
}

export default function HorizontalLayout({
  locale,
  weather,
  forecast,
}: {
  locale: Locale;
  weather: PresentWeather;
  forecast: FutureWeather;
}) {
  return (
    <div
      className="flex flex-row justify-around items-center m-1 p-2"
      style={{border: "1px lightgray solid", borderRadius: "5px"}}
    >
      <div className="flex flex-col justify-center items-center mx-1 lg:mx-0 w-60 border-r">
        <CurrentWeather weather={weather}></CurrentWeather>
      </div>

      <div className="flex flex-1 justify-center">
        <Forecasts locale={locale} forecast={forecast}></Forecasts>
      </div>
    </div>
  );
}
