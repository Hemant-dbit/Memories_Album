export interface Photo {
  id: string;
  user_id: string;
  url: string;
  caption: string;
  album_id: string | null;
  created_at: string;
}

export interface Album {
  formatted_date: any;
  captions: any;
  id: string;
  user_id: string;
  name: string;
  cover_photo_url: string | null;
  created_at: string;
}
