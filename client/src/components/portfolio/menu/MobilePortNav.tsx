import { useState } from "react";

import TopBar from "../../global/header/mobile/TopBar";

export default function MobilePortNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header>
      <TopBar isOpen={isOpen} logout={false} setIsOpen={setIsOpen} />
    </header>
  );
}
