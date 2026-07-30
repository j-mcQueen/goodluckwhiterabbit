export default function ListItem({ ...props }) {
  const { disabled = false, label, handleClick } = props;

  const styles = {
    item: `w-full h-full ${disabled ? "text-gray" : ""} overflow-y-scroll relative`,
    button: `w-full h-full max-h-full relative flex flex-col items-center justify-center gap-1 py-5`,
  };

  return (
    <li className={styles.item} key={label}>
      <button
        className={styles.button}
        disabled={disabled}
        onClick={handleClick}
        type="button"
      >
        {label}
      </button>
    </li>
  );
}
