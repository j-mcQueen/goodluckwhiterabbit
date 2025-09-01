export default function SelectBtn({ ...props }) {
  const { buttonVariants, count, handleSelect, imageset } = props;

  const nameMap = {
    snapshots: "SNAPSHOTS",
    keepsake: "KEEPSAKE PREVIEW",
    core: "CORE COLLECTION",
    snips: "SOCIALS",
  };

  return (
    <button
      disabled={count === 0}
      type="button"
      className={
        count === 0 ? buttonVariants["empty"] : buttonVariants["populated"]
      }
      onClick={() => handleSelect(imageset)}
    >
      {nameMap[imageset as keyof typeof nameMap]}
    </button>
  );
}
