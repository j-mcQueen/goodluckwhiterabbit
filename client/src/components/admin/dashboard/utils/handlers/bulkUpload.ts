type BulkUploadSuccess = {
  failed: string[];
  firstTen: string[];
};

type BulkUploadResponse = BulkUploadSuccess;

export const bulkUpload = async (
  formData: FormData,
  userId: string,
  imageset: string,
  updateProgress: (percent: number) => void,
): Promise<BulkUploadResponse> => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open("POST", `/users/${userId}/${imageset}/bulkUpload`);
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
