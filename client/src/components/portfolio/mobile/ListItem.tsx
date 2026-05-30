export default function ListItem({ ...props }) {
  const { depth, index, label, handleClick } = props;

  const styles = {
    item: `w-full h-full ${depth === 0 && index !== 0 ? "text-gray" : ""} overflow-y-scroll relative`,
    button: `w-full h-full max-h-full relative flex flex-col items-center justify-center gap-1 py-5`,
  };

  return (
    <li className={styles.item} key={label}>
      <button
        className={styles.button}
        disabled={depth === 0 && index !== 0}
        onClick={handleClick}
        type="button"
      >
        {label}
        {depth === 0 && index !== 0 ? <span>(SOON)</span> : null}
      </button>
    </li>
  );
}
