import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
// export class AuthGuard {
//   constructor(private router: Router) {}

//   canActivateFn(): boolean {
//     const token = sessionStorage.getItem('access_token');
//     if (token) {
//       return true;
//     } else {
//       this.router.navigate(['/login']);
//       return false;
//     }
//   }
// }
export class AuthGuard implements CanActivate {
    constructor(private router: Router) {}
  
    canActivate(): boolean {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        return true; // Allow access to the protected route
      } else {
        this.router.navigate(['/']); // Redirect to login if no token
        return false; // Block access
      }
    }
  }
