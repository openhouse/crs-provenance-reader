import type {
  HydratedDocument,
  JsonApiDocument,
  JsonApiIdentifier,
  JsonApiRelationship,
  JsonApiResource,
  Omission,
  PayloadSmokeCheck,
  RenderSegment,
  ReviewIssue,
  SourceDocument,
  SourceNote,
  TextMark,
  TextNode,
  ViewMode,
} from './provenance-types';

export type ResourceIndex = Map<string, JsonApiResource>;

function keyFor(identifier: JsonApiIdentifier): string {
  return `${identifier.type}:${identifier.id}`;
}

function attr(resource: JsonApiResource | undefined, name: string): unknown {
  return resource?.attributes?.[name];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return asOptionalString(value);
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function relationship(
  resource: JsonApiResource | undefined,
  name: string,
): JsonApiRelationship | undefined {
  return resource?.relationships?.[name];
}

function relationshipIdentifiers(
  resource: JsonApiResource | undefined,
  name: string,
): JsonApiIdentifier[] {
  const data = relationship(resource, name)?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data) {
    return [data];
  }

  return [];
}

function relationshipIdentifier(
  resource: JsonApiResource | undefined,
  name: string,
): JsonApiIdentifier | undefined {
  const data = relationship(resource, name)?.data;

  return !Array.isArray(data) && data ? data : undefined;
}

function getResource(
  index: ResourceIndex,
  identifier: JsonApiIdentifier | undefined,
): JsonApiResource | undefined {
  return identifier ? index.get(keyFor(identifier)) : undefined;
}

function relatedResources(
  index: ResourceIndex,
  resource: JsonApiResource | undefined,
  relationshipName: string,
): JsonApiResource[] {
  return relationshipIdentifiers(resource, relationshipName)
    .map((identifier) => getResource(index, identifier))
    .filter((item): item is JsonApiResource => Boolean(item));
}

export function buildResourceIndex(payload: JsonApiDocument): ResourceIndex {
  const index: ResourceIndex = new Map();
  index.set(keyFor(payload.data), payload.data);

  for (const resource of payload.included ?? []) {
    index.set(keyFor(resource), resource);
  }

  return index;
}

function resourcesByType(
  payload: JsonApiDocument,
  type: string,
): JsonApiResource[] {
  return (payload.included ?? []).filter((resource) => resource.type === type);
}

export function smokeCheckPayload(payload: JsonApiDocument): PayloadSmokeCheck {
  return {
    textNodes: resourcesByType(payload, 'text-nodes').length,
    textMarks: resourcesByType(payload, 'text-marks').length,
    omissions: resourcesByType(payload, 'omissions').length,
    sourceNotes: resourcesByType(payload, 'source-notes').length,
    viewModes: resourcesByType(payload, 'view-modes').length,
    issues: resourcesByType(payload, 'issues').length,
    changeEvents: resourcesByType(payload, 'change-events').length,
  };
}

function semanticClassPrefix(
  prefix: string,
  value: string | null | undefined,
): string[] {
  return value ? [`${prefix}-${value}`] : [];
}

function topicClasses(topics: string[]): string[] {
  return topics.map((topic) => `topic-${topic}`);
}

function participantClasses(
  sourceLayer: string | null | undefined,
  sourceKind?: string | null,
): string[] {
  const sourceIdentity = sourceLayer ?? sourceKind;

  switch (sourceIdentity) {
    case 'intro93':
      return ['participant-intro93', 'source-intro93'];
    case 'frnyc-redline':
    case 'frnyc-counsel-redline':
      return ['participant-frnyc-counsel', 'source-frnyc-reviewed'];
    case 'albany-current':
    case 'albany-current-companion':
      return ['participant-albany-current', 'source-albany-current'];
    case 'mixed':
      return ['participant-mixed', 'source-mixed'];
    case 'city-draft':
      return ['participant-city-draft', 'source-city-draft'];
    default:
      return [];
  }
}

