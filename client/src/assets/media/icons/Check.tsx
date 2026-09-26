export default function Check({ ...props }) {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="#fff"
      className={className}
    >
      <path d="M382-186 154-414l57-57 171 171 355-355 57 57-412 412Z" />
    </svg>
  );
}
