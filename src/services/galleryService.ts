import { supabase } from '../lib/supabase';
import { GalleryAlbum, GalleryPhoto } from '../types';

export const galleryService = {
  /**
   * Get all albums from Supabase
   */
  async getAlbums(): Promise<GalleryAlbum[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('getAlbums error:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(a => ({
          id: String(a.id),
          title: a.title,
          description: a.description || '',
          cover_url: a.cover_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
          category: a.category || 'General',
          photos_count: a.photos_count || 0,
          created_at: a.created_at,
          images: a.images ? (typeof a.images === 'object' ? a.images : JSON.parse(a.images)) : []
        }));
      }
    } catch (e) {
      console.warn('getAlbums exception:', e);
    }
    return [];
  },

  /**
   * Get flat photo gallery
   */
  async getPhotos(): Promise<GalleryPhoto[]> {
    const albums = await this.getAlbums();
    const allPhotos: GalleryPhoto[] = [];
    albums.forEach(alb => {
      if (alb.images && alb.images.length > 0) {
        allPhotos.push(...alb.images);
      }
    });
    return allPhotos;
  },

  /**
   * Like a photo
   */
  async likePhoto(photoId: string): Promise<number> {
    return 1;
  }
};
