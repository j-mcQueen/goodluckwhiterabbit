export default function Title({ ...props }) {
  const { page, title, subtext } = props;

  return (
    <hgroup>
      <h1
        className={`${page === 1 ? "text-blu" : page === 2 ? "text-ylw" : page === 3 ? "text-red-600" : ""} text-xl xl:text-2xl pb-2 xl:pb-3`}
      >
        {title}
      </h1>

      <p className="font-inter text-gray-400 italic">{subtext}</p>
    </hgroup>
  );
}
