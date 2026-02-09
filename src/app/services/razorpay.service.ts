import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  constructor(private http: HttpClient) {}

  createOrder(amount: number, currency: string = 'INR'): Observable<any> {
    return this.http.post(`${environment.apiUrl}/razorpay/create_order.php`, { amount, currency });
  }

  verifyPayment(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/razorpay/verify_payment.php`, payload);
  }
}