function changeClasses(attributes: {
  sourceAction?: string | null;
  reviewStatus?: string | null;
  cityDraftStatus?: string | null;
  cityDraftCue?: string | null;
  topics?: string[];
}): string[] {
  const classes: string[] = [];
  const topics = attributes.topics ?? [];

  switch (attributes.sourceAction) {
    case 'added':
      classes.push('change-added', 'action-added');
      break;
    case 'removed':
      classes.push('change-deleted', 'action-removed');
      break;
    case 'omitted':
      classes.push('change-deleted', 'action-omitted', 'suggestion-deletion');
      break;
    case 'modified':
    case 'substituted':
      classes.push('change-modified', `action-${attributes.sourceAction}`);
      break;
    case 'retained':
      classes.push('change-retained', 'action-retained');
      break;
  }

  if (
    attributes.reviewStatus === 'review-needed' ||
    topics.includes('review-needed')
  ) {
    classes.push('change-review-needed', 'review-needed');
  }

  if (
    attributes.reviewStatus === 'drafting-error' ||
    topics.includes('drafting-error')
  ) {
    classes.push('change-drafting-error', 'drafting-error');
  }

  if (attributes.reviewStatus?.startsWith('counsel-reviewed')) {
    classes.push('change-retained', 'accepted-suggestion');
  }

  if (attributes.cityDraftStatus) {
    classes.push(`city-draft-${attributes.cityDraftStatus}`);
  }

  if (attributes.cityDraftCue) {
    classes.push(`city-draft-${attributes.cityDraftCue}`);
  }

  return classes;
}

function compactClasses(
  classes: (string | false | null | undefined)[],
): string {
  return [
    ...new Set(classes.filter((item): item is string => Boolean(item))),
  ].join(' ');
}

export function deriveSemanticClasses(attributes: {
  kind?: string;
  sourceLayer?: string;
  sourceAction?: string;
  reviewStatus?: string;
  cityDraftStatus?: string | null;
  topics?: string[];
  severity?: string;
  cityDraftCue?: string;
  sourceKind?: string;
}): string {
  const topics = attributes.topics ?? [];

  return compactClasses([
    attributes.kind ? `kind-${attributes.kind}` : undefined,
    ...semanticClassPrefix('source-layer', attributes.sourceLayer),
    ...semanticClassPrefix('source-action', attributes.sourceAction),
    ...participantClasses(attributes.sourceLayer, attributes.sourceKind),
    ...changeClasses(attributes),
    ...semanticClassPrefix('review-status', attributes.reviewStatus),
    ...semanticClassPrefix('city-draft-status', attributes.cityDraftStatus),
    ...semanticClassPrefix('issue-severity', attributes.severity),
    ...semanticClassPrefix('city-draft-cue', attributes.cityDraftCue),
    topics.includes('drafting-error') && 'flag-drafting-error',
    topics.includes('review-needed') && 'flag-review-needed',
    topics.includes('chain-definition') && 'flag-chain-definition',
    topics.includes('commercial-tenure') && 'flag-commercial-tenure',
    topics.includes('takings') && 'flag-takings',
    ...topicClasses(topics),
  ]);
}

function hydrateSource(
  resource: JsonApiResource | undefined,
): SourceDocument | undefined {
  if (!resource) {
    return undefined;
  }

  const sourceKind = asString(attr(resource, 'sourceKind'), 'source');

  return {
    id: resource.id,
    label: asString(attr(resource, 'label'), resource.id),
    sourceKind,
    jurisdiction: asOptionalString(attr(resource, 'jurisdiction')),
    chamber: asOptionalString(attr(resource, 'chamber')),
    billNumber: asOptionalString(attr(resource, 'billNumber')),
    session: asOptionalString(attr(resource, 'session')),
    status: asOptionalString(attr(resource, 'status')),
    reviewAuthority: asOptionalString(attr(resource, 'reviewAuthority')),
    url: asOptionalString(attr(resource, 'url')),
    notes: asOptionalString(attr(resource, 'notes')),
    className: compactClasses([
      'source-card',
      'card',
      'bg-base-100',
      `source-kind-${sourceKind}`,
      ...participantClasses(undefined, sourceKind),
    ]),
  };
}

function hydrateViewMode(resource: JsonApiResource): ViewMode {
  return {
    id: resource.id,
    order: asNumber(attr(resource, 'order')),
    label: asString(attr(resource, 'label'), resource.id),
    description: asString(attr(resource, 'description')),
    bodyClass: asString(attr(resource, 'bodyClass'), resource.id),
  };
}

