import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { md5 } from 'js-md5';
import { environment } from '../../../environments/environment';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderComponent } from './loader/loader.component';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, ProgressSpinnerModule, LoaderComponent],
    templateUrl: './login.component.html'
})
export class Login implements AfterViewInit {
    username: string = '';
    password: string = '';
    checked: boolean = false;
    isLoading: boolean = false;
    constructor(
        private http: HttpClient,
        private router: Router
    ) {}
    private baseUrl = environment.apiUrl;
    private database = environment.database;

     @ViewChild('usernameInput') usernameInput!: ElementRef;

  ngAfterViewInit() {
    // Trick: Autofill detection (Chrome/WebKit)
    setTimeout(() => {
      this.usernameInput.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
      this.usernameInput.nativeElement.focus(); // ensure focus so Enter works
    });
  }
    login() {
        this.isLoading = true;
        // Hash the password using MD5
        const hashedPassword = md5(this.password);
        // Use the base URL from environment
        // Prepare the body using URLSearchParams
        const body = new URLSearchParams();
        body.set('client_id', 'IOMApp');
        body.set('grant_type', 'password');
        body.set('scope', 'Innovator');
        body.set('username', this.username);
        body.set('password', hashedPassword);
        body.set('database', this.database);

        // Prepare the headers to set Content-Type to x-www-form-urlencoded
        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        // Log the values to check
        // Send the POST request
        this.http.post<any>(this.baseUrl + '/OAuthServer/connect/token', body.toString(), { headers }).subscribe({
            next: (response) => {
                sessionStorage.setItem('access_token', response.access_token);
                sessionStorage.setItem('expires_in', response.expires_in);
                this.isLoading = false;
                //this.router.navigate(['/dashboard']);
                this.router.navigate(['/workcontract']);
            },
            error: (error) => {
                console.error('Login Error:', error);
                this.isLoading = false;
                alert('Login failed. Please check credentials.');
            }
        });
    }
}
