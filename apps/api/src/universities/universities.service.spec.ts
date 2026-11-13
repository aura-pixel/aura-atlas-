import { UniversitiesService } from './universities.service';
describe('UniversitiesService write boundary', () => {
  it('does not forward nested relational writes to Prisma', async () => {
    const prisma = { university: { update: jest.fn() } };
    await new UniversitiesService(prisma as any).update('uni', {
      name: 'Allowed',
      faculties: { deleteMany: {} },
    } as any);
    const data = prisma.university.update.mock.calls[0][0].data;
    expect(data.name).toBe('Allowed');
    expect(data).not.toHaveProperty('faculties');
  });
});
