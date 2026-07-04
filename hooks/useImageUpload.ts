'use client';
/**
 * TKAG-34: Custom hook encapsulating image upload logic.
 * Provides a clean API for components that need programmatic upload control.
 */

import { useState, useCallback } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const UPLOAD_ENDPOINT = "/api/admin/upload";

export interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (message: string) => void;
}

export interface UseImageUploadReturn {
  isUploading: boolean;
  progress: number;
  error: string | null;
  upload: (file: File) => Promise<string | null>;
  reset: () => void;
}

export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        const msg = "Only JPEG, PNG, and WebP images are accepted.";
        setError(msg);
        options.onError?.(msg);
        return null;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const msg = `File is too large. Maximum size is 5 MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
        setError(msg);
        options.onError?.(msg);
        return null;
      }

      setError(null);
      setIsUploading(true);
      setProgress(0);

      return new Promise<string | null>((resolve) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          setIsUploading(false);

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText) as { url: string };
              options.onSuccess?.(data.url);
              resolve(data.url);
            } catch {
              const msg = "Invalid response from upload server.";
              setError(msg);
              options.onError?.(msg);
              resolve(null);
            }
          } else {
            let msg = "Upload failed. Please try again.";
            try {
              const err = JSON.parse(xhr.responseText) as { error?: string };
              if (err.error) msg = err.error;
            } catch {
              // use default message
            }
            setError(msg);
            options.onError?.(msg);
            resolve(null);
          }
        });

        xhr.addEventListener("error", () => {
          setIsUploading(false);
          const msg = "Network error during upload.";
          setError(msg);
          options.onError?.(msg);
          resolve(null);
        });

        xhr.addEventListener("abort", () => {
          setIsUploading(false);
          const msg = "Upload was cancelled.";
          setError(msg);
          options.onError?.(msg);
          resolve(null);
        });

        xhr.open("POST", UPLOAD_ENDPOINT);
        xhr.send(formData);
      });
    },
    [options]
  );

  return { isUploading, progress, error, upload, reset };
}