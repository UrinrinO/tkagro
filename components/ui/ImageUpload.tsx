'use client';
/**
 * TKAG-34: Cloudinary image upload component for admin product form.
 * Supports drag-and-drop, click-to-select, upload progress, preview,
 * and multi-image gallery uploads (up to 6 images).
 */

import React, {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import styles from "./ImageUpload.module.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_GALLERY_IMAGES = 6;
const UPLOAD_ENDPOINT = "/api/admin/upload";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedImage {
  url: string;
  publicId?: string;
}

interface SingleImageUploadProps {
  mode: "single";
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

interface GalleryImageUploadProps {
  mode: "gallery";
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

type ImageUploadProps = SingleImageUploadProps | GalleryImageUploadProps;

// ─── Upload helper ────────────────────────────────────────────────────────────

async function uploadFileToCloudinary(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { url: string };
          resolve(data.url);
        } catch {
          reject(new Error("Invalid response from upload server."));
        }
      } else {
        let message = "Upload failed. Please try again.";
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string };
          if (err.error) message = err.error;
        } catch {
          // use default message
        }
        reject(new Error(message));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload."))
    );
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled.")));

    xhr.open("POST", UPLOAD_ENDPOINT);
    xhr.send(formData);
  });
}

// ─── File validation ──────────────────────────────────────────────────────────

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, and WebP images are accepted.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Maximum size is 5 MB (got ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  return null;
}

