import { Component, OnInit } from '@angular/core';  

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService, News } from '../../services/news.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news.component.html'
})
export class NewsComponent implements OnInit {
  newsList: News[] = [];
  filteredNews: News[] = [];
  featuredNews: News | null = null;
  loading = false;

  categories = [
    { value: 'all', label: 'All News' },
    { value: 'Company News', label: 'Company News' },
    { value: 'Industry News', label: 'Industry News' },
    { value: 'General', label: 'General' }
  ];

  selectedCategory = 'all';

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.newsService.getNews(false).subscribe({
      next: (news) => {
        if (news && news.length > 0) {
          this.newsList = news;
          this.featuredNews = news.find(n => n.isFeatured) || null;
        } else {
          // Fallback to mock data if API returns empty
          this.loadMockNews();
        }
        this.filterNews();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading news:', err);
        // Load mock data as fallback
        this.loadMockNews();
        this.filterNews();
        this.loading = false;
      }
    });
  }

  private loadMockNews() {
    // Fallback mock data when API is unavailable
    this.newsList = [
      {
        id: 1,
        title: 'Welcome to WishCowork News',
        slug: 'welcome-to-wishcowork-news',
        summary: 'Stay updated with the latest coworking trends and insights.',
        content: 'This is a sample news article. The API will be available soon.',
        category: 'Company News',
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        views: 0,
        tags: ['update', 'welcome']
      }
    ];
    this.featuredNews = this.newsList[0];
  }

  selectCategory(categoryValue: string) {
    this.selectedCategory = categoryValue;
    this.filterNews();
  }

  filterNews() {
    if (this.selectedCategory === 'all') {
      this.filteredNews = this.newsList;
    } else {
      this.filteredNews = this.newsList.filter(news => news.category === this.selectedCategory);
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
