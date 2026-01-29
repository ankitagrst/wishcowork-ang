import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BlogsService, Blog } from '../../services/blogs.service';
import { SeoService } from '../../services/seo.service';
import { SettingsService } from '../../services/settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-blogs',
    imports: [CommonModule, RouterModule],
    templateUrl: './blogs.component.html'
})
export class BlogsComponent implements OnInit, OnDestroy {
  featuredPosts: Blog[] = [];
  allPosts: Blog[] = [];
  filteredPosts: Blog[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  categories = ['All', 'Productivity', 'Industry Trends', 'Networking', 'Home Office', 'Business', 'General'];
  selectedCategory = 'All';

  constructor(
    private blogsService: BlogsService,
    private seoService: SeoService,
    private settingsService: SettingsService,
    public router: Router
  ) {}

  ngOnInit() {
    const appName = this.settingsService.getAppName();
    this.seoService.updateMetaTags({
      title: `Blog - Insights & Trends in Coworking | ${appName}`,
      description: `Discover insights about coworking, productivity, and workspace trends. Stay updated with the latest from the WishCowork community.`,
      keywords: 'coworking blog, workspace trends, productivity tips, business insights'
    });
    this.loadBlogs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlogs() {
    this.loading = true;
    this.blogsService.getBlogs(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blogs) => {
          if (blogs && blogs.length > 0) {
            this.allPosts = blogs;
            this.featuredPosts = blogs.filter(blog => blog.isFeatured).slice(0, 3);
          } else {
            // Fallback to mock data if API returns empty
            this.loadMockBlogs();
          }
          this.filterPosts();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading blogs:', err);
          // Load mock data as fallback
          this.loadMockBlogs();
          this.filterPosts();
          this.loading = false;
        }
      });
  }

  private loadMockBlogs() {
    // Fallback mock data when API is unavailable
    this.allPosts = [
      {
        id: 1,
        title: 'Welcome to WishCowork Blog',
        slug: 'welcome-to-wishcowork-blog',
        excerpt: 'Discover insights about coworking, productivity, and workspace trends.',
        content: 'This is a sample blog post. The API will be available soon.',
        author: 'WishCowork Team',
        category: 'General',
        readTime: 5,
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date().toISOString(),
        views: 0,
        tags: ['welcome', 'coworking']
      }
    ];
    this.featuredPosts = this.allPosts.filter(blog => blog.isFeatured).slice(0, 3);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterPosts();
  }

  filterPosts() {
    if (this.selectedCategory === 'All') {
      this.filteredPosts = this.allPosts;
    } else {
      this.filteredPosts = this.allPosts.filter(blog => blog.category === this.selectedCategory);
    }
  }
}