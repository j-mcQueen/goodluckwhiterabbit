import { determineHost as host } from "../../../../../global/utils/determineHost";

type PortfolioBulkUploadResponse = {
  succeeded: string[];
  failed: string[];
  newCount: number;
};

export const portfolioBulkUpload = async (
  files: File[],
  category: string,
  sub: string,
  groupId: string,
  existingCount: number,
  updateProgress: (percent: number) => void,
): Promise<PortfolioBulkUploadResponse> => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open(
      "POST",
      `${host}/admin/portfolio/${category}/${sub}/${groupId}/bulkUpload?fileCount=${existingCount}`,
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

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    req.send(formData);
  });
};
