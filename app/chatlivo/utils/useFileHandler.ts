"use client";

import { useAppDispatch } from "@/app/utils/hooks";
import { showErrorToast } from "@/app/components/Toast/ErrorToast";
import { updateSendMessageData } from "@/app/store/Slices/SendMessageSlice";

const useFileHandler = () => {
  const dispatch = useAppDispatch();

  function onFilechange(file: File) {
    if (!file) return;

    const fileType = file.type || "";
    const name = file.name.toLowerCase();

    const isImage =
      fileType === "image/png" ||
      fileType === "image/jpeg" ||
      fileType === "image/svg+xml" ||
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".svg");

    const isPdf = fileType === "application/pdf" || name.endsWith(".pdf");

    const isDoc =
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      name.endsWith(".doc") ||
      name.endsWith(".docx");

    // ================= IMAGE =================
    if (isImage) {
      if (file.size > 2 * 1024 * 1024) {
        return showErrorToast("Only images up to 2MB are allowed");
      }

      dispatch(
        updateSendMessageData({
          message_type: "image",
          selectedFile: file,
        }),
      );

      return;
    }

    // ================= DOCUMENT =================
    if (isPdf || isDoc) {
      if (file.size > 2 * 1024 * 1024) {
        return showErrorToast("PDF and DOC files up to 2MB are allowed");
      }

      dispatch(
        updateSendMessageData({
          message_type: "document",
          selectedFile: file,
        }),
      );

      return;
    }

    return showErrorToast(
      "Only PNG, JPG, JPEG, SVG images and PDF, DOC, DOCX documents are allowed",
    );
  }

  return { onFilechange };
};
export default useFileHandler;
