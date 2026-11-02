import { z } from 'zod';

export const MEASUREMENT_KEYS = ['bust', 'waist', 'hips', 'shoulders', 'sleeve', 'length', 'height'] as const;
export const REQUIRED_MEASUREMENTS = ['bust', 'waist', 'hips'] as const;
export const MAX_ORDER_FILES = 5;

export type OrderMessages = {
  required: string;
  name: string;
  phone: string;
  city: string;
  category: string;
  number: string;
  measurements: string;
};

const phoneOk = (v: string) => /^\+?[\d\s()-]{9,20}$/.test(v) && v.replace(/\D/g, '').length >= 9;

const measurement = (m: OrderMessages) =>
  z
    .string()
    .trim()
    .max(6)
    .refine((v) => v === '' || (/^\d{1,3}([.,]\d)?$/.test(v) && Number(v.replace(',', '.')) >= 10), m.number)
    .optional()
    .default('');

/** ერთი სქემა კლიენტისთვის (ლოკალიზებული შეტყობინებებით) და სერვერისთვის */
export function makeOrderSchema(m: OrderMessages) {
  return z
    .object({
      product: z.string().trim().max(120).optional().default(''),
      model: z.string().trim().max(120).optional().default(''),
      category: z.string().trim().max(60).optional().default(''),
      measurementsLater: z.boolean().default(false),
      measurements: z.object(
        Object.fromEntries(MEASUREMENT_KEYS.map((k) => [k, measurement(m)])) as Record<
          (typeof MEASUREMENT_KEYS)[number],
          ReturnType<typeof measurement>
        >,
      ),
      color: z.string().trim().max(120).optional().default(''),
      size: z.string().trim().max(20).optional().default(''),
      customSize: z.boolean().default(true),
      desiredDate: z
        .string()
        .trim()
        .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), m.required)
        .optional()
        .default(''),
      comment: z.string().trim().max(2000).optional().default(''),
      name: z.string().trim().min(2, m.name).max(80, m.name),
      phone: z.string().trim().refine(phoneOk, m.phone),
      city: z.string().trim().min(2, m.city).max(60, m.city),
      contactMethod: z.enum(['phone', 'whatsapp', 'messenger']),
      website: z.string().max(0).optional().default(''), // honeypot
    })
    .superRefine((v, ctx) => {
      if (!v.product && !v.model && !v.category) {
        ctx.addIssue({ code: 'custom', path: ['category'], message: m.category });
      }
      if (v.customSize && !v.measurementsLater) {
        for (const k of REQUIRED_MEASUREMENTS) {
          if (!v.measurements[k]) {
            ctx.addIssue({ code: 'custom', path: ['measurements', k], message: m.measurements });
          }
        }
      }
    });
}

export type OrderInput = z.input<ReturnType<typeof makeOrderSchema>>;
export type OrderData = z.output<ReturnType<typeof makeOrderSchema>>;

export const requestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().refine(phoneOk),
  message: z.string().trim().min(3).max(2000),
  website: z.string().max(0).optional().default(''),
});
