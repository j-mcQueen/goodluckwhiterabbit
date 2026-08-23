export default function Rewind({ ...props }) {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="#fff"
      className={className}
    >
      <path d="M860-240 500-480l360-240v480Zm-400 0L100-480l360-240v480Z" />
    </svg>
  );
}
