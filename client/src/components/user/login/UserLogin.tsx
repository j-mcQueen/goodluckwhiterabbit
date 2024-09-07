import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rabbit from "../../global/forms/Rabbit";

export default function UserLogin() {
  useEffect(() => {
    document.title = "LOGIN — GOOD LUCK WHITE RABBIT";
  }, []);
  const navigate = useNavigate();
  const host =
    process.env.ENV === "production"
      ? process.env.REACT_APP_API_URL
      : "http://localhost:3000";

  const [authError, setAuthError] = useState({ active: false, message: "" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`${host}/user/login`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();

      switch (data.status) {
        case 404:
          // user not found
          throw new TypeError(
            "User not found. Please check your code and try again."
          );

        case 500:
          // something else went wrong
          throw new TypeError(
            "Something went wrong. Please reach out for assistance."
          );

        default:
          // we have a winner!
          setAuthError({ active: false, message: "" });
          return navigate(`/user/${data}/dashboard`);
      }
    } catch (err) {
      return setAuthError({
        active: true,
        message: (err as TypeError).message,
      });
    }
  };

  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)] flex items-center justify-center">
      <section className="text-white xl:border xl:border-solid xl:border-white w-[90dvw] h-dvh xl:w-[25dvw] xl:h-[35dvw] pb-6 xl:mx-0 xl:py-0 flex flex-col justify-end">
        <Rabbit />

        <hgroup className="pt-10 xl:pb-5 xl:pl-10 pl-3">
          <h1 className="font-liquid text-2xl xl:text-3xl tracking-widest opacity-80 drop-shadow-glo pt-10">
            magic awaits
          </h1>

          <p className="text-lg">ENTER LOGIN CODE TO ACCESS PORTAL</p>
        </hgroup>

        <form
          method="POST"
          encType="multipart/form-data"
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col gap-5 xl:pb-10 py-3"
        >
          <label className="flex flex-col text-lg xl:px-10">
            CODE
            <input
              type="text"
              name="code"
              minLength={8}
              onChange={() => {
                if (authError) setAuthError({ active: false, message: "" });
              }}
              className="bg-black border border-solid border-white xl:focus:border-red transition-all font-liquid text-rd h-10 pl-2 mt-2 outline-none"
              required
            />
          </label>

          {authError.active ? (
            <div className="font-vt text-md text-rd xl:pl-10">
              <p>INVALID CODE. TRY AGAIN!</p>
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
                begin
              </span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
