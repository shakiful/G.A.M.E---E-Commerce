import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, GoogleAuthProvider, signInWithPopup, updateProfile } from '@angular/fire/auth';
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
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      // Extract username from email
      const username = email.substring(0, email.indexOf('@'));
      // Update the user's profile with the username
      await updateProfile(userCredential.user, { displayName: username });
      return userCredential;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            // Extract username from email
      const username = email.substring(0, email.indexOf('@'));
      // Update the user's profile with the username
      await updateProfile(userCredential.user, { displayName: username });
      return userCredential;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async logout() {
    await signOut(this.auth);
  }

  async googleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async googleSignUp() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getUsername() {
    const user = this.auth.currentUser;
    if (user) {
      return user.displayName || user.email?.split('@')[0] || 'User';
    } else {
      return null;
    }
  }
}