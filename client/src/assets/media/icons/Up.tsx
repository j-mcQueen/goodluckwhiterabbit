export default function Up({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${active === true ? "text-blu rotate-180" : "text-white rotate-0"} transition-transform w-[18px] h-[18px] xl:w-[18px] xl:h-[18px] overflow-visible`}
    >
      <path d="M12.354 8.854l5.792 5.792a.5.5 0 01-.353.854H6.207a.5.5 0 01-.353-.854l5.792-5.792a.5.5 0 01.708 0z"></path>
    </svg>
  );
}
