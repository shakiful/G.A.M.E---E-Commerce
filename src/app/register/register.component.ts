import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: []
})
export class RegisterComponent {
    email = '';
    password = '';
    error: string | null = null;

    constructor(private authService: AuthService, private router: Router) { }

    async register() {
        try {
            const user = await this.authService.register(this.email, this.password);
            if (user) {
                this.router.navigate(['/']);
            } else {
                this.error = 'Registration failed';
            }
        } catch (e: any) {
            this.error = e.message;
        }
    }

    async googleSignUp() {
        try {
            await this.authService.googleSignUp();
            this.router.navigate(['/']);
        } catch (error) {
            this.error = error.message;
        }
    }
}