import { Dispatch, SetStateAction } from "react";

export const handleActionClick = (
  client: object,
  setTargetClient: Dispatch<SetStateAction<object>>,
  pane: string,
  setActivePane: Dispatch<SetStateAction<string>>
) => {
  setTargetClient(client);
  setActivePane(pane);
};
