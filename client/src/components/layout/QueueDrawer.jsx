import { X, Play, Trash2, Music2, ListMusic } from 'lucide-react';
import usePlayerStore from '../../store/playerStore';
import { formatDuration, getArtwork } from '../../services/audiusService';

const QueueDrawer = () => {
  const {
    showQueue,
    toggleQueue,
    queue,
    queueIndex,
    currentTrack,
    playAtIndex,
    isPlaying,
  } = usePlayerStore();

  if (!showQueue) return null;

  const current = queue[queueIndex] || currentTrack;
  const upcomingTracks = queue.slice(queueIndex + 1);

  const handleClearQueue = () => {
    // Keep only the currently playing track
    if (current) {
      usePlayerStore.setState({ queue: [current], queueIndex: 0 });
    } else {
      usePlayerStore.setState({ queue: [], queueIndex: 0 });
    }
  };

  const handleRemoveTrack = (e, indexToRemove) => {
    e.stopPropagation();
    const newQueue = [...queue];
    newQueue.splice(indexToRemove, 1);
    
    let newIndex = queueIndex;
    if (indexToRemove < queueIndex) {
      newIndex = Math.max(0, queueIndex - 1);
    }
    usePlayerStore.setState({ queue: newQueue, queueIndex: newIndex });
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={toggleQueue}
    >
      <div
        className="w-full max-w-md h-full bg-surface border-l border-border p-6 flex flex-col shadow-2xl animate-slide-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ListMusic size={22} className="text-primary" />
            <h2 className="text-lg font-bold text-white">Play Queue</h2>
            <span className="text-xs bg-elevated text-muted px-2 py-0.5 rounded-full">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 1 && (
              <button
                onClick={handleClearQueue}
                className="text-xs text-muted hover:text-red-400 px-2 py-1 rounded transition-colors"
              >
                Clear Upcoming
              </button>
            )}
            <button
              onClick={toggleQueue}
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-elevated transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 no-scrollbar">
          {/* Now Playing */}
          {current && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">
                Now Playing
              </p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-elevated/70 border border-primary/20">
                <img
                  src={getArtwork(current, '150x150')}
                  alt={current.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-primary truncate">
                      {current.title}
                    </p>
                    {isPlaying && (
                      <span className="flex gap-0.5 items-end h-3 shrink-0">
                        <span className="w-0.5 bg-primary animate-eq-1 rounded-full" />
                        <span className="w-0.5 bg-primary animate-eq-2 rounded-full" />
                        <span className="w-0.5 bg-primary animate-eq-3 rounded-full" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate">
                    {current.user?.name || current.artist_name}
                  </p>
                </div>
                <span className="text-xs text-muted tabular-nums">
                  {formatDuration(current.duration)}
                </span>
              </div>
            </div>
          )}

          {/* Next In Queue */}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">
              Next Up ({upcomingTracks.length})
            </p>

            {upcomingTracks.length === 0 ? (
              <div className="py-8 text-center bg-elevated/30 rounded-xl border border-dashed border-border/60">
                <Music2 size={28} className="text-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-muted">No upcoming tracks in queue</p>
                <p className="text-[11px] text-muted-fg mt-0.5">
                  Play an album, playlist, or trending list to queue songs
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {upcomingTracks.map((track, i) => {
                  const actualIndex = queueIndex + 1 + i;
                  return (
                    <div
                      key={`${track.id}-${actualIndex}`}
                      onClick={() => playAtIndex(actualIndex)}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-elevated/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getArtwork(track, '150x150')}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                            {track.title}
                          </p>
                          <p className="text-xs text-muted truncate">
                            {track.user?.name || track.artist_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted tabular-nums group-hover:hidden">
                          {formatDuration(track.duration)}
                        </span>
                        <button
                          onClick={(e) => handleRemoveTrack(e, actualIndex)}
                          title="Remove from queue"
                          className="hidden group-hover:flex p-1.5 text-muted hover:text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueDrawer;

