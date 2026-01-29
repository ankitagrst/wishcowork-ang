import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogsService, Blog } from '../../services/blogs.service';
import { AuthService } from '../../services/auth.service';
import { LocomotiveScrollService } from '../../services/locomotive-scroll.service';
import { ImageUploadComponent } from '../../components/image-upload/image-upload.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-admin-blogs',
    imports: [CommonModule, FormsModule, ImageUploadComponent],
    templateUrl: './admin-blogs.component.html',
})
export class AdminBlogsComponent implements OnInit, OnDestroy {
  blogs: Blog[] = [];
  selectedBlog: Blog | null = null;
  tagsString = ''; // For handling comma-separated tags in form
  showBlogModal = false;
  loading = false;
  error = '';
  success = '';
  private destroy$ = new Subject<void>();

  categories = ['Productivity', 'Industry Trends', 'Networking', 'Home Office', 'Business', 'General'];

  constructor(
    private blogsService: BlogsService,
    private router: Router,
    private authService: AuthService,
    private locomotiveScrollService: LocomotiveScrollService
  ) {}

  ngOnInit() {
    this.loadBlogs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public currentScrollY = 0;
  private scrollY = 0;

  private toggleBodyScroll(lock: boolean): void {
    if (typeof document === 'undefined') return;
    
    if (lock) {
      this.currentScrollY = this.locomotiveScrollService.getScrollY();
      this.scrollY = window.scrollY || window.pageYOffset;
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
      this.locomotiveScrollService.stop();
    } else {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      window.scrollTo(0, this.scrollY);
      this.locomotiveScrollService.start();
    }
  }

  loadBlogs() {
    this.loading = true;
    this.blogsService.getBlogs(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.toggleBodyScroll(true);
    this.error = '';
    this.success = '';
  }

  closeBlogModal() {
    this.showBlogModal = false;
    this.selectedBlog = null;
    this.tagsString = '';
    this.toggleBodyScroll(false);
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
      this.blogsService.updateBlog(this.selectedBlog.id, blogData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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
      this.blogsService.createBlog(blogData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
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
    this.blogsService.deleteBlog(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
