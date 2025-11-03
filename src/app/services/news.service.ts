import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsService } from './settings.service';

export interface News {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  image?: string;
  source?: string;
  sourceUrl?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  displayOrder?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    this.apiUrl = this.settingsService.getApiUrl();
  }

  /**
   * Get all news with optional filters
   */
  getNews(
    includeUnpublished: boolean = false,
    category?: string,
    featured?: boolean,
    limit?: number,
    offset?: number,
    search?: string
  ): Observable<News[]> {
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

    return this.http.get<News[]>(`${this.apiUrl}/news`, { params });
  }

  /**
   * Get a single news item by ID or slug
   */
  getNewsItem(identifier: number | string): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/news/${identifier}`);
  }

  /**
   * Create a new news item
   */
  createNews(news: Partial<News>): Observable<any> {
    return this.http.post(`${this.apiUrl}/news`, news);
  }

  /**
   * Update an existing news item
   */
  updateNews(identifier: number | string, news: Partial<News>): Observable<any> {
    return this.http.put(`${this.apiUrl}/news/${identifier}`, news);
  }

  /**
   * Delete a news item
   */
  deleteNews(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/news/${id}`);
  }

  /**
   * Get featured news
   */
  getFeaturedNews(limit: number = 3): Observable<News[]> {
    return this.getNews(false, undefined, true, limit);
  }

  /**
   * Get news by category
   */
  getNewsByCategory(category: string, limit?: number): Observable<News[]> {
    return this.getNews(false, category, undefined, limit);
  }

  /**
   * Search news
   */
  searchNews(query: string, limit?: number): Observable<News[]> {
    return this.getNews(false, undefined, undefined, limit, undefined, query);
  }
}
