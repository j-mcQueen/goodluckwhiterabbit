export default function Download({ ...props }) {
  const { className } = props;

  return (
    <svg
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="#fff"
      className={className}
    >
      <path d="M192-96v-72h576v72H192Zm288-144L219-576h141v-288h240v288h141L480-240Zm0-117 114-147h-66v-288h-96v288h-66l114 147Zm0-147Z" />
    </svg>
  );
}
