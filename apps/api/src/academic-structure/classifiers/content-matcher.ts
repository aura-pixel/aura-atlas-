import { Injectable } from "@nestjs/common";

export type MatchConfidence =
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type ContentMatchCandidate = {
  number: string;
  title: string;
  score: number;

  signals: {
    numberMatch: boolean;
    titleScore: number;
    contentScore: number;
  };
};

export type ContentMatchResult = {
  suggestedTopic: ContentMatchCandidate | null;

  confidence: MatchConfidence;

  margin: number;

  candidates: ContentMatchCandidate[];
};

type TopicInput = {
  number: string;
  title: string;
};

@Injectable()
export class ContentMatcher {
  match(
    fileName: string,
    fileText: string,
    topics: TopicInput[],
  ): ContentMatchResult {
    const normalizedFileName =
      this.normalizeText(fileName);

    const normalizedFileText =
      this.normalizeText(fileText);

    const fileNumber =
      this.extractTopicNumber(fileName);

    const fileNameWords =
      this.getRelevantWords(
        normalizedFileName,
      );

    const fileContentWords =
      this.getRelevantWords(
        normalizedFileText,
      );

    const wordWeights =
      this.calculateWordWeights(
        topics,
      );

    const candidates =
      topics
        .map((topic) => {
          const normalizedTitle =
            this.normalizeText(
              topic.title,
            );

          const titleWords =
            this.getRelevantWords(
              normalizedTitle,
            );

          const numberMatch =
            fileNumber === topic.number;

          const titleScore =
            this.calculateWeightedWordScore(
              fileNameWords,
              titleWords,
              wordWeights,
            );

          const contentScore =
            this.calculateWeightedWordScore(
              fileContentWords,
              titleWords,
              wordWeights,
            );

          let score: number;

          if (numberMatch) {
            score =
              titleScore * 0.25 +
              contentScore * 0.40 +
              0.35;
          } else {
            score =
              titleScore * 0.30 +
              contentScore * 0.70;
          }

          return {
            number: topic.number,
            title: topic.title,

            score: Number(
              Math.min(score, 1).toFixed(3),
            ),

            signals: {
              numberMatch,
              titleScore: Number(
                titleScore.toFixed(3),
              ),
              contentScore: Number(
                contentScore.toFixed(3),
              ),
            },
          };
        })
        .sort(
          (a, b) =>
            b.score - a.score,
        );

    const best =
      candidates[0] ?? null;

    const second =
      candidates[1] ?? null;

    const margin =
      best && second
        ? Number(
            (
              best.score -
              second.score
            ).toFixed(3),
          )
        : best
          ? best.score
          : 0;

    const confidence =
      this.calculateConfidence(
        best,
        margin,
      );

    const suggestedTopic =
      confidence === "LOW"
        ? null
        : best;

    return {
      suggestedTopic,
      confidence,
      margin,
      candidates: candidates.slice(
        0,
        3,
      ),
    };
  }

  private calculateConfidence(
    best:
      | ContentMatchCandidate
      | null,
    margin: number,
  ): MatchConfidence {
    if (!best) {
      return "LOW";
    }

    /**
     * Alta confianza:
     *
     * La coincidencia es suficientemente
     * fuerte Y está claramente por encima
     * del segundo candidato.
     */
    if (
      best.score >= 0.70 &&
      margin >= 0.20
    ) {
      return "HIGH";
    }

    /**
     * Confianza media:
     *
     * Tenemos una coincidencia razonable,
     * pero queremos que el docente la revise.
     */
    if (
      best.score >= 0.45 &&
      margin >= 0.10
    ) {
      return "MEDIUM";
    }

    return "LOW";
  }

  private normalizeText(
    text: string,
  ): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /\.(pdf|docx?|pptx?|xlsx?|mp3|wav|mp4|mov)$/i,
        "",
      )
      .replace(
        /[^a-z0-9.\s]/g,
        " ",
      )
      .replace(
        /\s+/g,
        " ",
      )
      .trim();
  }

  private extractTopicNumber(
    fileName: string,
  ): string | null {
    const match =
      fileName.match(
        /(?:^|\s|[_-])(\d+\.\d+(?:\.\d+)*)(?:\s|[_-]|\.|$)/,
      );

    return match?.[1] ?? null;
  }

  private getRelevantWords(
    text: string,
  ): string[] {
    const stopWords =
      new Set([
        "a",
        "al",
        "de",
        "del",
        "el",
        "la",
        "las",
        "los",
        "en",
        "para",
        "por",
        "con",
        "y",
        "o",
        "un",
        "una",
        "unos",
        "unas",
        "que",
        "se",
        "su",
        "sus",
        "como",
        "sobre",
      ]);

    return [
      ...new Set(
        text
          .split(/\s+/)
          .map((word) =>
            word.replace(
              /^\d+(?:\.\d+)*$/,
              "",
            ),
          )
          .filter(
            (word) =>
              word.length >= 3 &&
              !stopWords.has(word),
          ),
      ),
    ];
  }

  private calculateWordWeights(
    topics: TopicInput[],
  ): Map<string, number> {
    const occurrences =
      new Map<string, number>();

    for (const topic of topics) {
      const words =
        this.getRelevantWords(
          this.normalizeText(
            topic.title,
          ),
        );

      for (const word of words) {
        occurrences.set(
          word,
          (occurrences.get(word) ?? 0) +
            1,
        );
      }
    }

    const totalTopics =
      topics.length;

    const weights =
      new Map<string, number>();

    for (const [
      word,
      count,
    ] of occurrences) {
      const weight =
        totalTopics /
        (count * totalTopics);

      weights.set(
        word,
        Math.max(
          0.2,
          Math.min(weight, 1),
        ),
      );
    }

    return weights;
  }

  private calculateWeightedWordScore(
    sourceWords: string[],
    targetWords: string[],
    weights: Map<string, number>,
  ): number {
    if (
      targetWords.length === 0
    ) {
      return 0;
    }

    let totalWeight = 0;
    let matchedWeight = 0;

    for (const word of targetWords) {
      const weight =
        weights.get(word) ?? 0.2;

      totalWeight += weight;

      if (
        sourceWords.includes(word)
      ) {
        matchedWeight += weight;
      }
    }

    if (totalWeight === 0) {
      return 0;
    }

    return (
      matchedWeight /
      totalWeight
    );
  }
}