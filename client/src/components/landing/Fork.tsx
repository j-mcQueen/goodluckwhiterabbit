import { landing_mdata as mdata } from "../../assets/media/images/landing/landing_mdata";
import Segment from "./Segment";

export default function Fork() {
  return (
    <section className="flex flex-col w-full h-[calc(100dvh-1.5rem)]">
      {mdata.map((a, i) => {
        return (
          <Segment
            alt={a.alt}
            count={i + 1}
            key={a.alt}
            path={a.path}
            source={a.source}
            text={a.text}
          />
        );
      })}
    </section>
  );
}
