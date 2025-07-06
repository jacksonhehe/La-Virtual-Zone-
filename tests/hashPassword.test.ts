import { describe, it, expect } from 'vitest';
import { hashPassword } from '../src/utils/authService';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

describe('hashPassword', () => {
  it('generates a bcrypt hash', async () => {
    const pwd = 'secret';
    const hash = await hashPassword(pwd);
    expect(hash).not.toBe(pwd);
    expect(bcrypt.compareSync(pwd, hash)).toBe(true);
  });
});
