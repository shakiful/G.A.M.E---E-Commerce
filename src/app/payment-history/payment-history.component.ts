import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { SupabaseService } from '../shared/supabase.service';
import { ToastService } from '../shared/toast.service';
import { Games } from '../shared/game-info.model';

interface Payment {
  id: string;
  game_id: number;
  payment_date: string;
  amount: number;
  name: string;
  image_url: string;
  games: {name:string, image_url:string}[]
}

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  paymentHistory: Payment[] = [];
  loading = false;

  constructor(private authService: AuthService, private supabaseService: SupabaseService, private toastService: ToastService) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    const user = await this.authService.isAuthenticatedUser();
    if (user) {
      try {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
          .from('payment_history')
          .select('id, game_id, payment_date, amount, games(name, image_url)')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false });

        if (error) {
          console.error('Error fetching payment history:', error);
          this.toastService.show('Error fetching payment history', 'error');
          this.loading = false;
          return;
        }

        this.paymentHistory = data.map((payment:Payment) => ({
          id: payment.id,
          game_id: payment.game_id,
          payment_date: payment.payment_date,
          amount: payment.amount,
          name: payment.games[0]?.name ?? 'Unknown Game',
          image_url: payment.games[0]?.image_url ?? '',
          games:payment.games
        }));
        this.loading = false;
        

      } catch (error) {
        console.error('Error fetching payment history:', error);
        this.toastService.show('Unexpected error fetching payment history', 'error');
        this.loading = false;
      }
    }
  }
}