export type Material = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdAt?: string;
};

export type AcademicSubtopic = {
  number: string;
  title: string;
};

export type AcademicTopic = {
  number: string;
  title: string;
  subtopics: AcademicSubtopic[];
};

export type AcademicUnit = {
  number: number;
  title: string;
  objective?: string | null;
  topics: AcademicTopic[];
};

export type AcademicStructure = {
  subjectObjective?: string;
  units: AcademicUnit[];
};

export type ContentTopic = {
  id: string;
  number: string;
  title: string;
  materials: Material[];
};

export type ContentUnit = {
  id: string;
  number: number;
  title: string;
  objective?: string | null;
  topics: ContentTopic[];
};

export type Hypertext = {
  id: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
  slug?: string | null;
};

export type Subject = {
  id: string;
  name: string;
  abbreviation?: string | null;
  description?: string | null;
  color?: string | null;
  logoUrl?: string | null;

  academicStructure?: AcademicStructure | null;
  academicStructureConfirmed?: boolean;

  career: {
  id: string;
  name: string;
  abbreviation?: string | null;

  faculty: {
    id: string;
    name: string;

    university: {
      id: string;
      name: string;
      abbreviation: string;
    };
  };
};

  hypertexts: {
  id: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
  slug?: string | null;

  subject: {
    career: {
      name: string;
      abbreviation?: string | null;

      faculty: {
        name: string;

        university: {
          name: string;
          abbreviation: string;
        };
      };
    };
  };

  units: ContentUnit[];
}[];
};

export type Tab =
  | "resumen"
  | "informacion"
  | "estructura"
  | "contenidos"
  | "hipertexto";