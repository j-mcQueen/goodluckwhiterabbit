export default function Sort({ ...props }) {
  const { className } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      color="#fff"
      className={className}
    >
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"></path>
    </svg>
  );
}
