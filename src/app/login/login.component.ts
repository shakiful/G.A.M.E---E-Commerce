import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <div class="flex items-center justify-center h-screen bg-gray-100">
      <div class="bg-white p-8 rounded shadow-md w-96">
        <h2 class="text-2xl font-semibold mb-4 text-center">Login</h2>

        <div *ngIf="error" class="text-red-500 mb-4 text-center">{{ error }}</div>

        <form (submit)="login()">
          <div class="mb-4">
            <label for="email" class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input type="email" id="email" name="email" [(ngModel)]="email" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Email">
          </div>

          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Password">
          </div>

          <div class="flex items-center justify-between">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Login</button>
            <a routerLink="/register" class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">Register</a>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      const user = await this.authService.login(this.email, this.password);
      if (user) {
        this.router.navigate(['/']);
      } else {
        this.error = 'Invalid credentials';
      }
    } catch (e: any) {
      this.error = e.message;
    }
  }
}
