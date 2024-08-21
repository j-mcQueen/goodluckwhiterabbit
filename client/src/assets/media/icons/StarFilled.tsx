export default function StarFilled({ ...props }) {
  const { className, red } = props;

  return (
    <svg
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      color={red ? "#DC2626" : "#FFF"}
      className={className}
    >
      <path d="m243-144 63-266L96-589l276-24 108-251 108 252 276 23-210 179 63 266-237-141-237 141Z" />
    </svg>
  );
}
