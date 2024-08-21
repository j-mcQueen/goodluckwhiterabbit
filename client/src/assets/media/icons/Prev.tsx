export default function Prev({ ...props }) {
  const { className } = props;

  return (
    <svg
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="#fff"
      className={className}
    >
      <path d="m330-444 201 201-51 51-288-288 288-288 51 51-201 201h438v72H330Z" />
    </svg>
  );
}
