export default function Splash({ ...props }) {
  const { user, activated, setActivated, activeImageset } = props;
  const title =
    user.files[activeImageset].count > 0
      ? "excitement awaits"
      : "magic is on the way";
  const copy =
    user.files[activeImageset].count > 0
      ? `The moment you've been waiting for is here! Click the button below to view the images in the ${activeImageset} collection.`
      : "We're working hard to get these photographs ready for the grand reveal - you'll receive an email when there are updates. Thank you for your patience!";

  const handleClick = () => {
    const nextActivated = { ...activated };
    nextActivated[activeImageset] = true;
    setActivated(nextActivated);
  };

  return (
    <main>
      <div>
        <h1>{title}</h1>
        <p>{copy}</p>

        {user.files[activeImageset].count > 0 ? (
          <button
            onClick={handleClick}
            className="text-white border border-solid border-white xl:hover:border-red focus:border-red outline-none px-3 py-2 xl:transition-all"
            type="button"
          >
            ENTER
          </button>
        ) : null}
      </div>
    </main>
  );
}
