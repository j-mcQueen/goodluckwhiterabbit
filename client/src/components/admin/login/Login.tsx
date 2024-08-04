import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rabbit from "../../global/forms/Rabbit";

export default function Login() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/admin/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (data.errors) {
        // validation errors have been returned from servers. Likely a special character is in the username field
        return setAuthError(true);
      } else {
        // success!
        setAuthError(false);
        return navigate("/admin/dashboard");
      }
    } catch (err) {
      return setAuthError(true);
    }
  };

  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)] flex items-center justify-center">
      <section className="text-white border border-solid border-white xl:w-[25dvw] xl:h-[35dvw] mx-3 xl:mx-0 py-5 xl:py-0 flex flex-col justify-center">
        <Rabbit />

        <hgroup className="pt-10 pb-5">
          <h1 className="font-tnr text-2xl xl:text-3xl text-center italic">
            WELCOME BACK!
          </h1>

          {/* <p className="font-inter text-sm xl:text-base px-5 xl:px-0 text-center">
            Enter your credentials to get back to where you left off.
          </p> */}
        </hgroup>

        <form
          method="POST"
          encType="multipart/form-data"
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col gap-5 py-5 px-3 xl:px-0"
        >
          <label className="italic flex flex-col xl:px-5">
            USERNAME
            <input
              type="text"
              name="username"
              minLength={4}
              onChange={() => {
                if (authError) setAuthError(false);
              }}
              required
              className="bg-black border border-solid border-white font-inter text-ylw h-10 pl-2 mt-2 outline-none focus:border-blu"
            />
          </label>

          <label className="italic flex flex-col xl:px-5">
            PASSWORD
            <input
              type="password"
              name="password"
              minLength={8}
              onChange={() => {
                if (authError) setAuthError(false);
              }}
              required
              className="bg-black border border-solid border-white font-inter text-ylw h-10 pl-2 mt-2 outline-none focus:border-blu"
            />
          </label>

          <div className="flex justify-center pt-5">
            <button
              type="submit"
              className="font-tnr bg-white text-black border border-solid border-white outline-none focus:bg-black focus:text-white focus:border-blu xl:hover:border-blu xl:hover:bg-black xl:hover:text-white italic py-3 px-5 tracking-wider font-bold xl:transition-colors"
            >
              LOGIN
            </button>
          </div>
        </form>

        {authError ? (
          <div className="font-tnr not-italic text-center text-sm text-red-500 pt-2">
            <p>Your code isn't quite right...</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
