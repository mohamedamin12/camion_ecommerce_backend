// stripe.controller.ts
import { Controller, Post, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { OrdersService } from '../orders-service.service';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('webhook')
  async handleWebhook(@Req() req, @Res() res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = this.stripeService.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      // Example: Update order status in database
      await this.ordersService.markAsPaidByPaymentIntentId(paymentIntent.id);
    }

    return res.json({ received: true });
  }
}
