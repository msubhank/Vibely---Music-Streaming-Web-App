import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Users, CheckCircle, Music, Loader2 } from 'lucide-react';
import { getArtist, getArtistTracks, getArtwork } from '../services/audiusService';
import TrackCard from '../components/music/TrackCard';
import usePlayerStore from '../store/playerStore';

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [artistData, trackList] = await Promise.all([
          getArtist(id),
          getArtistTracks(id, 50),
        ]);
        setArtist(artistData);
        setTracks(trackList || []);
      } catch (err) {
        console.error('Failed to load artist:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Music size={48} className="text-muted mb-4" />
        <h2 className="text-xl font-bold text-white">Artist not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary mt-4 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const profilePic =
    artist.profile_picture?.['480x480'] ||
    artist.profile_picture?.['150x150'] ||
    '/placeholder-art.png';

  const coverBanner = artist.cover_photo?.['2000x'] || artist.cover_photo?.['640x'];

  const isArtistPlaying =
    tracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks);
  };

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in no-scrollbar">
      {/* Banner */}
      <div className="relative w-full h-56 sm:h-72 bg-gradient-to-b from-primary/30 to-surface overflow-hidden">
        {coverBanner && (
          <img
            src={coverBanner}
            alt={artist.name}
            className="w-full h-full object-cover opacity-50 blur-[2px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-sm text-white hover:bg-black transition-colors backdrop-blur-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Artist Header Info */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
          <img
            src={profilePic}
            alt={artist.name}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-bg shadow-2xl shrink-0"
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Artist
              </span>
              {artist.is_verified && (
                <CheckCircle size={14} className="text-primary fill-primary text-bg" />
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white truncate">
              {artist.name}
            </h1>

            <div className="flex items-center gap-4 mt-1 text-xs text-muted">
              <span>@{artist.handle}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {(artist.follower_count || 0).toLocaleString()} followers
              </span>
              <span>•</span>
              <span>{artist.track_count || tracks.length} tracks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Controls & Bio */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-all disabled:opacity-40"
          >
            {isArtistPlaying ? (
              <>
                <Pause size={18} fill="currentColor" /> Pause Discography
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" /> Play Discography
              </>
            )}
          </button>

          {artist.bio && (
            <p className="text-xs text-muted max-w-lg line-clamp-3 leading-relaxed">
              {artist.bio}
            </p>
          )}
        </div>

        {/* Tracks List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Popular Releases</h2>

          {tracks.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">No tracks available for this artist</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} queue={tracks} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail;

