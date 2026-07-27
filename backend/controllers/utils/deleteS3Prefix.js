import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";

// deletes every object under `prefix`, paginating via ContinuationToken since
// a subcategory/group can span more than the 1000-key page/delete-batch limit
export const deleteS3Prefix = async (bucket, prefix) => {
  let continuationToken;
  let deleted = 0;

  do {
    const listResult = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    const objects = (listResult.Contents ?? []).map((obj) => ({ Key: obj.Key }));

    if (objects.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects },
        }),
      );
      deleted += objects.length;
    }

    continuationToken = listResult.IsTruncated
      ? listResult.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return deleted;
};
