import Header from "../global/header/Header";
import MobileHeader from "../global/header/mobile/Header";
import Title from "../global/title/Title";

export default function Photo() {
  const mobile = window.matchMedia("(max-width: 1080px)").matches;
  const activePage = 1;

  return (
    <div className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      {mobile === true ? (
        <MobileHeader page={activePage} />
      ) : (
        <Header page={activePage} />
      )}

      <main className="">
        <section>
          <Title
            title={"PHOTOGRAPHY WORK"}
            subtext={
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore  magna aliqua."
            }
            page={activePage}
          />
        </section>

        <section></section>
      </main>
    </div>
  );
}
