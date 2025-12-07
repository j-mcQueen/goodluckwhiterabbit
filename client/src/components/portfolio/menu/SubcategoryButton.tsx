export default function SubcategoryButton({
  label,
  isActive,
  className = "",
  disabled,
  onClick,
}: {
  label: string;
  isActive: boolean;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        [writing-mode:vertical-rl] 
        h-full p-3 py-5
        ${isActive ? "text-ylw" : ""}
        ${disabled ? "text-gray" : ""}
        ${className}
      `}
    >
      {label}
    </button>
  );
}
