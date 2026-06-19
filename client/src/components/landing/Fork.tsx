import { landing_mdata as mdata } from "../../assets/media/images/landing/landing_mdata";
import Segment from "./Segment";

export default function Fork() {
  return (
    <section className="flex flex-col w-full">
      {mdata.map((a) => {
        return (
          <Segment
            alt={a.alt}
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
