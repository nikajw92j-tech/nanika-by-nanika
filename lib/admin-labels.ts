import type { OrderStatus, PaymentStatus } from '@/lib/types';

export const orderStatusLabel: Record<OrderStatus, string> = {
  new: 'ახალი',
  confirmed: 'დადასტურებული',
  in_production: 'იკერება',
  ready: 'მზადაა',
  shipped: 'გაგზავნილი',
  completed: 'დასრულებული',
  cancelled: 'გაუქმებული',
};
export const orderStatusTone: Record<OrderStatus, 'gold' | 'blue' | 'neutral' | 'green' | 'red'> = {
  new: 'gold',
  confirmed: 'blue',
  in_production: 'blue',
  ready: 'blue',
  shipped: 'blue',
  completed: 'green',
  cancelled: 'red',
};
export const paymentLabel: Record<PaymentStatus, string> = { unpaid: 'გადაუხდელი', paid: 'გადახდილი', refunded: 'დაბრუნებული' };
export const paymentTone: Record<PaymentStatus, 'neutral' | 'green' | 'red'> = { unpaid: 'neutral', paid: 'green', refunded: 'red' };
export const quoteLabel = { fixed: 'ფიქსირებული', pending: 'ფასი დასათვლელია', quoted: 'ფასი შეთავაზებულია' } as const;
export const productStatusLabel = { draft: 'მონახაზი', published: 'გამოქვეყნებული', hidden: 'დამალული' } as const;
export const measurementLabel: Record<string, string> = {
  bust: 'მკერდი', waist: 'წელი', hips: 'თეძო', shoulders: 'მხრები', sleeve: 'სახელო', length: 'სიგრძე', height: 'სიმაღლე',
};
