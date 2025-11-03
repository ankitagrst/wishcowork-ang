import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogsService, Blog } from '../../services/blogs.service';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blogs.component.html'
})
export class BlogsComponent implements OnInit {
  featuredPosts: Blog[] = [];
  allPosts: Blog[] = [];
  filteredPosts: Blog[] = [];
  loading = false;

  categories = ['All', 'Productivity', 'Industry Trends', 'Networking', 'Home Office', 'Business', 'General'];
  selectedCategory = 'All';

  constructor(private blogsService: BlogsService) {}

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs() {
    this.loading = true;
    this.blogsService.getBlogs(false).subscribe({
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