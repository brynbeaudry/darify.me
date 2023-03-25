import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DareComponent } from './dare/dare.component';
import { ShareComponent } from './share/share.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  /* {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  }, */
  {
    path: '/',
    component: HomeComponent
  }
  {
    path: 'dare/:id',
    component: DareComponent
  },
  {
    path: 'dare/:id',
    component: DareComponent
  },
  {
    path: 'share/:id',
    component: ShareComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
