import { authService } from '../auth.service';
import { supabase } from '../../config/supabase';
import { AppError } from '../../middleware/error.middleware';

describe('AuthService', () => {
  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      const result = await authService.login(email, password);
      
      expect(result.session).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      await expect(
        authService.login('invalid@email.com', 'wrongpass')
      ).rejects.toThrow(AppError);
    });
  });
}); 