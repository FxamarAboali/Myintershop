import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { CoreModule } from 'ish-core/core.module';
import { authGuard } from 'ish-core/guards/auth.guard';
import { identityProviderLogoutGuard } from 'ish-core/guards/identity-provider-logout.guard';
import { SharedModule } from 'ish-shared/shared.module';

import { AppComponent } from './app.component';
import { OrganizationManagementModule } from './app/organization-management.module';
import { LoginComponent } from './login.component';

@NgModule({
  declarations: [AppComponent, LoginComponent],
  exports: [SharedModule],
  imports: [
    BrowserModule,
    CoreModule,
    NoopAnimationsModule,
    OrganizationManagementModule,
    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'logout',
        canActivate: [identityProviderLogoutGuard],
        component: LoginComponent,
      },
      {
        path: 'organization-management',
        loadChildren: () =>
          import('./app/pages/organization-management-routing.module').then(m => m.OrganizationManagementRoutingModule),
        canActivate: [authGuard],
        canActivateChild: [authGuard],
      },
      {
        path: '**',
        redirectTo: 'organization-management',
        pathMatch: 'full',
      },
    ]),
    SharedModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
