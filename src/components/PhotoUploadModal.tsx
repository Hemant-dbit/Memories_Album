import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId?: string;
  onPhotoUploaded: () => void;
}

export default function PhotoUploadModal({
  isOpen,
  onClose,
  albumId,
  onPhotoUploaded,
}: PhotoUploadModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const validFormats = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/jpg",
      ];
      if (!validFormats.includes(file.type)) {
        toast.error("Invalid file format. Upload a JPG, PNG, GIF, or WEBP.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      console.log("Crop completed:", croppedArea, croppedAreaPixels);
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error("User not found");

      const fileName = `${userData.user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, selectedFile, { contentType: selectedFile.type });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);
      if (!publicUrlData) throw new Error("Failed to retrieve public URL");

      const { error: dbError } = await supabase.from("photos").insert({
        user_id: userData.user.id,
        url: publicUrlData.publicUrl,
        caption,
        album_id: albumId || null,
      });

      if (dbError) throw dbError;

      toast.success("Photo uploaded successfully!");
      onPhotoUploaded();
      onClose();
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upload Photo</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          {!image ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer text-indigo-600 hover:text-indigo-500"
              >
                Click to upload a photo
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative h-96">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
              <textarea
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!image}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
