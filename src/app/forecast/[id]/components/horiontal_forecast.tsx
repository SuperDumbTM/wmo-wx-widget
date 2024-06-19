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
  return forecast.forecasts.map(function (wx, idx) {
    let _d = new Date(wx.date);

    return (
      <div className="flex flex-col my-1" key={idx}>
        <div
          className="flex flex-col grow justify-center items-center"
          style={{minWidth: "6.2rem"}}
        >
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

        <div className="flex justify-center items-center flex-fill">
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
