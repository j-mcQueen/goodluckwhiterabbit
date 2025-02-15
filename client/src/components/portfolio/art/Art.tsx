import Rabbit from "../../global/forms/Rabbit";
import Content from "./Content";

export default function Art() {
  return (
    <>
      <main className="w-outer h-outer">
        <header>
          <Rabbit />
        </header>

        <section>
          <Content />
        </section>
      </main>
    </>
  );
}
