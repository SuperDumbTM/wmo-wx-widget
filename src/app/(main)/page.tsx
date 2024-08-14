export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="grid grid-rows-3 grid-flow-col gap-1">
        <div className="row-span-3">
          <img
            width={120}
            height={120}
            src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
          ></img>
        </div>
        <div className="col-span-2 flex items-center">
          <a
            href="https://github.com/SuperDumbTM/wmo-wx-widget"
            target="_blank"
          >
            SuperDumbTM/wmo-wx-widget
          </a>
        </div>
        <div className="row-span-2 col-span-2 flex items-center">
          <p className="text-justify" style={{maxWidth: "250px"}}>
            A self-hosted responsive weather widget that uses the World
            Meteorological Organization (WMO) as the data source.
          </p>
        </div>
      </div>
    </main>
  );
}
