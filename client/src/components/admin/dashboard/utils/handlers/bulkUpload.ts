import { determineHost as host } from "../../../../global/utils/determineHost";

type BulkUploadSuccess = {
  failed: string[];
  firstTen: string[];
  newCount: number;
};

type BulkUploadResponse = BulkUploadSuccess;

export const bulkUpload = async (
  formData: FormData,
  user: { _id: string; fileCounts: { [key: string]: number } },
  imageset: string,
  updateProgress: (percent: number) => void,
): Promise<BulkUploadResponse> => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open(
      "POST",
      `${host}/admin/users/${user._id}/${imageset}/bulkUpload?fileCount=${user.fileCounts[imageset]}`,
    );
    req.withCredentials = true;
    req.setRequestHeader("Accept", "application/json");

    req.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        updateProgress(percentage);
      }
    };

    req.onload = () => {
      if (req.status >= 200 && req.status < 300) {
        try {
          resolve(JSON.parse(req.responseText));
        } catch (error) {
          reject(new Error(`Upload failed with status ${req.status}`));
        }
      } else {
        try {
          const errorData = JSON.parse(req.responseText);
          reject(
            new Error(
              errorData.detail ||
                errorData.error ||
                `Request failed with status ${req.status}`,
            ),
          );
        } catch {
          reject(new Error(`Request failed with status ${req.status}`));
        }
      }
    };

    req.onerror = () => reject(new Error(`Network error during upload`));
    req.ontimeout = () => reject(new Error("Upload timed out"));

    req.send(formData);
  });
};
