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
        this.allPosts = blogs;
        this.featuredPosts = blogs.filter(blog => blog.isFeatured).slice(0, 3);
        this.filterPosts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.loading = false;
      }
    });
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