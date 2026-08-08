import { z } from 'zod';

const indianMobileRegex = /^[6-9]\d{9}$/;
const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[Z]{1}[A-Z\d]{1}$/;

export const createCustomerSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(200),
  mobile: z.string().regex(indianMobileRegex, 'Invalid Indian mobile number (10 digits starting with 6-9)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  businessName: z.string().max(200).optional().or(z.literal('')),
  gstNumber: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || gstRegex.test(val),
      'Invalid GST number format (e.g., 22AAAAA0000A1Z5)'
    ),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().max(500).optional().or(z.literal('')),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']).default('LEAD'),
  followUpDate: z.string().datetime().optional().or(z.literal('')).or(z.null()),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createFollowUpSchema = z.object({
  note: z.string().min(1, 'Note is required').max(1000),
  followUpDate: z.string().datetime().optional().or(z.literal('')).or(z.null()),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
