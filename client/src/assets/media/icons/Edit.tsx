export default function Edit({ ...props }) {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="#fff"
      className={className}
    >
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l585-583 167 171-582 582H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
    </svg>
  );
}
