import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState$: Observable<any>;

  constructor(private auth: Auth) {
    this.authState$ = user(this.auth);
  }

  async register(email: string, password: string) {
    try {
      const user = await createUserWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error(error);
    }
  }

  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }
}
