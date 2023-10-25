import { useState } from "react";
import "./landing.css";
import butterfly from "../../assets/media/RBUTTER.webp";
import life from "../../assets/media/LIFE.webp";

export default function Landing() {
  const [activePanel, setActivePanel] = useState("");

  return (
    <>
      <header>
        <div className="title-container">
          <h1>KAILEY MONET</h1>
          <h2>FINE ART PHOTOGRAPHY</h2>
        </div>
      </header>

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
          <a href="">
            <h3 className="still-sub">STILL</h3>
            <picture>
              <source srcSet="" media="" type="image/webp" />
              <img
                className="still-img"
                src={butterfly}
                alt="A photograph of Damien Hirst's red / gold butterfly painting, taken by Kailey Monet"
              />
            </picture>
          </a>
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
          <a href="">
            <h3 className="life-sub">LIFE</h3>
            <picture>
              <source srcSet="" media="" type="image/webp" />
              <img
                className="life-img"
                src={life}
                alt="A red cardinal flying amongst the woods, taken by Kailey Monet"
              />
            </picture>
          </a>
        </section>
      </main>

      <footer>
        <a className="bio-container" href="">
          BIOGRAPHY
        </a>
      </footer>
    </>
  );
}
