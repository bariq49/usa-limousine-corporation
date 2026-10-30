export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "terms"; items: { term: string; text: string }[] }
  | { type: "contact" };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  effectiveDate: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export type LegalContentProps = {
  document: LegalDocument;
};

export type TableOfContentsProps = {
  items: { id: string; label: string }[];
};
