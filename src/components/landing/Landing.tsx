import { useState } from "react";
import "./landing.css";
import butterfly from "../../assets/media/RBUTTER.webp";
import life from "../../assets/media/LIFE.webp";

export default function Landing() {
  const [activePanel, setActivePanel] = useState("");

  // when we hover a panel, it's width extends to 3/4, and it's counterpart's width shrinks to 1/4

  return (
    <main onMouseLeave={() => setActivePanel("")}>
      <section
        onMouseEnter={() => setActivePanel("still")}
        className={
          activePanel === "still"
            ? "still-active"
            : activePanel === "life"
            ? "still-shrunk"
            : "still"
        }
      >
        <picture>
          <source />
          <img src={butterfly} alt="" />
        </picture>
      </section>

      <section
        onMouseEnter={() => setActivePanel("life")}
        className={
          activePanel === "life"
            ? "life-active"
            : activePanel === "still"
            ? "life-shrunk"
            : "life"
        }
      >
        <picture>
          <source />
          <img src={life} alt="" />
        </picture>
      </section>
    </main>
  );
}
