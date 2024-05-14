export default function Title({ ...props }) {
  const { page, title, subtext } = props;

  return (
    <hgroup>
      <h1
        className={`${page === 1 ? "text-blu" : page === 2 ? "text-ylw" : page === 3 ? "text-red-600" : ""} text-center xl:text-left text-2xl xl:text-2xl pb-2 xl:pb-3`}
      >
        {title}
      </h1>

      <p className="font-inter text-gray font-light text-sm xl:text-md italic">
        {subtext}
      </p>
    </hgroup>
  );
}
