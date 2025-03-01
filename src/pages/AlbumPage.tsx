import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { ChevronLeft, Plus, Trash } from "lucide-react";
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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDeleteAlbumModalOpen, setIsDeleteAlbumModalOpen] = useState(false); // State for delete album modal
  const navigate = useNavigate(); // For navigation after deletion

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

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("id", selectedPhoto.id);

    if (error) {
      console.error("Error deleting photo:", error.message);
      alert(`Failed to delete photo: ${error.message}`);
    } else {
      setPhotos(photos.filter((photo) => photo.id !== selectedPhoto.id));
      setSelectedPhoto(null);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!id) return;

    try {
      // Delete the album from the database
      const { error } = await supabase.from("albums").delete().eq("id", id);

      if (error) {
        console.error("Error deleting album:", error.message);
        alert(`Failed to delete album: ${error.message}`);
      } else {
        // Redirect to the home page after successful deletion
        navigate("/");
      }
    } catch (err) {
      console.error("Unexpected error deleting album:", err);
      alert("An unexpected error occurred while deleting the album.");
    } finally {
      // Close the modal regardless of success or failure
      setIsDeleteAlbumModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </Link>

            {/* Album Name */}
            <h1 className="text-2xl font-bold text-gray-900">
              {album?.name || "Loading..."}
            </h1>

            {/* Delete Album Button */}
            <button
              onClick={() => setIsDeleteAlbumModalOpen(true)}
              className="flex items-center text-red-600 hover:text-red-500"
            >
              <Trash className="h-5 w-5 mr-1" />
              Delete Album
            </button>
          </div>
        </div>
      </header>

      {/* Delete Album Confirmation Modal */}
      {isDeleteAlbumModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Album</h2>
            <p className="mb-4">
              Are you sure you want to delete this album? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteAlbumModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAlbum}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Photos</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center text-indigo-600 hover:text-indigo-500"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Photo
                  </button>
                  {selectedPhoto && (
                    <button
                      onClick={handleDeletePhoto}
                      className="flex items-center text-red-600 hover:text-red-500"
                    >
                      <Trash className="h-5 w-5 mr-1" />
                      Delete Photo
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden cursor-pointer ${
                      selectedPhoto?.id === photo.id
                        ? "ring-2 ring-red-500"
                        : ""
                    }`}
                    onClick={() => handlePhotoClick(photo)}
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

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        albumId={id}
        onPhotoUploaded={fetchPhotos}
      />
    </div>
  );
}
