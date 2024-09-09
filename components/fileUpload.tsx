import React, { ChangeEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { imageUploadToIpfs } from "@/utils";

type ImageState = {
  file: File | null;
  previewURL: string | null;
  loading: boolean;
};

export default function FileUpload({
  setImage,
}: {
  setImage: React.Dispatch<React.SetStateAction<ImageState>>;
}) {

  function setIsUploading(loading: boolean) {
    setImage((prev) => ({ ...prev, loading }));
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setIsUploading(true);
      imageUploadToIpfs(file)
        .then((ipfsUrl) => {
          setImage({
            file,
            previewURL: ipfsUrl,
            loading: false,
          });
        })
        .catch((error) => {
          setIsUploading(false);
          toast.error(error.message);
        });
    }
  };

  return (
    <div className="">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600"
      >
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
        <input
          onChange={handleImageChange}
          id="dropzone-file"
          type="file"
          accept="image/*"
          className="hidden"
        />
        <span className="sr-only">Upload image</span>
      </label>
    </div>
  );
}
