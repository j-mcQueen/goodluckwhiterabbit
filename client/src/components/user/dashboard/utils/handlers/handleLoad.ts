import { executeGenerationChain } from "../../../../global/utils/executeGenerationChain";
import { generateKeys } from "../../../../global/utils/generateKeys";

export const handleLoad = async ({ ...params }) => {
  params.setSpinner(true);
  params.setDisabled(true);

  const data = await executeGenerationChain(
    params.imageset,
    params.activeImageset,
    params.setNotice,
    params.imageset.length,
    params.imageset.length + 10,
    params.userId,
    "sm"
  );

  const generatedKeys = generateKeys();
  const nextKeys = [...params.staticKeys, ...generatedKeys];

  params.setStaticKeys(nextKeys);
  params.setImages({ ...params.images, [params.activeImageset]: data.files });
  params.setDisabled(false);
  params.setSpinner(false);
};
