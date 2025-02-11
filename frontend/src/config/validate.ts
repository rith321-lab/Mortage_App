import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
});

try {
  envSchema.parse(import.meta.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error.errors);
  throw new Error('Invalid environment configuration');
}

declare global {
  interface ImportMetaEnv extends z.infer<typeof envSchema> {}
} 