import { describe, it, expect } from 'vitest';
import { hashPassword } from '../src/utils/authService';
import bcrypt from 'bcryptjs';

describe('hashPassword', () => {
  it('generates a bcrypt hash', () => {
    const pwd = 'secret';
    const hash = hashPassword(pwd);
    expect(hash).not.toBe(pwd);
    expect(bcrypt.compareSync(pwd, hash)).toBe(true);
  });
});
