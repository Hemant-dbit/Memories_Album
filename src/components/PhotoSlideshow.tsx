import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "../types";
import { supabase } from "../lib/supabase";

export default function PhotoSlideshow() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPhotos = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData?.user) return;

        const { data, error } = await supabase
          .from("photos")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        setPhotos(data || []);
      } catch (err: any) {
        console.error("Error fetching photos:", err.message);
        setError("Failed to load photos. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPhotos();
  }, []);

  const nextPhoto = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Loading photos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No recent photos</p>
      </div>
    );
  }

  return (
    <div className="relative h-64 bg-black rounded-lg overflow-hidden">
      <img
        src={photos[currentIndex].url}
        alt={photos[currentIndex].caption || "Photo"}
        className="w-full h-full object-contain"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <p className="text-white">{photos[currentIndex].caption}</p>
      </div>
      <button
        onClick={prevPhoto}
        disabled={photos.length <= 1}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-50"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextPhoto}
        disabled={photos.length <= 1}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-50"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
