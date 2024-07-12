import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getLocale, getMessages} from "next-intl/server";
import {Inter} from "next/font/google";

import "../../public/globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "wmo-wx-widget",
  description:
    "A self-hosted responsive weather widget that uses the World Meteorological Organization (WMO) as the data source.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Navbar></Navbar>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
