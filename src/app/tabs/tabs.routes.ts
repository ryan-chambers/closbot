import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { photoResolver } from '@resolvers/photo.resolver';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'chat',
        loadComponent: () => import('./chat/chat.component').then((m) => m.ChatComponent),
      },
      {
        path: 'add-review',
        loadComponent: () =>
          import('./add-review/add-review.component').then((m) => m.AddReviewComponent),
      },
      {
        path: 'gallery',
        loadComponent: () => import('./gallery/gallery.component').then((m) => m.GalleryComponent),
      },
      {
        path: 'edit-review/:id',
        loadComponent: () =>
          import('./edit-photo/edit-review.component').then((m) => m.EditReviewComponent),
        resolve: {
          photo: photoResolver,
        },
      },
      {
        path: 'vintage',
        loadComponent: () =>
          import('./vintage-report/vintage-report.component').then((m) => m.VintageReportComponent),
      },
      {
        path: '',
        redirectTo: '/tabs/chat',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/chat',
    pathMatch: 'full',
  },
];
