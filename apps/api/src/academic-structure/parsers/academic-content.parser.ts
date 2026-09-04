import { Injectable } from "@nestjs/common";

import {
  AcademicTopic,
  AcademicSubtopic,
} from "../types/academic-structure.types";

@Injectable()
export class AcademicContentParser {
  parse(lines: string[]): AcademicTopic[] {
    const topics: AcademicTopic[] = [];

    let currentTopic: AcademicTopic | null = null;

    for (const line of lines) {
      const topic = this.matchTopic(line);

      if (topic) {
        currentTopic = {
          number: topic.number,
          title: topic.title,
          subtopics: [],
        };

        topics.push(currentTopic);
        continue;
      }

      const subtopic = this.matchSubtopic(line);

      if (subtopic && currentTopic) {
        currentTopic.subtopics.push(
          subtopic,
        );
      }
    }

    return topics;
  }

  private matchTopic(
    line: string,
  ): {
    number: string;
    title: string;
  } | null {
    const match = line.match(
      /^(\d+\.\d+)\s+(.+)$/,
    );

    if (!match) {
      return null;
    }

    return {
      number: match[1],
      title: match[2].trim(),
    };
  }

  private matchSubtopic(
    line: string,
  ): AcademicSubtopic | null {
    const match = line.match(
      /^(\d+\.\d+\.\d+(?:\.\d+)*)\s+(.+)$/,
    );

    if (!match) {
      return null;
    }

    return {
      number: match[1],
      title: match[2].trim(),
    };
  }
}