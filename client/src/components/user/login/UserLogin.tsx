import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rabbit from "../../global/forms/Rabbit";

export default function UserLogin() {
  useEffect(() => {
    document.title = "LOGIN — GOOD LUCK WHITE RABBIT";
  }, []);
  const navigate = useNavigate();
  const [authError, setAuthError] = useState({ active: false, message: "" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("http://localhost:3000/user/login", {
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
          return navigate(`user/${data._id}/dashboard`);
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
      <section className="text-white border border-solid border-white p-5">
        <Rabbit />

        <hgroup>
          <h1 className="text-2xl xl:text-3xl text-center italic pt-10">
            MAGIC AWAITS
          </h1>

          <p className="font-inter py-10">
            Enter your login code to access your photos
          </p>
        </hgroup>

        <form
          method="POST"
          encType="multipart/form-data"
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col"
        >
          <label className="flex flex-col">
            CODE
            <input
              type="text"
              name="code"
              minLength={8}
              onChange={() => {
                if (authError) setAuthError({ active: false, message: "" });
              }}
              className="bg-black border border-solid border-white xl:hover:border-cyn xl:focus:border-cyn transition-all font-inter text-ylw h-10 pl-2 mt-2 outline-none"
              required
            />
          </label>

          <div className="text-center">
            <button
              type="submit"
              className="border border-solid border-ylw xl:hover:border-grn xl:focus:border-grn transition-all mt-10 px-5 py-2"
            >
              BEGIN
            </button>
          </div>
        </form>

        {authError.active ? (
          <div className="font-tnr not-italic text-center text-sm text-red-500 pt-2">
            User not found. Please check your code and try again.
          </div>
        ) : null}
      </section>
    </main>
  );
}
