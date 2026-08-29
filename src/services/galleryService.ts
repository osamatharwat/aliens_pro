import { supabase } from '../lib/supabase';
import { GalleryAlbum, GalleryPhoto } from '../types';

export const DEFAULT_ALBUMS: GalleryAlbum[] = [
  {
    id: 'alb_1',
    title: 'المؤتمر الصيدلي السنوي 2026',
    description: 'تغطية فوتوغرافية شاملة لجلسات وورش عمل المؤتمر السنوي بحضور أكثر من 1500 صيدلي وطالب.',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    category: 'Conferences',
    photos_count: 24,
    created_at: '2026-08-15T10:00:00Z',
    images: [
      { id: 'p_1', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'الجلسة الافتتاحية للمؤتمر', likes: 45 },
      { id: 'p_2', image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80', caption: 'تكريم المتحدثين والضيوف', likes: 38 }
    ]
  },
  {
    id: 'alb_2',
    title: 'القافلة الطبية الخيرية — الفيوم',
    description: 'توثيق مشاركة فريق الكيان في تقديم الخدمات الطبية والفحوصات المجانية لأكثر من 500 مستفيد.',
    cover_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    category: 'Charity',
    photos_count: 18,
    created_at: '2026-07-28T09:00:00Z',
    images: [
      { id: 'p_3', image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80', caption: 'توزيع الأدوية المجانية', likes: 52 }
    ]
  }
];

export const galleryService = {
  /**
   * Get all albums
   */
  async getAlbums(): Promise<GalleryAlbum[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
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
    return DEFAULT_ALBUMS;
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
