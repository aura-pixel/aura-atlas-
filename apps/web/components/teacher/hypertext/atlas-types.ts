export type AtlasMaterial = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
};
export type AtlasTopic = {
  id: string;
  number: string;
  title: string;
  subtopics?: { id: string; number: string; title: string }[];
  materials: AtlasMaterial[];
};
export type AtlasUnit = {
  id: string;
  number: number;
  title: string;
  objective?: string | null;
  imageUrl?: string | null;
  updatedAt?: string;
  topics: AtlasTopic[];
};
export type AtlasHypertext = {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  theme: "LIGHT" | "DARK";
  academicStructure?: { subjectObjective?: string } | null;
  user: { name: string };
  subject: {
    id?: string;
    name: string;
    abbreviation?: string | null;
    logoUrl?: string | null;
    color?: string | null;
    career: {
      name: string;
      abbreviation?: string | null;
      faculty: {
        name: string;
        abbreviation?: string | null;
        university: {
          name: string;
          abbreviation: string;
          logoUrl?: string | null;
        };
      };
    };
  };
  units: AtlasUnit[];
};
