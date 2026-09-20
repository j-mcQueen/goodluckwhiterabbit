import { mobile } from "../../../../components/user/dashboard/utils/determineViewport";

import art from "./desktop/art.webp";
import art_sub from "./desktop/art_sub.jpg";
import design from "./desktop/design.webp";
import photo from "./desktop/photo.jpg";
import photo_sub from "./desktop/photo_sub.webp";
import art_m from "./mobile/art_m.webp";
import art_sub_m from "./mobile/art_sub_m.webp";
import design_m from "./mobile/design_m.webp";
import photo_m from "./mobile/photo_m.jpg";
import photo_sub_m from "./mobile/photo_sub_m.webp";

const designImage = mobile ? design_m : design;

// source: shown on the primary (category) tile - revealed on hover on desktop.
// subSource: shown behind the subcategory tiles once the category is selected.
export const landing_mdata = [
  {
    alt: "Photography",
    path: "/photo",
    source: mobile ? photo_m : photo,
    subSource: mobile ? photo_sub_m : photo_sub,
    text: "PHOTO",
  },
  {
    alt: "Art",
    path: "/art",
    source: mobile ? art_m : art,
    subSource: mobile ? art_sub_m : art_sub,
    text: "ART",
  },
  {
    alt: "Design",
    path: "/design",
    source: designImage,
    // TEMP: reuses the primary image until a dedicated subcategory one exists
    subSource: designImage,
    text: "DESIGN",
  },
];
