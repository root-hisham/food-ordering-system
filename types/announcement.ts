export interface Announcement {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}
