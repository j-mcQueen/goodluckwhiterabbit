import Rabbit from "../../global/forms/Rabbit";
import Content from "./Content";

export default function Art() {
  return (
    <>
      <main className="w-outer h-outer">
        <header>
          <Rabbit />
          <hgroup>
            <h1></h1>

            <p></p>
          </hgroup>
        </header>

        <section>
          <Content />
        </section>
      </main>
    </>
  );
}
