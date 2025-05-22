// logout.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  private timeout: any;
  private readonly inactivityLimit = 600000; // 1 minute in milliseconds
  ngOnInit(): void {
  const expiry = sessionStorage.getItem('expires_in');
  const currentTime = new Date().getTime();

  if (expiry && currentTime > +expiry) {
    this.logout(); // Call your logout logic
  }
}
  constructor() {
    this.startInactivityTimer();
    this.addActivityListeners();
  }

  private startInactivityTimer(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.logout();
    }, this.inactivityLimit);
  }

  private resetInactivityTimer(): void {
    this.startInactivityTimer();
  }

  private addActivityListeners(): void {
    window.addEventListener('mousemove', () => this.resetInactivityTimer());
    window.addEventListener('keydown', () => this.resetInactivityTimer());
    window.addEventListener('scroll', () => this.resetInactivityTimer());
  }

  public logout(): void {
    sessionStorage.clear();
    window.location.href = '/';
  }
}