function hydrateMark(
  index: ResourceIndex,
  resource: JsonApiResource,
): TextMark {
  const topics = asStringArray(attr(resource, 'topics'));
  const source = hydrateSource(
    getResource(index, relationshipIdentifier(resource, 'source')),
  );
  const kind = asString(attr(resource, 'kind'), 'mark');
  const sourceLayer = asOptionalString(attr(resource, 'sourceLayer'));
  const sourceAction = asOptionalString(attr(resource, 'sourceAction'));
  const reviewStatus = asOptionalString(attr(resource, 'reviewStatus'));
  const cityDraftStatus = asNullableString(attr(resource, 'cityDraftStatus'));

  return {
    id: resource.id,
    nodeId: asOptionalString(attr(resource, 'nodeId')),
    start: asNumber(attr(resource, 'start')),
    end: asNumber(attr(resource, 'end')),
    kind,
    text: asOptionalString(attr(resource, 'text')),
    sourceLayer,
    sourceAction,
    reviewStatus,
    cityDraftStatus,
    topics,
    confidence: asOptionalString(attr(resource, 'confidence')),
    note: asNullableString(attr(resource, 'note')),
    className: deriveSemanticClasses({
      kind,
      sourceLayer,
      sourceAction,
      reviewStatus,
      cityDraftStatus,
      topics,
    }),
    source,
  };
}

function hydrateOmission(
  index: ResourceIndex,
  resource: JsonApiResource,
): Omission {
  const topics = asStringArray(attr(resource, 'topics'));
  const source = hydrateSource(
    getResource(index, relationshipIdentifier(resource, 'source')),
  );
  const reviewStatus = asOptionalString(attr(resource, 'reviewStatus'));
  const cityDraftStatus = asNullableString(attr(resource, 'cityDraftStatus'));
  const omittedFromLayer = asOptionalString(attr(resource, 'omittedFromLayer'));

  return {
    id: resource.id,
    anchorNodeId: asOptionalString(attr(resource, 'anchorNodeId')),
    anchorPosition: asOptionalString(attr(resource, 'anchorPosition')),
    omittedText: asString(attr(resource, 'omittedText')),
    omittedFromLayer,
    omittedInLayer: asOptionalString(attr(resource, 'omittedInLayer')),
    reviewStatus,
    cityDraftStatus,
    topics,
    confidence: asOptionalString(attr(resource, 'confidence')),
    note: asOptionalString(attr(resource, 'note')),
    className: compactClasses([
      'omission-callout',
      deriveSemanticClasses({
        sourceLayer: omittedFromLayer,
        sourceAction: 'omitted',
        reviewStatus,
        cityDraftStatus,
        topics,
      }),
    ]),
    source,
  };
}

function hydrateSourceNote(
  index: ResourceIndex,
  resource: JsonApiResource,
): SourceNote {
  const topic = asOptionalString(attr(resource, 'topic'));
  const topics = topic ? [topic] : [];
  const source = hydrateSource(
    getResource(index, relationshipIdentifier(resource, 'source')),
  );
  const kind = asString(attr(resource, 'kind'), 'source-note');
  const sourceLayer = asOptionalString(attr(resource, 'sourceLayer'));
  const reviewStatus = asOptionalString(attr(resource, 'reviewStatus'));
  const cityDraftStatus = asNullableString(attr(resource, 'cityDraftStatus'));

  return {
    id: resource.id,
    order: asNumber(attr(resource, 'order')),
    anchorNodeId: asOptionalString(attr(resource, 'anchorNodeId')),
    kind,
    text: asString(attr(resource, 'text')),
    topic,
    sourceLayer,
    reviewStatus,
    cityDraftStatus,
    className: compactClasses([
      'source-note',
      deriveSemanticClasses({
        kind,
        sourceLayer,
        reviewStatus,
        cityDraftStatus,
        topics,
      }),
    ]),
    source,
  };
}

