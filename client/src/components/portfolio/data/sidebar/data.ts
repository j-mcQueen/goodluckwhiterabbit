export const sidebar_data: {
  [key: string]: {
    title: string;
    subcategories: string[];
    menu: { [key: string]: string }[];
  };
} = {
  "/art": {
    title: "ART",
    subcategories: [],
    menu: [],
  },
  "/design": {
    title: "DESIGN",
    subcategories: [],
    menu: [],
  },
  "/photo": {
    title: "PHOTOGRAPHY",
    subcategories: ["WEDDINGS", "EVENTS", "FILM", "COMMERCIAL", "EDITORIAL"],
    menu: [
      {
        "STRONG ROPE BREWERY": "001",
        "RED BUTTE GARDENS": "002",
        "9 ORCHARD": "003",
        MONROE: "004",
        ATMOSFERA: "005",
        "THE RIVER CAFE": "006",
        "MILK & ROSES I": "007",
        "FANDI MATA": "008",
        "LE FANFARE": "009",
        "CARROLL GARDEN": "010",
        TUFFET: "011",
        "TIME 100": "012",
        "THE BOX HOUSE": "013",
        "MILK & ROSES II": "014",
        "BK WINERY": "015",
        "501 UNION": "016",
        "THE SANCTUARY": "017",
      },
      {
        "EVENT 1": "001",
        "EVENT 2": "002",
        "EVENT 3": "003",
        "EVENT 4": "004",
      },
      {
        "FILM 1": "001",
        "FILM 2": "002",
        "FILM 3": "003",
        "FILM 4": "004",
      },
      {
        "COMMERCIAL 1": "001",
        "COMMERCIAL 2": "002",
        "COMMERCIAL 3": "003",
        "COMMERCIAL 4": "004",
      },
      {
        "EDITORIAL 1": "001",
        "EDITORIAL 2": "002",
        "EDITORIAL 3": "003",
        "EDITORIAL 4": "004",
      },
    ],
  },
};
