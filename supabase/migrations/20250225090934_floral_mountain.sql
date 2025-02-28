/*
  # Initial Schema Setup for Photo Album Application

  1. New Tables
    - `albums`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `cover_photo_url` (text, nullable)
      - `created_at` (timestamp with time zone)

    - `photos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `album_id` (uuid, references albums, nullable)
      - `url` (text)
      - `caption` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own albums and photos
      - Create new albums and photos
      - Update their own albums and photos
      - Delete their own albums and photos
*/

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  cover_photo_url text,
  created_at timestamptz DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  album_id uuid REFERENCES albums ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policies for albums
CREATE POLICY "Users can view their own albums"
  ON albums
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create albums"
  ON albums
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
  ON albums
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
  ON albums
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for photos
CREATE POLICY "Users can view their own photos"
  ON photos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create photos"
  ON photos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
  ON photos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON photos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user _id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);