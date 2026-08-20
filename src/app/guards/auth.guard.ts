import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DatabaseService } from '../database.service';

export const authGuard: CanActivateFn = (route, state) => {

  if(inject(DatabaseService).isAuthenticated()){
    return true;
  }else{
    inject(Router).navigate(['/login']);
    return false;
  }
};
