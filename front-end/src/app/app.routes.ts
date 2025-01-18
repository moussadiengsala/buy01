import { Routes } from '@angular/router';
import { SignInComponent } from './pages/auth/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { ProductListComponent } from './pages/product/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product/product-detail/product-detail.component';
import { NotFoundComponent } from './pages/error/not-found/not-found.component';
import { ErrorComponent } from './pages/error/error/error.component';
import { AuthGuard, SellerGuard } from './services/auth/auth-guard.guard';
import { HomeComponent } from './pages/home/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MediaManagementComponent } from './pages/media-management/media-management.component';

export const routes: Routes = [
    {
      path: '',
      component: HomeComponent
    },
    { 
      path: 'dashboard', 
      component: DashboardComponent,
      canActivate: [AuthGuard] 
    },
    { 
      path: 'media-management', 
      component: MediaManagementComponent,
      canActivate: [AuthGuard] 
    },
    {
      path: 'auth/sign-in', 
      component: SignInComponent
    },
    {
      path: 'auth/sign-up', 
      component: SignUpComponent
    },
    {
      path: 'products', 
      component: ProductListComponent,
    },
    {
      path: 'products/:productId',
      component: ProductDetailComponent,
      canActivate: []
    },
    {
      path: 'error', 
      component: ErrorComponent
    },
    {
      path: '**',
      component: NotFoundComponent
    }
];
