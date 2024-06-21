import Image from "next/image";
import "bootstrap-icons/font/bootstrap-icons.css";

import * as wmo from "../../../libs/wmo/wmo";
import {Locale, TempUnit} from "@/libs/wmo/enums";
import HorizontalLayout from "./components/horizontal_layout";
import VerticalLayout from "./components/vertical_layout";

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

  return (
    <div
      className={`flex items-${searchParams?.align || "start"} min-h-screen`}
    >
      <div className="hidden md:block w-full">
        <HorizontalLayout locale={locale} weather={pwx} forecast={wx} />
      </div>
      <div className="block md:hidden w-full">
        <VerticalLayout locale={locale} weather={pwx} forecast={wx} />
      </div>
    </div>
  );
}
