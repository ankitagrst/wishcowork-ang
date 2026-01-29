import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlogsService, Blog } from '../../services/blogs.service';
import { SeoService } from '../../services/seo.service';
import { SettingsService } from '../../services/settings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  blog: Blog | null = null;
  relatedBlogs: Blog[] = [];
  loading = true;
  notFound = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private blogsService: BlogsService,
    private seoService: SeoService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const slug = params['slug'];
        if (slug) {
          this.loadBlog(slug);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBlog(slug: string) {
    this.loading = true;
    this.blogsService.getBlog(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blog) => {
          if (blog) {
            this.blog = blog;
            this.updateSeoTags();
            this.loadRelatedBlogs();
            this.loading = false;
          } else {
            this.notFound = true;
            this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error loading blog:', err);
          this.notFound = true;
          this.loading = false;
        }
      });
  }

  private updateSeoTags() {
    if (this.blog) {
      this.seoService.updateMetaTags({
        title: `${this.blog.title} | ${this.settingsService.getAppName()}`,
        description: this.blog.excerpt || this.blog.metaDescription || '',
        keywords: this.blog.metaKeywords || (this.blog.tags?.join(', ') || '')
      });
    }
  }

  loadRelatedBlogs() {
    if (this.blog?.category) {
      this.blogsService.getBlogs(false, this.blog.category)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blogs) => {
            this.relatedBlogs = blogs.filter(b => b.id !== this.blog?.id).slice(0, 3);
          },
          error: (err) => {
            console.error('Error loading related blogs:', err);
          }
        });
    }
  }

  goBack() {
    this.router.navigate(['/blogs']);
  }
}
