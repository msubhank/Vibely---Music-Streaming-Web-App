-- ============================================================
-- Vibely – Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    text UNIQUE NOT NULL,
  display_name text,
  avatar_url  text,
  bio         text,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Playlists
CREATE TABLE IF NOT EXISTS public.playlists (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name        text NOT NULL,
  description text,
  cover_url   text,
  is_public   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playlists viewable by all"
  ON public.playlists FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlists"
  ON public.playlists FOR ALL USING (auth.uid() = user_id);

-- 4. Playlist Tracks (Audius track metadata stored here)
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id      uuid REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  audius_track_id  text NOT NULL,
  track_title      text,
  artist_name      text,
  artwork_url      text,
  duration         int,
  position         int DEFAULT 0,
  added_at         timestamptz DEFAULT now() NOT NULL,
  UNIQUE(playlist_id, audius_track_id)
);

ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Playlist tracks inherit playlist visibility"
  ON public.playlist_tracks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE id = playlist_id AND (is_public = true OR auth.uid() = user_id)
  ));

CREATE POLICY "Playlist owners can manage tracks"
  ON public.playlist_tracks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.playlists
    WHERE id = playlist_id AND auth.uid() = user_id
  ));

-- 5. Liked Tracks
CREATE TABLE IF NOT EXISTS public.liked_tracks (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  audius_track_id  text NOT NULL,
  track_title      text,
  artist_name      text,
  artwork_url      text,
  duration         int,
  liked_at         timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, audius_track_id)
);

ALTER TABLE public.liked_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their liked tracks"
  ON public.liked_tracks FOR ALL USING (auth.uid() = user_id);

-- 6. Recently Played
CREATE TABLE IF NOT EXISTS public.recently_played (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  audius_track_id  text NOT NULL,
  track_title      text,
  artist_name      text,
  artwork_url      text,
  played_at        timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own history"
  ON public.recently_played FOR ALL USING (auth.uid() = user_id);

-- Index for fast history queries
CREATE INDEX IF NOT EXISTS idx_recently_played_user
  ON public.recently_played(user_id, played_at DESC);

-- Index for fast liked tracks queries
CREATE INDEX IF NOT EXISTS idx_liked_tracks_user
  ON public.liked_tracks(user_id, liked_at DESC);
