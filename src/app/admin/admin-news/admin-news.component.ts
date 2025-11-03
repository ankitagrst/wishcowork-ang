import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NewsService, News } from '../../services/news.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-news.component.html',
  styleUrls: ['./admin-news.component.css']
})
export class AdminNewsComponent implements OnInit {
  newsList: News[] = [];
  selectedNews: News | null = null;
  tagsString = ''; // For handling comma-separated tags in form
  showNewsModal = false;
  loading = false;
  error = '';
  success = '';

  categories = ['Company News', 'Industry News', 'General'];

  constructor(
    private newsService: NewsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading = true;
    this.newsService.getNews(true).subscribe({
      next: (news) => {
        this.newsList = news;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load news';
        this.loading = false;
        console.error('Error loading news:', err);
      }
    });
  }

  openNewsModal(news?: News) {
    if (news) {
      this.selectedNews = { ...news };
      // Convert tags array to comma-separated string
      this.tagsString = Array.isArray(this.selectedNews.tags) 
        ? this.selectedNews.tags.join(', ') 
        : '';
    } else {
      this.selectedNews = {
        id: 0,
        title: '',
        slug: '',
        summary: '',
        content: '',
        image: '',
        source: '',
        sourceUrl: '',
        category: 'General',
        tags: [],
        isFeatured: false,
        isPublished: true,
        displayOrder: 0
      };
      this.tagsString = '';
    }
    this.showNewsModal = true;
    this.error = '';
    this.success = '';
  }

  closeNewsModal() {
    this.showNewsModal = false;
    this.selectedNews = null;
    this.tagsString = '';
  }

  saveNews() {
    if (!this.selectedNews) return;

    // Validate required fields
    if (!this.selectedNews.title || !this.selectedNews.content) {
      this.error = 'Title and content are required';
      return;
    }

    this.loading = true;
    this.error = '';

    // Convert tags string to array
    this.selectedNews.tags = this.tagsString
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag);

    // Generate slug if not provided
    if (!this.selectedNews.slug) {
      this.selectedNews.slug = this.selectedNews.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const newsData = { ...this.selectedNews };

    if (this.selectedNews.id) {
      // Update existing news
      this.newsService.updateNews(this.selectedNews.id, newsData).subscribe({
        next: () => {
          this.success = 'News updated successfully!';
          this.loading = false;
          this.closeNewsModal();
          this.loadNews();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Failed to update news';
          this.loading = false;
          console.error('Error updating news:', err);
        }
      });
    } else {
      // Create new news
      this.newsService.createNews(newsData).subscribe({
        next: () => {
          this.success = 'News created successfully!';
          this.loading = false;
          this.closeNewsModal();
          this.loadNews();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Failed to create news';
          this.loading = false;
          console.error('Error creating news:', err);
        }
      });
    }
  }

  deleteNews(id: number) {
    if (!confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    this.loading = true;
    this.newsService.deleteNews(id).subscribe({
      next: () => {
        this.success = 'News deleted successfully!';
        this.loading = false;
        this.loadNews();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete news';
        this.loading = false;
        console.error('Error deleting news:', err);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
