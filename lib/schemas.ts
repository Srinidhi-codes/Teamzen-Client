import { z } from "zod";

export const userProfileSchema = z.object({
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone_number: z.string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional().or(z.literal("")),
  pan_number: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
    .optional().or(z.literal("")),
  aadhar_number: z.string()
    .regex(/^\d{12}$/, "Aadhar must be 12 digits")
    .optional().or(z.literal("")),
  bank_ifsc_code: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format")
    .optional().or(z.literal("")),
  // Add other fields as pass-through or basic validation if needed
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  // ... other fields can be lenient for now as they weren't strictly validated before
}).passthrough(); // Allow other fields
