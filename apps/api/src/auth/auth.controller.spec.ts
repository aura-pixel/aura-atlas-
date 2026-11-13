import { AuthController } from './auth.controller';
describe('AuthController session boundary', () => {
  it('sets an HttpOnly cookie without returning the token', async () => {
    const expiresAt = new Date();
    const user = { id: 'a', role: 'TEACHER' };
    const service = {
      login: jest.fn().mockResolvedValue({ token: 'secret', expiresAt, user }),
    };
    const res = { cookie: jest.fn() };
    const controller = new AuthController(service as any);
    const result = await controller.login(
      { email: 'a@example.com', password: 'password' },
      res as any,
    );
    expect(result).toEqual({ user });
    expect(res.cookie).toHaveBeenCalledWith(
      'atlas_session',
      'secret',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
      }),
    );
  });
  it('revokes the server session on logout', async () => {
    const service = { logout: jest.fn().mockResolvedValue({ message: 'ok' }) };
    const res = { clearCookie: jest.fn() };
    await new AuthController(service as any).logout(
      { user: { sessionId: 'session-a' } },
      res as any,
    );
    expect(service.logout).toHaveBeenCalledWith('session-a');
    expect(res.clearCookie).toHaveBeenCalled();
  });
});
