import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rabbit from "../../global/forms/Rabbit";

export default function Login() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(false);
  const host =
    import.meta.env.VITE_ENV === "production"
      ? import.meta.env.VITE_API_URL
      : "http://localhost:3000";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    e.preventDefault();

    try {
      const response = await fetch(`${host}/admin/login`, {
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
      <section className="text-white xl:border xl:border-solid xl:border-white w-[90dvw] h-dvh xl:w-[25dvw] xl:h-[35dvw] pb-6 xl:mx-0 xl:py-0 flex flex-col justify-end">
        <Rabbit />

        <hgroup className="pt-10 xl:pb-5">
          <h1 className="font-liquid text-2xl xl:text-3xl tracking-widest opacity-80 drop-shadow-glo xl:pl-10 pl-3 pb-7 xl:pb-0">
            welcome back
          </h1>
        </hgroup>

        <form
          method="POST"
          encType="multipart/form-data"
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col gap-5 py-3 xl:py-10 px-3 xl:px-0"
        >
          <label className="text-lg xl:text-xl flex flex-col xl:px-10">
            USERNAME
            <input
              type="text"
              name="username"
              minLength={4}
              onChange={() => {
                if (authError) setAuthError(false);
              }}
              required
              className="font-liquid bg-black border border-solid focus:border-red xl:transition-all border-white text-rd h-10 pl-2 mt-2 outline-none"
            />
          </label>

          <label className="text-lg xl:text-xl flex flex-col xl:px-10">
            PASSWORD
            <input
              type="password"
              name="password"
              minLength={8}
              onChange={() => {
                if (authError) setAuthError(false);
              }}
              required
              className="font-liquid bg-black border border-solid border-white focus:border-red text-rd h-10 pl-2 mt-2 outline-none"
            />
          </label>

          {authError ? (
            <div className="font-vt text-md text-rd xl:pl-10">
              <p>ACCESS DENIED. YOU SHALL NOT PASS!</p>
            </div>
          ) : (
            <div className="font-vt text-md xl:pl-10 opacity-0">
              <p>WELL FOUND! THIS IS AN EASTER EGG.</p>
            </div>
          )}

          <div className="text-end xl:pt-6">
            <button
              type="submit"
              className="text-white border border-solid border-white xl:hover:text-rd xl:hover:border-red focus:border-red focus:text-rd drop-shadow-glo focus:drop-shadow-red xl:hover:drop-shadow-red outline-none pl-6 pr-5 pt-3 pb-2 xl:transition-all xl:mr-10"
            >
              <span className="font-liquid text-[20px] tracking-widest opacity-80">
                login
              </span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
