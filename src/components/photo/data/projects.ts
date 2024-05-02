// TODO each item in each data set should have an images property that refers to an import of all that project's images (e.g. tag.images)
import { commercialImages } from "../../../assets/media/images/commercial/commercial";

const commercial = [
  {
    subject: "TAGLIALATELLA GALLERIES",
    path: "taglialatella",
    category: "commercial",
    images: commercialImages.taglialatella,
  },
  { subject: "ARTON CONTEMPORARY", path: "arton", category: "commercial" },
  {
    subject: "BLOOM EXPRESS CBD",
    path: "bloom-express-cbd",
    category: "commercial",
  },
  {
    subject: "NEW YORK BLOOMS",
    path: "blooms",
    category: "commercial",
    images: commercialImages.blooms,
  },
  {
    subject: "SOLEIMANI COLLECTION",
    path: "soleimani",
    category: "commercial",
  },
];

const editoral = [
  { subject: "DJ PROFILE", path: "dj-profile" },
  { subject: "PIBBS VINTAGE", path: "pibbs-vintage" },
  { subject: "ARTIST PROFILE", path: "artist-profile" },
];

const film = [
  { subject: "PEOPLE", path: "people" },
  { subject: "PLACES", path: "places" },
  { subject: "LIFE", path: "life" },
];

const events = [
  { subject: "RUSSELL YOUNG : DREAMLAND", path: "dreamland" },
  { subject: "MILKWEED BOTANICAL", path: "X" },
  { subject: "Y", path: "Y" },
];

export const projects = { commercial, editoral, film, events };
