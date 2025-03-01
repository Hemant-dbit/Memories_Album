import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Album } from "../types";
import PhotoSlideshow from "../components/PhotoSlideshow";
import PhotoUploadModal from "../components/PhotoUploadModal";
import { toast } from "react-hot-toast";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);

  useEffect(() => {
    fetchAlbums();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchAlbums();
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: albumsData, error } = await supabase
        .from("albums")
        .select("*, photos(url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlbums(
        albumsData.map((album) => ({
          ...album,
          cover_photo_url: album.photos?.[0]?.url || null,
        }))
      );
    } catch (error) {
      console.error("Error fetching albums:", error);
      toast.error("Failed to load albums");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to create an album");
        return;
      }
      const { error } = await supabase.from("albums").insert({
        user_id: user.id,
        name: newAlbumName,
      });
      if (error) throw error;
      toast.success("Album created successfully");
      setNewAlbumName("");
      setIsCreateAlbumModalOpen(false);
      fetchAlbums();
    } catch (error) {
      console.error("Error creating album:", error);
      toast.error("Failed to create album");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Photo Album</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-2" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search photos by date or caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent Photos</h2>
        <PhotoSlideshow />

        <div className="flex justify-between items-center my-6">
          <h2 className="text-xl font-semibold">Albums</h2>
          <button
            onClick={() => setIsCreateAlbumModalOpen(true)}
            className="flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="h-5 w-5 mr-1" /> Create Album
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading albums...</div>
        ) : albums.length === 0 ? (
          <div className="text-center text-gray-500">No albums found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-200 rounded-t-lg">
                  {album.cover_photo_url ? (
                    <img
                      src={album.cover_photo_url}
                      alt={album.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Photos Yet
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {album.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPhotoUploaded={fetchAlbums}
      />

      {isCreateAlbumModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Album</h2>
            <input
              type="text"
              placeholder="Enter album name"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsCreateAlbumModalOpen(false)}
                className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlbum}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
