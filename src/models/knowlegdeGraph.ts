export interface Context {
  '@vocab': string;
  kg: string;
  detailedDescription: string;
  resultScore: string;
  goog: string;
  EntitySearchResult: string;
}

export interface DetailedDescription {
  url: string;
  articleBody: string;
  license: string;
}

export interface Image {
  url: string;
  contentUrl: string;
}

export interface Result {
  detailedDescription: DetailedDescription;
  '@id': string;
  image: Image;
  name: string;
  '@type': string[];
  description: string;
}

export interface ItemListElement {
  result: Result;
  resultScore: number;
  '@type': string;
}

export interface KnowledgeGraph {
  '@context': Context;
  '@type': string;
  itemListElement: ItemListElement[];
}