export function buildTextSegments(
  node: Pick<TextNode, 'text'>,
  marks: TextMark[],
): RenderSegment[] {
  const text = node.text ?? '';
  const textLength = text.length;
  const validMarks = marks
    .filter((mark) => mark.kind !== 'paragraph-provenance')
    .map((mark) => ({
      ...mark,
      start: Math.max(0, Math.min(textLength, mark.start)),
      end: Math.max(0, Math.min(textLength, mark.end)),
    }))
    .filter((mark) => mark.end > mark.start)
    .sort((left, right) => left.start - right.start || left.end - right.end);

  if (textLength === 0) {
    return [];
  }

  const boundaries = new Set<number>([0, textLength]);

  for (const mark of validMarks) {
    boundaries.add(mark.start);
    boundaries.add(mark.end);
  }

  const sortedBoundaries = [...boundaries].sort((left, right) => left - right);
  const segments: RenderSegment[] = [];

  for (let index = 0; index < sortedBoundaries.length - 1; index += 1) {
    const start = sortedBoundaries[index] ?? 0;
    const end = sortedBoundaries[index + 1] ?? start;

    if (end <= start) {
      continue;
    }

    const coveringMarks = validMarks.filter(
      (mark) => mark.start < end && mark.end > start,
    );
    const className = compactClasses([
      'text-segment',
      ...coveringMarks.map((mark) => mark.className),
    ]);
    const title = coveringMarks
      .map((mark) =>
        [mark.kind, mark.reviewStatus, mark.cityDraftStatus, mark.note]
          .filter(Boolean)
          .join(' · '),
      )
      .filter(Boolean)
      .join('\n');

    segments.push({
      text: text.slice(start, end),
      start,
      end,
      marks: coveringMarks,
      className,
      title,
    });
  }

  return segments;
}

function makeIssueHydrator(
  index: ResourceIndex,
): (resource: JsonApiResource) => ReviewIssue {
  return (resource: JsonApiResource): ReviewIssue => {
    const anchorNodes = relatedResources(index, resource, 'anchorNodes').map(
      (nodeResource) => ({
        id: nodeResource.id,
        sectionNumber: asNullableString(attr(nodeResource, 'sectionNumber')),
        label: asOptionalString(attr(nodeResource, 'label')),
      }),
    );
    const sources = relatedResources(index, resource, 'sources')
      .map((sourceResource) => hydrateSource(sourceResource))
      .filter((source): source is SourceDocument => Boolean(source));
    const severity = asOptionalString(attr(resource, 'severity'));
    const cityDraftCue = asOptionalString(attr(resource, 'cityDraftCue'));

    return {
      id: resource.id,
      label: asString(attr(resource, 'label'), resource.id),
      severity,
      status: asOptionalString(attr(resource, 'status')),
      summary: asString(attr(resource, 'summary')),
      whyItMatters: asOptionalString(attr(resource, 'whyItMatters')),
      cityDraftCue,
      recommendedAction: asOptionalString(attr(resource, 'recommendedAction')),
      anchorNodes,
      sources,
      className: compactClasses([
        'review-issue',
        deriveSemanticClasses({ severity, cityDraftCue }),
      ]),
    };
  };
}

function hydrateNode(
  index: ResourceIndex,
  resource: JsonApiResource,
  nodeIssues: ReviewIssue[],
): TextNode {
  const topics = asStringArray(attr(resource, 'topics'));
  const kind = asString(attr(resource, 'kind'), 'paragraph');
  const sourceLayer = asOptionalString(attr(resource, 'sourceLayer'));
  const sourceAction = asOptionalString(attr(resource, 'sourceAction'));
  const reviewStatus = asOptionalString(attr(resource, 'reviewStatus'));
  const cityDraftStatus = asNullableString(attr(resource, 'cityDraftStatus'));
  const marks = relatedResources(index, resource, 'marks')
    .map((mark) => hydrateMark(index, mark))
    .sort((left, right) => left.start - right.start || left.end - right.end);
  const omissions = relatedResources(index, resource, 'omissions').map(
    (omission) => hydrateOmission(index, omission),
  );
  const sourceNotes = relatedResources(index, resource, 'sourceNotes')
    .map((note) => hydrateSourceNote(index, note))
    .sort((left, right) => left.order - right.order);
  const text = asString(attr(resource, 'text'));

  const node: TextNode = {
    id: resource.id,
    order: asNumber(attr(resource, 'order')),
    dataP: asOptionalString(attr(resource, 'dataP')),
    kind,
    sectionNumber: asNullableString(attr(resource, 'sectionNumber')),
    label: asOptionalString(attr(resource, 'label')),
    text,
    canonicalCitation: asNullableString(attr(resource, 'canonicalCitation')),
    sourceLayer,
    sourceAction,
    reviewStatus,
    cityDraftStatus,
    topics,
    marks,
    segments: [],
    omissions,
    sourceNotes,
    issues: nodeIssues,
    className: compactClasses([
      'bill-node',
      deriveSemanticClasses({
        kind,
        sourceLayer,
        sourceAction,
        reviewStatus,
        cityDraftStatus,
        topics,
      }),
    ]),
  };

  node.segments = buildTextSegments(node, marks);

  return node;
}

