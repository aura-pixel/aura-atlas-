import { BadRequestException } from '@nestjs/common';

export function publicLogoKey(
  folder: string,
  ownerId: string,
  filename?: string,
) {
  if (filename === undefined) {
    if (
      !['universities', 'faculties', 'careers', 'subjects'].includes(folder) ||
      !/^\d{10,16}-\d{1,16}\.(?:jpe?g|png|webp)$/i.test(ownerId)
    ) {
      throw new BadRequestException('Ruta de imagen inválida.');
    }
    return `public/uploads/${folder}/${ownerId}`;
  }
  if (
    !['universities', 'faculties', 'careers', 'subjects'].includes(folder) ||
    !/^[a-z0-9-]+$/i.test(ownerId) ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/i.test(
      filename,
    )
  ) {
    throw new BadRequestException('Ruta de imagen inválida.');
  }
  return `public/uploads/${folder}/${ownerId}/${filename}`;
}
