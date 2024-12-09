import { Routes } from '@angular/router';
import { SignInComponent } from './features/auth/sign-in/sign-in.component';
import { SignUpComponent } from './features/auth/sign-up/sign-up.component';
import { ProductListComponent } from './features/product/product-list/product-list.component';
import { ProductDetailComponent } from './features/product/product-detail/product-detail.component';
import { NotFoundComponent } from './features/error/not-found/not-found.component';
import { ErrorComponent } from './features/error/error/error.component';
import { AuthGuard, SellerGuard } from './core/services/auth/auth-guard.guard';
import { HomeComponent } from './features/home/home/home.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MediaManagementComponent } from './features/media-management/media-management.component';

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
      canActivate: [AuthGuard, SellerGuard]
    },
    {
      path: 'products/:productId', 
      component: ProductDetailComponent,
      canActivate: [AuthGuard]
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
