import {FutureWeather} from "@/libs/wmo/definition";
import {Locale} from "@/libs/wmo/enums";
import * as wmo from "@/libs/wmo/wmo";

export default function Forecasts({
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
          <img src={wx.icon!} width={60} height={40} alt="Weather Icon" />
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