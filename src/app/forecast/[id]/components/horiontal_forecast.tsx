import Image from "next/image";

import {FutureWeather} from "@/libs/wmo/definition";
import {Locale} from "@/libs/wmo/enums";

import * as wmo from "../../../../libs/wmo/wmo";

export default function HorizontalForecast({
  locale,
  forecast,
}: {
  locale: Locale;
  forecast: FutureWeather;
}) {
  if (forecast.forecasts.length == 0) {
    return (
      <div className="flex justify-center w-75">
        <span className="text-red-600">Forecast Not Available</span>
      </div>
    );
  }

  return forecast.forecasts.map(function (wx, idx) {
    let _d = new Date(wx.date);

    return (
      <div className="flex flex-col" key={idx}>
        <div className="flex flex-col justify-center items-center">
          <span className="text-gray-400" style={{fontSize: "0.8rem"}}>
            {_d.toLocaleString(wmo.wmoToIso639(locale), {weekday: "long"})}{" "}
            {_d.getDate()}
          </span>
        </div>

        <div
          className="flex justify-center items-center"
          style={{minWidth: "30%"}}
        >
          <Image
            src={wx.icon!}
            width={60}
            height={40}
            alt="Weather Icon"
          ></Image>
        </div>

        <div className="flex flex-col lg:flex-row justify-center items-center">
          <span className="text-sky-600 mx-1">
            <i className="bi bi-thermometer-low"></i>
            {`${wx.temp.min}${wx.temp.unit}`}
          </span>
          <span className="text-red-600 mx-1">
            <i className="bi bi-thermometer-high"></i>
            {`${wx.temp.max}${wx.temp.unit}`}
          </span>
        </div>
      </div>
    );
  });
}
