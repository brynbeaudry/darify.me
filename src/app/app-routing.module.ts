import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DareComponent } from './dare/dare.component';
import { ShareComponent } from './share/share.component';
import { HomeComponent } from './home/home.component';
import { ShareCreateComponent } from './share-create/share-create.component';

const routes: Routes = [
  /* {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  }, */
  {
    path: '/',
    component: HomeComponent
  },
  {
    path: 'dare/:id', // Known Dares, Includes random
    component: DareComponent
  },
  {
    path: 'dare/random', // Known Dares, Includes random
    redirectTo: 'dare/---random-known-uuid----',
    pathMatch: 'full'
  },
  {
    path: 'dare/list', // Known Dares, Includes random
    redirectTo: 'dare/---random-known-uuid----',
    pathMatch: 'full'
  },
  {
    path: 'share/dare/:id',
    component: ShareComponent
  },
  {
    path: 'share/create',
    component: ShareCreateComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
