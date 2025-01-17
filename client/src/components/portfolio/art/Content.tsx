import { art_data } from "../../../assets/media/images/art/art_data";

export default function Content() {
  return (
    <section className="flex justify-center">
      <div className="grid grid-cols-1 grid-rows-full gap-20 items-center justify-center">
        {art_data.map((item) => {
          return (
            <div
              key={item.title}
              className="flex flex-col items-center justify-center text-white min-h-dvh"
            >
              <img
                loading="lazy"
                src={item.src}
                alt={item.title}
                className="max-w-dvw max-h-[50dvh]"
              />

              <ul className="flex flex-col gap-1 pt-20 text-center text-lg">
                <li>
                  <span className="italic">{item.title}, </span>
                  {item.date}
                </li>
                <li>{item.medium}</li>
                <li>{item.dims}</li>
                <li>{item.signed ? "Signed" : "Unsigned"}</li>
                <li>
                  {item.edition === 1 ? "Unique" : `Edition of ${item.edition}`}
                </li>
                <li className={item.available ? "pt-4" : ""}>
                  {item.available ? (
                    <a
                      href="mailto:goodluckwhiterabbit@gmail.com"
                      className="border border-solid border-white px-2 py-1 xl:hover:text-rd xl:focus:text-rd group xl:transition-colors drop-shadow-glo xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:hover:border-rd xl:focus:border-rd opacity-80"
                    >
                      INQUIRE
                    </a>
                  ) : (
                    <div className="drop-shadow-red text-rd opacity-80 pt-4">
                      ~ COLLECTED ~
                    </div>
                  )}
                </li>
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
