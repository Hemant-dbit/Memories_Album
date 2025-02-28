import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Album, Photo } from "../types";
import Calendar from "../components/Calendar";
import PhotoUploadModal from "../components/PhotoUploadModal";

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  console.log("Album ID from URL:", id); // Log the album_id for debugging
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAlbumDetails();
      fetchPhotos();
    }
  }, [id]);

  const fetchAlbumDetails = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("albums")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setAlbum(data);
  };

  const fetchPhotos = async () => {
    if (!id) return;
    console.log("Fetching photos for album_id:", id); // Log the album_id

    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching photos:", error.message);
      alert(`Failed to load photos: ${error.message}`);
    } else {
      console.log("Fetched Photos:", data); // Log the fetched photos
      setPhotos(data || []);
    }
  };

  const handleDateSelect = (date: Date) => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Link>
            <h1 className="ml-4 text-2xl font-bold text-gray-900">
              {album?.name || "Loading..."}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Photos</h2>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center text-indigo-600 hover:text-indigo-500"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add Photo
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-sm">{photo.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Calendar onDateSelect={handleDateSelect} />
          </div>
        </div>
      </main>

      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        albumId={id}
        onPhotoUploaded={fetchPhotos}
      />
    </div>
  );
}
