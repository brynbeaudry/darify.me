import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DareComponent } from './dare/dare.component';
import { DareListComponent } from './dare-list/dare-list.component';
import { ShareComponent } from './share/share.component';
import { ShareCreateComponent } from './share-create/share-create.component';


const routes: Routes = [
  /* {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  }, */
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'dare/list', // Known Dares, Includes random
    component: DareListComponent,
  },
  {
    path: 'dare/random', // Known Dares, Includes random
    component: DareComponent
  },
  {
    path: 'dare/:key', // Known Dares, Includes random
    component: DareComponent
  },
  {
    path: 'share/dare/:uuid',
    component: ShareComponent
  },
  {
    path: 'share/dare/create',
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
