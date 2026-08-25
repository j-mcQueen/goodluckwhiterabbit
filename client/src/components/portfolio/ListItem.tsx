export default function ListItem({ ...props }) {
  const { active = false, label, handleClick } = props;

  const styles = {
    item: "w-full h-full overflow-y-scroll relative",
    button: `w-full h-full max-h-full relative flex flex-col items-center justify-center gap-1 py-5 transition-colors ${active ? "text-rd drop-shadow-red" : "text-white/70"}`,
  };

  return (
    <li className={styles.item}>
      <button
        className={styles.button}
        onClick={handleClick}
        type="button"
      >
        {label}
      </button>
    </li>
  );
}
