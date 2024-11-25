"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/actions/listings";
import Spinner from "../common/spinner";

const uploadListingImage = async (file: any) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const url = await uploadImage(formData);
    if (url) {
      return url;
    }
  } catch (err) {
    console.log(err);
  }
};

const FileUploader = ({ images = [], onChange }: { images: string[]; onChange: (images: string[]) => void }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptedFileExtensions = ["jpg", "png", "jpeg"];
  const acceptedFileTypesString = acceptedFileExtensions.map((ext) => `.${ext}`).join(",");

  useEffect(() => {
    setSelectedFiles(images);
  }, [images]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFilesArray = Array.from(event.target.files);
      processFiles(newFilesArray);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = async (filesArray: File[]) => {
    let hasError = false;
    const updatedFiles = [...selectedFiles];
    const fileTypeRegex = new RegExp(acceptedFileExtensions.join("|"), "i");

    try {
      for (const file of filesArray) {
        const fileExtension = file.name.split(".").pop() || "";
        if (!fileTypeRegex.test(fileExtension)) {
          setError(`Only ${acceptedFileExtensions.join(", ")} files are allowed`);
          hasError = true;
        } else {
          setIsUploading(true);
          const fileUrl = await uploadListingImage(file);
          updatedFiles.push(fileUrl);
          setSelectedFiles(updatedFiles);
          onChange(updatedFiles);
        }
      }
    } catch (err) {
      console.log(err);
      setError("Error while uploading the file");
      hasError = true;
    }

    if (!hasError) {
      setError("");
      setIsUploading(false);
    }
  };

  const handleCustomButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileDelete = (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    onChange(updatedFiles);
  };

  return (
    <>
      <div
        className="min-h-[23rem] border-2 border-gray-300 border-dashed rounded-3xl p-4 flex flex-col justify-center items-center space-y-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e)}
      >
        {selectedFiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 px-4">
            {selectedFiles.map((file, index) => (
              <div key={file} className="flex justify-between items-center border-b py-2">
                <div className="flex items-center">
                  <Image src={file} alt="File Preview" width={238} height={116} />
                </div>
                <button
                  type="button"
                  onClick={() => handleFileDelete(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" className="w-6 h-6">
                    <path stroke="currentColor" strokeWidth="2" d="M6 4l8 8M14 4l-8 8" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-lg font-semibold">Drag and Drop the files</p>
            <p className="text-lg font-bold">or</p>
          </>
        )}
        <button
          type="button"
          onClick={handleCustomButtonClick}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {!isUploading ? (
            "Upload Files"
          ) : (
            <div className="flex">
              <Spinner />
              Uploading...
            </div>
          )}
        </button>
        <input
          type="file"
          id="files"
          name="files"
          multiple
          accept={acceptedFileTypesString}
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          onClick={(event) => {
            // Reset the input value to allow selecting the same file again
            (event.target as HTMLInputElement).value = "";
          }}
        />
      </div>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </>
  );
};

export default FileUploader;