// ─── Drop Zone (shared primitive) ────────────────────────────────────────────

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const DropZone: React.FC<DropZoneProps> = ({
  onFiles,
  multiple = false,
  disabled = false,
  children,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        onFiles(multiple ? droppedFiles : [droppedFiles[0]]);
      }
    },
    [disabled, multiple, onFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length > 0) {
        onFiles(multiple ? selected : [selected[0]]);
      }
      // Reset so the same file can be re-selected if needed
      e.target.value = "";
    },
    [multiple, onFiles]
  );

  return (
    <div
      className={[
        styles.dropZone,
        isDragging ? styles.dragging : "",
        disabled ? styles.disabled : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload image"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className={styles.hiddenInput}
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
      />
      {children}
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className={styles.progressWrapper} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
    <div className={styles.progressTrack}>
      <div className={styles.progressFill} style={{ width: `${progress}%` }} />
    </div>
    <span className={styles.progressLabel}>{progress}%</span>
  </div>
);

// ─── Single Image Slot ────────────────────────────────────────────────────────

interface ImageSlotProps {
  url?: string;
  progress?: number;
  error?: string;
  onUpload: (files: File[]) => void;
  onRemove?: () => void;
  isUploading: boolean;
  label?: string;
}

const ImageSlot: React.FC<ImageSlotProps> = ({
  url,
  progress,
  error,
  onUpload,
  onRemove,
  isUploading,
  label,
}) => {
  return (
    <div className={styles.slotWrapper}>
      {label && <span className={styles.slotLabel}>{label}</span>}

      {url && !isUploading ? (
        <div className={styles.previewWrapper}>
          <img
            src={url}
            alt="Uploaded product"
            className={styles.previewImage}
          />
          {onRemove && (
            <button
              type="button"
              className={styles.removeButton}
              onClick={onRemove}
              aria-label="Remove image"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <DropZone onFiles={onUpload} disabled={isUploading}>
          {isUploading && progress !== undefined ? (
            <div className={styles.uploadingState}>
              <svg
                className={styles.spinnerIcon}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="31.4 31.4"
                />
              </svg>
              <ProgressBar progress={progress} />
              <p className={styles.uploadingText}>Uploading…</p>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg
                className={styles.uploadIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className={styles.emptyPrimary}>
                Drag &amp; drop or <span className={styles.browseLink}>browse</span>
              </p>
              <p className={styles.emptySecondary}>JPEG, PNG, WebP · max 5 MB</p>
            </div>
          )}
        </DropZone>
      )}

      {error && (
        <p className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// ─── Main ImageUpload Component ───────────────────────────────────────────────

const ImageUpload: React.FC<ImageUploadProps> = (props) => {
  // Per-slot upload state
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>(
    {}
  );
  const [progressSlots, setProgressSlots] = useState<Record<string, number>>(
    {}
  );
  const [errorSlots, setErrorSlots] = useState<Record<string, string>>({});

  const setSlotUploading = (key: string, val: boolean) =>
    setUploadingSlots((prev) => ({ ...prev, [key]: val }));
  const setSlotProgress = (key: string, val: number) =>
    setProgressSlots((prev) => ({ ...prev, [key]: val }));
  const setSlotError = (key: string, val: string) =>
    setErrorSlots((prev) => ({ ...prev, [key]: val }));
  const clearSlotError = (key: string) =>
    setErrorSlots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // ── Single mode ──────────────────────────────────────────────────────────

  if (props.mode === "single") {
    const { value, onChange, label } = props;
    const slotKey = "single";

    const handleFiles = async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setSlotError(slotKey, validationError);
        return;
      }

      clearSlotError(slotKey);
      setSlotUploading(slotKey, true);
      setSlotProgress(slotKey, 0);

      try {
        const url = await uploadFileToCloudinary(file, (pct) =>
          setSlotProgress(slotKey, pct)
        );
        onChange(url);
      } catch (err) {
        setSlotError(
          slotKey,
          err instanceof Error ? err.message : "Upload failed."
        );
      } finally {
        setSlotUploading(slotKey, false);
      }
    };

    return (
      <div className={styles.root}>
        {label && <label className={styles.fieldLabel}>{label}</label>}
        <ImageSlot
          url={value || undefined}
          progress={progressSlots[slotKey]}
          error={errorSlots[slotKey]}
          onUpload={handleFiles}
          onRemove={value ? () => onChange("") : undefined}
          isUploading={!!uploadingSlots[slotKey]}
        />
      </div>
    );
  }

  // ── Gallery mode ─────────────────────────────────────────────────────────

  const { value: urls, onChange: onGalleryChange, label } = props;

  const handleGalleryFiles = async (files: File[], startIndex: number) => {
    // Determine how many slots are available
    const available = MAX_GALLERY_IMAGES - urls.length;
    const filesToProcess = files.slice(0, available);

    if (filesToProcess.length === 0) {
      setSlotError(
        "gallery-overflow",
        `Maximum of ${MAX_GALLERY_IMAGES} images allowed.`
      );
      return;
    }

    clearSlotError("gallery-overflow");

    // Upload all selected files concurrently
    await Promise.all(
      filesToProcess.map(async (file, i) => {
        const slotKey = `gallery-new-${startIndex + i}-${Date.now()}`;

        const validationError = validateFile(file);
        if (validationError) {
          setSlotError(slotKey, validationError);
          return;
        }

        setSlotUploading(slotKey, true);
        setSlotProgress(slotKey, 0);

        try {
          const url = await uploadFileToCloudinary(file, (pct) =>
            setSlotProgress(slotKey, pct)
          );
          // Append to gallery
          onGalleryChange([...urls, url]);
        } catch (err) {
          setSlotError(
            slotKey,
            err instanceof Error ? err.message : "Upload failed."
          );
        } finally {
          setSlotUploading(slotKey, false);
        }
      })
    );
  };

  const handleRemoveGalleryImage = (index: number) => {
    const next = urls.filter((_, i) => i !== index);
    onGalleryChange(next);
  };

  // Determine if any slot is currently uploading
  const anyUploading = Object.values(uploadingSlots).some(Boolean);

  // Build slot array: existing images + one empty slot (if under limit)
  const showAddSlot = urls.length < MAX_GALLERY_IMAGES && !anyUploading;

  return (
    <div className={styles.root}>
      {label && <label className={styles.fieldLabel}>{label}</label>}

      <div className={styles.galleryGrid}>
        {urls.map((url, index) => (
          <ImageSlot
            key={`gallery-${index}`}
            url={url}
            onUpload={() => {}} // existing images are not re-uploadable in place
            onRemove={() => handleRemoveGalleryImage(index)}
            isUploading={false}
            label={index === 0 ? "Main image" : `Image ${index + 1}`}
          />
        ))}

        {/* Active uploading slots */}
        {Object.entries(uploadingSlots)
          .filter(([, uploading]) => uploading)
          .map(([key]) => (
            <ImageSlot
              key={key}
              progress={progressSlots[key]}
              error={errorSlots[key]}
              onUpload={() => {}}
              isUploading={true}
            />
          ))}

        {/* Add new image slot */}
        {showAddSlot && (
          <ImageSlot
            onUpload={(files) => handleGalleryFiles(files, urls.length)}
            isUploading={false}
            error={errorSlots["gallery-overflow"]}
            label={
              urls.length === 0
                ? "Add images (up to 6)"
                : `Add image (${urls.length}/${MAX_GALLERY_IMAGES})`
            }
          />
        )}
      </div>

      {urls.length >= MAX_GALLERY_IMAGES && (
        <p className={styles.galleryLimitNote}>
          Maximum of {MAX_GALLERY_IMAGES} gallery images reached.
        </p>
      )}
    </div>
  );
};

export default ImageUpload;