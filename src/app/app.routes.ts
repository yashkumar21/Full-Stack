import { Routes } from '@angular/router';
import { InvalidDataComponent } from './invalid-data/invalid-data.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddDriverComponent } from './add-driver/add-driver.component';
import { DeleteDriverComponent } from './delete-driver/delete-driver.component';
import { UpdateDriverComponent } from './update-driver/update-driver.component';
import { ListDriversComponent } from './list-drivers/list-drivers.component';
import { AddPackageComponent } from './add-package/add-package.component';
import { ListPackagesComponent } from './list-packages/list-packages.component';
import { UpdatePackageComponent } from './update-package/update-package.component';
import { DeletePackageComponent } from './delete-package/delete-package.component';
import { CrudStatsComponent } from './crud-stats/crud-stats.component';
import { TranslateDescriptionComponent } from './translate-description/translate-description.component';
import { TextToSpeechComponent } from './text-to-speech/text-to-speech.component';
import { GetDistanceComponent } from './get-distance/get-distance.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path:'', component: DashboardComponent, canActivate: [authGuard]},
  { path: 'add-driver', component: AddDriverComponent, canActivate: [authGuard] },
  { path: 'list-drivers', component: ListDriversComponent, canActivate: [authGuard] },
  { path: 'delete-driver', component: DeleteDriverComponent, canActivate: [authGuard] },
  { path: 'update-driver', component: UpdateDriverComponent, canActivate: [authGuard] },
  { path: 'invalid-data', component: InvalidDataComponent },
  { path: 'add-package', component: AddPackageComponent, canActivate: [authGuard] },
  { path: 'list-packages', component: ListPackagesComponent, canActivate: [authGuard] },
  { path: 'delete-package', component: DeletePackageComponent, canActivate: [authGuard] },
  { path: 'update-package', component: UpdatePackageComponent, canActivate: [authGuard] },
  { path: 'stats', component: CrudStatsComponent, canActivate: [authGuard] },
  { path: 'translate', component: TranslateDescriptionComponent, canActivate: [authGuard] },
  { path: 'speech', component: TextToSpeechComponent, canActivate: [authGuard] },
  { path: 'generative-ai', component: GetDistanceComponent, canActivate: [authGuard] },
  { path:'signup',component:SignupComponent},
  { path:'login',component:LoginComponent},
  { path: '**', component: ErrorPageComponent , canActivate:[authGuard]}, 
];
