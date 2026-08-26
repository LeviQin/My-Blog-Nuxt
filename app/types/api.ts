export interface ApiResponse<T> { code: number; data: T; message?: string }

export interface Article {
  id: number; title: string; article_description: string; image: string; category: string;
  article_tags: string[]; is_top: number | boolean; is_show: number | boolean;
  view_count: number; likes: number; published_at: string; updated_at: string; content_updated_at?: string; content?: string
}
export interface PaginatedArticles { items: Article[]; total: number; page: number; pageSize: number; totalPages: number }

export interface Tag { id?: number; name?: string; tag_name?: string; count?: number; article_count?: number }
export interface Category { id: number; name?: string; category_name?: string; slug: string; description?: string; color?: string; icon?: string; sort?: number; status?: number; article_count?: number }
export interface SiteSetting {
  blog_name?: string; blog_logo?: string; blog_description?: string;
  blog_record_name?: string; blog_record_number?: string;
  blog_hero_kicker?: string; blog_hero_title?: string; blog_hero_title_emphasis?: string;
  blog_hero_description?: string; blog_hero_description_extra?: string;
  blog_hero_primary_text?: string; blog_hero_secondary_text?: string;
  blog_about_title?: string; blog_about_job?: string; blog_profile_tags?: string | string[]; blog_about_bg_img?: string;
  blog_ability_title?: string; blog_ability_description?: string; blog_ability_bg_img?: string;
  blog_connect_title?: string; blog_connect_email?: string; blog_connect_github?: string;
  blog_connect_wx?: string; blog_connect_qq?: string; blog_connect_wx_image?: string; blog_connect_bg_img?: string;
  blog_work_title?: string; blog_work_bg_img?: string;
  show_category_module?: number | boolean | string;
  show_widget_module?: number | boolean | string;
  show_sites_module?: number | boolean | string;
  show_guestbook_module?: number | boolean | string;
  show_friend_link_module?: number | boolean | string;
  show_about_module?: number | boolean | string;
  [key: string]: unknown
}
export interface SiteNavItem { id?: number; title: string; description?: string; url: string; image?: string; type?: number | string }
export interface Link { id?: number; name: string; image?: string; url: string; description?: string; sort?: number }
export interface Comment { id: number; article_id?: number; parent_id?: number | null; city?: string; user_nickname: string; user_avatar_url?: string; content: string; created_at?: string; is_admin?: number | boolean; children?: Comment[] }
export interface Message extends Comment {
  email?: string; replied?: number | boolean; operating_system?: string; browser?: string;
}
export interface PaginatedMessages { items: Message[]; total: number; page: number; pageSize: number; totalPages: number }
export interface BlogProject { id: number; name: string; link?: string; isApp?: boolean; category: string; description?: string; desc?: string; tags: string[]; isFeatured?: boolean; projectStatus?: string; project_status?: string; sort?: number; updated_at?: string }
