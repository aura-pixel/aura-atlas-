export interface AcademicSubtopic {
  number: string;
  title: string;
}

export interface AcademicTopic {
  number: string;
  title: string;
  subtopics: AcademicSubtopic[];
}

export interface AcademicUnit {
  number: number;
  title: string;
  objective?: string;
  topics: AcademicTopic[];
}

export interface AcademicStructure {
  subjectObjective?: string;
  units: AcademicUnit[];
}