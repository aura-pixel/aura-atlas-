import { HypertextService } from './hypertext.service';

describe('Publishing without optional abbreviations', () => {
  it.each([null, '', '   '])(
    'publishes and reconstructs the same URL with abbreviation %s',
    async (abbreviation) => {
      const hypertext = {
        id: 'hypertext-12345678',
        userId: 'teacher',
        subjectId: 'subject',
        academicStructureConfirmed: true,
        isPublished: false,
        slug: null,
        units: [{ topics: [{ materials: [{ id: 'material' }] }] }],
        subject: {
          name: 'Filosofía',
          career: {
            name: 'Estudios de Filosofía',
            abbreviation,
            faculty: {
              approvalStatus: 'APPROVED',
              university: {
                name: 'Universidad del Conocimiento',
                abbreviation,
                approvalStatus: 'APPROVED',
              },
            },
          },
        },
      };
      const prisma = {
        subjectProfile: { findUnique: jest.fn().mockResolvedValue(null) },
        hypertext: {
          findFirst: jest
            .fn()
            .mockImplementation(({ where }) =>
              Promise.resolve(where.slug ? null : hypertext),
            ),
          update: jest.fn().mockImplementation(({ data }) => {
            Object.assign(hypertext, data);
            return Promise.resolve(hypertext);
          }),
        },
      };
      const service = new HypertextService(prisma as any);
      const result = await service.publish(hypertext.id, 'teacher');
      expect(result.publicUrl).toBe(
        '/universidad-del-conocimiento/estudios-de-filosofia/filosofia-12345678',
      );
      expect(result.isPublished).toBe(true);
      expect((await service.findOne(hypertext.id, 'teacher')).publicUrl).toBe(
        result.publicUrl,
      );
    },
  );
});
