import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogsService, Blog } from '../../services/blogs.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-blogs.component.html',
  styleUrls: ['./admin-blogs.component.css']
})
export class AdminBlogsComponent implements OnInit {
  blogs: Blog[] = [];
  selectedBlog: Blog | null = null;
  tagsString = ''; // For handling comma-separated tags in form
  showBlogModal = false;
  loading = false;
  error = '';
  success = '';

  categories = ['Productivity', 'Industry Trends', 'Networking', 'Home Office', 'Business', 'General'];

  constructor(
    private blogsService: BlogsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs() {
    this.loading = true;
    this.blogsService.getBlogs(true).subscribe({
      next: (blogs) => {
        this.blogs = blogs;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blogs';
        this.loading = false;
        console.error('Error loading blogs:', err);
      }
    });
  }

  openBlogModal(blog?: Blog) {
    if (blog) {
      this.selectedBlog = { ...blog };
      // Convert tags array to comma-separated string
      this.tagsString = Array.isArray(this.selectedBlog.tags) 
        ? this.selectedBlog.tags.join(', ') 
        : '';
    } else {
      this.selectedBlog = {
        id: 0,
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        author: '',
        authorImage: '',
        category: 'General',
        tags: [],
        readTime: 5,
        isFeatured: false,
        isPublished: true,
        displayOrder: 0,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: ''
      };
      this.tagsString = '';
    }
    this.showBlogModal = true;
    this.error = '';
    this.success = '';
  }

  closeBlogModal() {
    this.showBlogModal = false;
    this.selectedBlog = null;
    this.tagsString = '';
  }

  saveBlog() {
    if (!this.selectedBlog) return;

    // Validate required fields
    if (!this.selectedBlog.title || !this.selectedBlog.content || !this.selectedBlog.author) {
      this.error = 'Title, content, and author are required';
      return;
    }

    this.loading = true;
    this.error = '';

    // Convert tags string to array
    this.selectedBlog.tags = this.tagsString
      .split(',')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag);

    // Generate slug if not provided
    if (!this.selectedBlog.slug) {
      this.selectedBlog.slug = this.selectedBlog.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const blogData = { ...this.selectedBlog };

    if (this.selectedBlog.id) {
      // Update existing blog
      this.blogsService.updateBlog(this.selectedBlog.id, blogData).subscribe({
        next: () => {
          this.success = 'Blog updated successfully!';
          this.loading = false;
          this.closeBlogModal();
          this.loadBlogs();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Failed to update blog';
          this.loading = false;
          console.error('Error updating blog:', err);
        }
      });
    } else {
      // Create new blog
      this.blogsService.createBlog(blogData).subscribe({
        next: () => {
          this.success = 'Blog created successfully!';
          this.loading = false;
          this.closeBlogModal();
          this.loadBlogs();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Failed to create blog';
          this.loading = false;
          console.error('Error creating blog:', err);
        }
      });
    }
  }

  deleteBlog(id: number) {
    if (!confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    this.loading = true;
    this.blogsService.deleteBlog(id).subscribe({
      next: () => {
        this.success = 'Blog deleted successfully!';
        this.loading = false;
        this.loadBlogs();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = 'Failed to delete blog';
        this.loading = false;
        console.error('Error deleting blog:', err);
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
