"use server";

import { z } from "zod";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContact(formData) {
  // Parse and validate
  const data = Object.fromEntries(formData);
  const result = contactSchema.safeParse(data);

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  // Simulate processing (e.g., save to DB or send email)
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake delay

  return { success: true, message: "Thank you for your message!" };
}
