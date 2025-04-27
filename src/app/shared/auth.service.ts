import { Injectable } from '@angular/core';
import { SupabaseClient, createClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private authStateSubject = new BehaviorSubject<User | null>(null);
  authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.authStateSubject.next(session?.user || null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.authStateSubject.next(session?.user || null);
    });
  }

  async register(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return data.user;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      return data.user;
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }

  async isAuthenticatedUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
}
