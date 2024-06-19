import Image from "next/image";
import "bootstrap-icons/font/bootstrap-icons.css";

import * as wmo from "../../../libs/wmo/wmo";
import {Locale, TempUnit} from "@/libs/wmo/enums";
import HorizontalForecast from "./components/horiontal_forecast";

export default async function Page({
  params,
  searchParams,
}: {
  params: {id: number};
  searchParams?: {[key: string]: any};
}) {
  const locale = Locale[(searchParams?.locale as keyof typeof Locale) || "En"];
  const unit = TempUnit[(searchParams?.unit as keyof typeof TempUnit) || "C"];
  const [pwx, wx] = await Promise.all([
    wmo.present(params.id, locale, unit),
    wmo.forecasts(params.id, locale, unit),
  ]);

  function getWindSpeed() {
    if (pwx.wind) {
      return `${pwx.wind.direction} ${pwx.wind.speed || "--"} m/s`;
    } else {
      return "--";
    }
  }

  return (
    <div
      className={`flex items-${searchParams?.align || "start"} min-h-screen`}
    >
      <div className="hidden md:block w-full">
        <div
          className="flex flex-row justify-around items-center m-1"
          style={{border: "1px lightgray solid", borderRadius: "5px"}}
        >
          <div className="flex mx-1 lg:mx-0">
            <div className="flex flex-col items-center">
              <div className="flex">
                <span className="text-secondary">
                  <i className="bi bi-geo"></i>
                  <span className="me-1">{pwx.city.name}</span>
                </span>
              </div>

              <div className="flex items-center my-1">
                <Image
                  src={pwx.icon!}
                  width={70}
                  height={50}
                  alt="Weather Icon"
                ></Image>
                {/* <Image className="wx-icon" src="<%= pwx.icon %>"></Image> */}
                <span className="fw-bold fs-4">
                  {`${pwx.temp || "--"}${pwx.tempUnit}`}
                </span>
              </div>

              <div className="flex flex-col lg:flex-row text-muted">
                <span className="mx-1">
                  <i className="bi bi-droplet-half"></i>
                  {`${pwx.rh || "--"}%`}
                </span>
                <span className="mx-1">
                  <i className="bi bi-wind"></i> {getWindSpeed()}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex mx-2" style={{height: "2.5rem"}}>
            <div className="inline-block h-[70px] min-h-[1em] w-px bg-black"></div>
          </div>

          <HorizontalForecast locale={locale} forecast={wx} />
          {/* {
            if (forecasts.length == 0) {
                <div className="d-flex flex-row justify-content-center align-items-center my-1 round-border" style="height: 5rem;">
                    <span className="text-danger">
                        Forecast Not Available
                    </span>
                </div>
              }
            }
          } */}
        </div>
      </div>
      <div className="block md:hidden w-full"></div>
    </div>
  );
}
