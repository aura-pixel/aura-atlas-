import { UsersService } from './users.service';
describe('UsersService data boundary', () => {
  it('does not forward a supplied admin role when creating a user', async () => {
    const prisma = {
      user: { create: jest.fn().mockResolvedValue({ id: 'a' }) },
    };
    await new UsersService(prisma as any).create({
      name: 'Teacher',
      email: 'a@example.com',
      password: 'hash',
      role: 'SUPER_ADMIN',
    } as any);
    expect(prisma.user.create.mock.calls[0][0].data).not.toHaveProperty('role');
  });
  it('selects safe profile fields without a password', async () => {
    const prisma = { user: { findUnique: jest.fn() } };
    await new UsersService(prisma as any).findById('a');
    const query = prisma.user.findUnique.mock.calls[0][0];
    expect(query.select.name).toBe(true);
    expect(query.select.password).toBeUndefined();
  });
});
