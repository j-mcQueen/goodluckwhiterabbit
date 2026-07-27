export default function ThisWayUp({ ...props }) {
  const { className } = props;
  return (
    <svg
      id="Layer_1"
      data-name="Layer 1"
      fill="currentColor"
      color="#fff"
      className={className}
      viewBox="0 0 369 366.82"
    >
      <rect y="299.8" width="369" height="65.58" style={{ fill: "#fff" }} />
      <rect y="365.38" width="369" height="1.44" style={{ fill: "#fff" }} />
      <polygon
        points="346.66 86.47 304.14 86.47 304.14 278.18 260.17 278.18 260.17 86.47 217.65 86.47 282.16 0 346.66 86.47"
        style={{ fill: "#fff" }}
      />
      <polygon
        points="151.35 86.47 108.83 86.47 108.83 278.18 64.86 278.18 64.86 86.47 22.34 86.47 86.84 0 151.35 86.47"
        style={{ fill: "#fff" }}
      />
    </svg>
  );
  // may have to change the viewBox to be 0 0 24 24
}