const ADDITIONAL_VIEW_MODES: ViewMode[] = [
  {
    id: 'view-legal-review',
    order: 6,
    label: 'Legal review',
    description:
      'Emphasize unresolved legal-review and drafting-error comments.',
    bodyClass: 'view-legal-review',
  },
  {
    id: 'focus-chain-definition',
    order: 7,
    label: 'Focus: chain definition',
    description:
      'Focus the reader on the common-landlord chain-business drafting issue.',
    bodyClass: 'focus-chain-definition',
  },
  {
    id: 'hide-omissions',
    order: 8,
    label: 'Hide omissions',
    description:
      'Keep provenance highlights visible while hiding omission callouts.',
    bodyClass: 'hide-omissions',
  },
];

function appendAdditionalViewModes(viewModes: ViewMode[]): ViewMode[] {
  const existingIds = new Set(viewModes.map((mode) => mode.id));

  return [
    ...viewModes,
    ...ADDITIONAL_VIEW_MODES.filter((mode) => !existingIds.has(mode.id)),
  ].sort((left, right) => left.order - right.order);
}

export function hydrateProvenanceDocument(
  payload: JsonApiDocument,
): HydratedDocument {
  const index = buildResourceIndex(payload);
  const root = payload.data;
  const rootAttributes = root.attributes ?? {};
  const hydrateIssue = makeIssueHydrator(index);

  const sources = relatedResources(index, root, 'sources')
    .map((resource) => hydrateSource(resource))
    .filter((source): source is SourceDocument => Boolean(source));
  const viewModes = appendAdditionalViewModes(
    relatedResources(index, root, 'viewModes')
      .map((resource) => hydrateViewMode(resource))
      .sort((left, right) => left.order - right.order),
  );
  const highPriorityIssues = relatedResources(
    index,
    root,
    'highPriorityIssues',
  ).map(hydrateIssue);
  const issuesByNode = new Map<string, ReviewIssue[]>();

  for (const issue of highPriorityIssues) {
    for (const anchorNode of issue.anchorNodes) {
      const issues = issuesByNode.get(anchorNode.id) ?? [];
      issues.push(issue);
      issuesByNode.set(anchorNode.id, issues);
    }
  }

  const nodeResources =
    relatedResources(index, root, 'nodes').length > 0
      ? relatedResources(index, root, 'nodes')
      : resourcesByType(payload, 'text-nodes');
  const nodes = nodeResources
    .map((resource) =>
      hydrateNode(index, resource, issuesByNode.get(resource.id) ?? []),
    )
    .sort((left, right) => left.order - right.order);

  return {
    id: root.id,
    slug: asOptionalString(rootAttributes.slug),
    title: asString(rootAttributes.title, root.id),
    shortTitle: asOptionalString(rootAttributes.shortTitle),
    billNumber: asOptionalString(rootAttributes.billNumber),
    session: asOptionalString(rootAttributes.session),
    status: asOptionalString(rootAttributes.status),
    description: asOptionalString(rootAttributes.description),
    defaultViewMode: asString(
      rootAttributes.defaultViewMode,
      viewModes[0]?.id ?? 'view-provenance',
    ),
    supportedViewModes: asStringArray(rootAttributes.supportedViewModes),
    notLegalAdvice: asBoolean(rootAttributes.notLegalAdvice, true),
    highPrioritySummary: asStringArray(rootAttributes.highPrioritySummary),
    sources,
    viewModes,
    nodes,
    highPriorityIssues,
    smokeCheck: smokeCheckPayload(payload),
  };
}
