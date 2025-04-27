import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error: string | null = null;
  returnUrl: string | undefined;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
  }

  async login() {
    try {
      const user = await this.authService.login(this.email, this.password);
      if (user) {
        // Redirect to returnUrl if it exists, otherwise navigate to home
        this.router.navigateByUrl(this.returnUrl || '/');
      } else {
        this.error = 'Invalid credentials';
      }
    } catch (e: any) {
      this.error = e.message;
    }
  }
}