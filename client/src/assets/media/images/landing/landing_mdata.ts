import { mobile } from "../../../../components/user/dashboard/utils/determineViewport";

import clouds from "./desktop/clouds.webp";
import clouds_m from "./mobile/clouds_m.webp";

export const landing_mdata = [
  {
    alt: "A black and white cloudscape",
    path: "/photo",
    source: mobile ? clouds_m : clouds,
    text: "PHOTO",
  },
];
