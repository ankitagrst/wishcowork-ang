import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author: string;
  authorImage?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  views?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  displayOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    this.apiUrl = this.settingsService.getApiUrl();
  }

  /**
   * Get all blogs with optional filters
   */
  getBlogs(
    includeUnpublished: boolean = false,
    category?: string,
    featured?: boolean,
    limit?: number,
    offset?: number,
    search?: string
  ): Observable<Blog[]> {
    let params = new HttpParams();
    
    if (includeUnpublished) {
      params = params.set('includeUnpublished', 'true');
    }
    
    if (category) {
      params = params.set('category', category);
    }
    
    if (featured) {
      params = params.set('featured', 'true');
    }
    
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    
    if (offset) {
      params = params.set('offset', offset.toString());
    }
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<Blog[]>(`${this.apiUrl}/blogs`, { params });
  }

  /**
   * Get a single blog by ID or slug
   */
  getBlog(identifier: number | string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/blogs/${identifier}`);
  }

  /**
   * Create a new blog
   */
  createBlog(blog: Partial<Blog>): Observable<any> {
    return this.http.post(`${this.apiUrl}/blogs`, blog);
  }

  /**
   * Update an existing blog
   */
  updateBlog(identifier: number | string, blog: Partial<Blog>): Observable<any> {
    return this.http.put(`${this.apiUrl}/blogs/${identifier}`, blog);
  }

  /**
   * Delete a blog
   */
  deleteBlog(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/blogs/${id}`);
  }

  /**
   * Get featured blogs
   */
  getFeaturedBlogs(limit: number = 3): Observable<Blog[]> {
    return this.getBlogs(false, undefined, true, limit);
  }

  /**
   * Get blogs by category
   */
  getBlogsByCategory(category: string, limit?: number): Observable<Blog[]> {
    return this.getBlogs(false, category, undefined, limit);
  }

  /**
   * Search blogs
   */
  searchBlogs(query: string, limit?: number): Observable<Blog[]> {
    return this.getBlogs(false, undefined, undefined, limit, undefined, query);
  }
}
