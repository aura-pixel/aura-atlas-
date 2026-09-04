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
  objective?: string;
  topics: AcademicTopic[];
};

export type AcademicStructure = {
  subjectObjective?: string;
  units: AcademicUnit[];
};