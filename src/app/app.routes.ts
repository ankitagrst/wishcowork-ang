import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CategoryComponent } from './pages/category/category.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { PlansComponent } from './pages/plans/plans.component';
import { AboutComponent } from './pages/about/about.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { EventsComponent } from './pages/events/events.component';
import { NewsComponent } from './pages/news/news.component';
import { ContactComponent } from './pages/contact/contact.component';
import { BusinessServicesComponent } from './pages/business-services/business-services.component';
import { BlogsComponent } from './pages/blogs/blogs.component';
import { FaqComponent } from './pages/faq/faq.component';
import { CareersComponent } from './pages/careers/careers.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';
import { CookiePolicyComponent } from './pages/cookie-policy/cookie-policy.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminPropertiesComponent } from './admin/admin-properties/admin-properties.component';
import { AdminSettingsComponent } from './admin/admin-settings/admin-settings.component';
import { AdminPricingComponent } from './admin/admin-pricing/admin-pricing.component';
import { AdminEventsComponent } from './admin/admin-events/admin-events.component';
import { AdminBlogsComponent } from './admin/admin-blogs/admin-blogs.component';
import { AdminNewsComponent } from './admin/admin-news/admin-news.component';
import { PropertyFormComponent } from './admin/property-form/property-form.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'plans',
    component: PlansComponent
  },
  {
    path: 'pricing',
    redirectTo: 'plans',
    pathMatch: 'full'
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'gallery',
    component: GalleryComponent
  },
  {
    path: 'events',
    component: EventsComponent
  },
  {
    path: 'news',
    component: NewsComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'business-services',
    component: BusinessServicesComponent
  },
  {
    path: 'blogs',
    component: BlogsComponent
  },
  {
    path: 'faq',
    component: FaqComponent
  },
  {
    path: 'careers',
    component: CareersComponent
  },
  {
    path: 'pricing',
    component: PricingComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'terms-of-service',
    component: TermsOfServiceComponent
  },
  {
    path: 'cookie-policy',
    component: CookiePolicyComponent
  },
  // Admin Routes
  {
    path: 'admin/login',
    component: AdminLoginComponent
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/properties',
    component: AdminPropertiesComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/settings',
    component: AdminSettingsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/pricing',
    component: AdminPricingComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/events',
    component: AdminEventsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/blogs',
    component: AdminBlogsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/news',
    component: AdminNewsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/properties/new',
    component: PropertyFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/properties/edit/:id',
    component: PropertyFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'category/:categoryName',
    component: CategoryComponent
  },
  {
    path: 'category/:categoryName/:cityName',
    component: CategoryComponent
  },
  {
    path: 'city/:cityName',
    component: CategoryComponent
  },
  {
    path: 'properties',
    component: CategoryComponent
  },
  // SEO-Friendly Property Detail Route (must be after other static routes)
  // Example: /delhi/virtual-office/premium-virtual-office-connaught-place
  {
    path: ':city/:category/:slug',
    component: PropertyDetailComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
