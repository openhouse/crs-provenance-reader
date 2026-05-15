export interface JsonApiIdentifier {
  type: string;
  id: string;
}

export interface JsonApiRelationship {
  data?: JsonApiIdentifier | JsonApiIdentifier[] | null;
}

export interface JsonApiResource {
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, JsonApiRelationship>;
}

export interface JsonApiDocument {
  data: JsonApiResource;
  included?: JsonApiResource[];
}

export interface SourceDocument {
  id: string;
  label: string;
  sourceKind: string;
  jurisdiction?: string;
  chamber?: string;
  billNumber?: string;
  session?: string;
  status?: string;
  reviewAuthority?: string;
  url?: string;
  notes?: string;
  className: string;
}

export interface ViewMode {
  id: string;
  order: number;
  label: string;
  description: string;
  bodyClass: string;
}

export interface TextMark {
  id: string;
  nodeId?: string;
  start: number;
  end: number;
  kind: string;
  text?: string;
  sourceLayer?: string;
  sourceAction?: string;
  reviewStatus?: string;
  cityDraftStatus?: string | null;
  topics: string[];
  confidence?: string;
  note?: string | null;
  className: string;
  source?: SourceDocument;
}

export interface RenderSegment {
  text: string;
  start: number;
  end: number;
  marks: TextMark[];
  className: string;
  title: string;
}

export interface Omission {
  id: string;
  anchorNodeId?: string;
  anchorPosition?: string;
  omittedText: string;
  omittedFromLayer?: string;
  omittedInLayer?: string;
  reviewStatus?: string;
  cityDraftStatus?: string | null;
  topics: string[];
  confidence?: string;
  note?: string;
  className: string;
  source?: SourceDocument;
}

export interface SourceNote {
  id: string;
  order: number;
  anchorNodeId?: string;
  kind: string;
  text: string;
  topic?: string;
  sourceLayer?: string;
  reviewStatus?: string;
  cityDraftStatus?: string | null;
  className: string;
  source?: SourceDocument;
}

export interface ReviewIssue {
  id: string;
  label: string;
  severity?: string;
  status?: string;
  summary: string;
  whyItMatters?: string;
  cityDraftCue?: string;
  recommendedAction?: string;
  anchorNodes: Pick<TextNode, 'id' | 'sectionNumber' | 'label'>[];
  sources: SourceDocument[];
  className: string;
}

export interface TextNode {
  id: string;
  order: number;
  dataP?: string;
  kind: string;
  sectionNumber?: string | null;
  label?: string;
  text: string;
  canonicalCitation?: string | null;
  sourceLayer?: string;
  sourceAction?: string;
  reviewStatus?: string;
  cityDraftStatus?: string | null;
  topics: string[];
  marks: TextMark[];
  segments: RenderSegment[];
  omissions: Omission[];
  sourceNotes: SourceNote[];
  issues: ReviewIssue[];
  className: string;
}

export interface PayloadSmokeCheck {
  textNodes: number;
  textMarks: number;
  omissions: number;
  sourceNotes: number;
  viewModes: number;
  issues: number;
  changeEvents: number;
}

export interface HydratedDocument {
  id: string;
  slug?: string;
  title: string;
  shortTitle?: string;
  billNumber?: string;
  session?: string;
  status?: string;
  description?: string;
  defaultViewMode: string;
  supportedViewModes: string[];
  notLegalAdvice: boolean;
  highPrioritySummary: string[];
  sources: SourceDocument[];
  viewModes: ViewMode[];
  nodes: TextNode[];
  highPriorityIssues: ReviewIssue[];
  smokeCheck: PayloadSmokeCheck;
}
