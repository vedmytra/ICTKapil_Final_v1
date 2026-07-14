import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE_MB = 8;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export interface UploadProgressHandler {
  onProgress?: (percent: number) => void;
  onError?: (error: Error) => void;
}

export function validateScreenshot(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only PNG, JPEG, WEBP, or GIF images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File must be under ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}

export async function uploadTradeScreenshot(
  userId: string,
  tradeId: string,
  file: File,
  handlers: UploadProgressHandler = {}
): Promise<string> {
  const validationError = validateScreenshot(file);
  if (validationError) throw new Error(validationError);

  const ext = file.name.split(".").pop();
  const path = `screenshots/${userId}/${tradeId}/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const percent =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        handlers.onProgress?.(percent);
      },
      (error) => {
        handlers.onError?.(error as Error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/** Phase 3 — same upload pipeline, scoped under backtests/ instead of screenshots/. */
export async function uploadBacktestScreenshot(
  userId: string,
  entryId: string,
  file: File,
  handlers: UploadProgressHandler = {}
): Promise<string> {
  const validationError = validateScreenshot(file);
  if (validationError) throw new Error(validationError);

  const ext = file.name.split(".").pop();
  const path = `backtests/${userId}/${entryId}/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        handlers.onProgress?.(percent);
      },
      (error) => {
        handlers.onError?.(error as Error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function deleteTradeScreenshot(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (err) {
    // Non-fatal — file may already be gone or URL was external.
    console.warn("Failed to delete screenshot:", err);
  }
}
