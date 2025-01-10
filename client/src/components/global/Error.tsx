import { icons } from "../admin/dashboard/styles/styles";
import Prev from "../../assets/media/icons/Prev";
import Rabbit from "./forms/Rabbit";

export default function Error() {
  return (
    <main className="w-outer h-outer flex flex-col justify-center text-white">
      <section>
        <Rabbit />

        <hgroup className="flex flex-col items-center justify-center">
          <h1 className="font-tnrBI text-2xl xl:text-5xl tracking-widest opacity-80 drop-shadow-glo">
            ...NOTHING TO SEE HERE
          </h1>
          <div>
            <div className="overflow-hidden whitespace-nowrap animate-typing flex items-center">
              <p className="text-lg xl:text-xl mt-5">
                SORRY ABOUT THAT. EITHER YOU LOOKED FOR A PAGE THAT DOESN'T
                EXIST, OR THERE WAS AN ISSUE BEHIND THE SCENES...
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => history.back()}
            className="xl:hover:border-rd focus:border-rd outline-none transition-colors border border-solid border-white w-10 h-10 flex items-center justify-center group mt-5 ml-5"
          >
            <Prev className={icons} />
          </button>
        </hgroup>
      </section>
    </main>
  );
}
