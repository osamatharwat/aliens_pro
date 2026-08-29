import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Heart, ExternalLink, Filter, X } from 'lucide-react';
import { GalleryAlbum, GalleryPhoto } from '../../types';
import { ApiService } from '../../services/api';

export const GalleryView: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    ApiService.getGalleryAlbums().then(setAlbums);
    ApiService.getGalleryPhotos().then(setPhotos);
  }, []);

  const filteredPhotos = selectedAlbumId === 'all'
    ? photos
    : photos.filter(p => p.album_id === selectedAlbumId);

  const handleLike = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        return { ...p, likes_count: p.likes_count + 1 };
      }
      return p;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-100">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>المعرض البصري والأرشيف</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          معرض صور مؤتمرات وفعاليات Aliens
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          عدسة فريق Media &amp; Video توثق لحظات الشغف، ورش العمل، والتكريمات الأكاديمية.
        </p>
      </div>

      {/* Album Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setSelectedAlbumId('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedAlbumId === 'all'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300'
          }`}
        >
          كافة الصور ({photos.length})
        </button>

        {albums.map((alb) => (
          <button
            key={alb.id}
            onClick={() => setSelectedAlbumId(alb.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedAlbumId === alb.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300'
            }`}
          >
            {alb.title}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setActivePhoto(photo)}
            className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer aspect-video"
          >
            <img
              src={photo.photo_url}
              alt={photo.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
              <div className="flex justify-end">
                <button
                  onClick={(e) => handleLike(photo.id, e)}
                  className="p-2 rounded-full bg-slate-900/80 backdrop-blur-md text-pink-400 hover:text-pink-300 hover:scale-110 transition-all flex items-center gap-1 text-xs"
                >
                  <Heart className="w-4 h-4 fill-pink-500/30" />
                  <span>{photo.likes_count}</span>
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-100">{photo.caption}</p>
                <span className="text-[10px] text-slate-400">بواسطة: {photo.photographer_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
          >
            <div className="relative aspect-video">
              <img src={activePhoto.photo_url} alt={activePhoto.caption} className="w-full h-full object-contain bg-black" />
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex items-center justify-between bg-slate-950 border-t border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-100">{activePhoto.caption}</h3>
                <p className="text-xs text-slate-400">تصوير: {activePhoto.photographer_name}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleLike(activePhoto.id, e)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-pink-400 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800"
                >
                  <Heart className="w-4 h-4 fill-pink-500/30" />
                  <span>{activePhoto.likes_count} إعجاب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
