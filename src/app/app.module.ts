import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage-angular';
import { HttpClientModule } from '@angular/common/http';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DareComponent } from './dare/dare.component';
import { DareListComponent } from './dare-list/dare-list.component';
import { HomeComponent } from './home/home.component';
import { ShareComponent } from './share/share.component';
import { ShareCreateComponent } from './share-create/share-create.component';

@NgModule({
  declarations: [AppComponent, DareComponent, DareListComponent, HomeComponent, ShareComponent, ShareCreateComponent],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
