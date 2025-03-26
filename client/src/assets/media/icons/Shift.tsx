export default function Shift({ ...props }) {
  const { className } = props;

  return (
    <svg
      role="img"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      color="#FFF"
    >
      <path d="M336-144v-278H144l336-442 336 442H624v278H336Zm72-72h144v-278h117L480-747 291-494h117v278Zm72-278Z" />
    </svg>
  );
}
