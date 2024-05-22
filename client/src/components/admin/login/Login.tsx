import glwr from "../../../assets/media/gifs/glwr-lenticular.gif";
export default function Login() {
  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)] flex items-center justify-center">
      <section className="text-white border border-solid border-white xl:w-[25dvw] xl:h-[35dvw] mx-3 xl:mx-0 py-5 xl:py-0 flex flex-col justify-center">
        <div className="flex justify-center">
          <img
            src={glwr}
            alt="Image goes here"
            className="max-h-[25dvw] xl:max-h-[5dvw]"
          />
        </div>

        <hgroup className="pt-10 pb-5">
          <h1 className="font-tnr text-2xl xl:text-3xl text-center italic">
            WELCOME BACK!
          </h1>

          {/* <p className="font-inter text-sm xl:text-base px-5 xl:px-0 text-center">
            Enter your credentials to get back to where you left off.
          </p> */}
        </hgroup>

        <form action="" className="flex flex-col gap-5 py-5 px-3 xl:px-0">
          <label className="italic flex flex-col xl:px-5">
            USERNAME
            <input
              type="text"
              name="username"
              required
              className="bg-black border border-solid border-white font-inter text-gray h-10 pl-2 mt-2 outline-none focus:border-blu"
            />
            {/* <div className="font-inter not-italic text-sm text-red-500 pt-2">
              Username not found.
            </div> */}
          </label>

          <label className="italic flex flex-col xl:px-5">
            PASSWORD
            <input
              type="password"
              name="pwd"
              minLength={8}
              required
              className="bg-black border border-solid border-white font-inter text-gray h-10 pl-2 mt-2 outline-none focus:border-blu"
            />
            {/* <div className="font-inter not-italic text-sm text-red-500 pt-2">
              Invalid password. You shall not pass!
            </div> */}
          </label>

          <div className="flex justify-center pt-5">
            <button
              type="submit"
              className="font-inter bg-white text-black border border-solid border-white outline-none focus:bg-black focus:text-white focus:border-blu xl:hover:border-blu xl:hover:bg-black xl:hover:text-white  py-3 px-5 italic font-bold xl:transition-colors"
            >
              LOGIN
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
