import Instagram from "../../assets/media/icons/Instagram";
import Mail from "../../assets/media/icons/Mail";

const CONTACT_BUTTON_CLASSES =
  "w-14 h-14 border border-solid border-white flex items-center justify-center";

// mobile-only closing tile under the last category: an Instagram link and the
// same inquiry modal the portfolio's mobile nav opens
export default function Contact({ ...props }) {
  const { setContactOpen } = props;

  return (
    <div className="flex flex-1 items-center justify-center gap-6 xl:hidden">
      <a
        href="https://www.instagram.com/goodluckwhiterabbit/"
        aria-label="Instagram"
        className={CONTACT_BUTTON_CLASSES}
      >
        <Instagram className="w-[24px] h-[24px] overflow-visible" />
      </a>

      <button
        type="button"
        aria-label="Send an inquiry"
        onClick={() => setContactOpen((prev: boolean) => !prev)}
        className={CONTACT_BUTTON_CLASSES}
      >
        <Mail className="w-[24px] h-[24px]" />
      </button>
    </div>
  );
}
