import glwr from "../../../assets/media/gifs/glwr-lenticular.gif";
export default function Rabbit() {
  return (
    <div className="flex justify-center">
      <img
        src={glwr}
        alt="Image goes here"
        className="max-h-[25dvw] xl:max-h-[5dvw]"
      />
    </div>
  );
}
