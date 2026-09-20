import glwr from "../../../assets/media/gifs/glwr-lenticular.gif";
export default function Rabbit({
  className = "max-h-[25dvw] xl:max-h-4",
}: {
  className?: string;
}) {
  return (
    <div className="flex justify-center">
      <img
        src={glwr}
        alt="Good Luck White Rabbit"
        className={className}
      />
    </div>
  );
}
