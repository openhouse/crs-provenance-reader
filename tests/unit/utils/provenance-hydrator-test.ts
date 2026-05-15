import { module, test } from 'qunit';
import {
  buildTextSegments,
  hydrateProvenanceDocument,
} from 'crs-provenance-reader/utils/provenance-hydrator';
import type {
  JsonApiDocument,
  TextMark,
} from 'crs-provenance-reader/utils/provenance-types';

const chainPayload: JsonApiDocument = {
  data: {
    type: 'legislative-documents',
    id: 'doc',
    attributes: {
      title: 'Commercial Rent Stabilization — Albany Bill Source Map',
      defaultViewMode: 'view-provenance',
      notLegalAdvice: true,
      supportedViewModes: ['view-provenance', 'view-current'],
    },
    relationships: {
      sources: {
        data: [{ type: 'source-documents', id: 'src-albany-a5568a' }],
      },
      viewModes: {
        data: [
          { type: 'view-modes', id: 'view-current' },
          { type: 'view-modes', id: 'view-provenance' },
        ],
      },
      nodes: { data: [{ type: 'text-nodes', id: 'node-20-sec-22-1502' }] },
      highPriorityIssues: {
        data: [
          {
            type: 'issues',
            id: 'issue.chain-business-common-landlord-replaces-common-owner',
          },
        ],
      },
    },
  },
  included: [
    {
      type: 'source-documents',
      id: 'src-albany-a5568a',
      attributes: {
        label: 'NYS Assembly A5568A',
        sourceKind: 'albany-current',
      },
    },
    {
      type: 'view-modes',
      id: 'view-provenance',
      attributes: {
        order: 1,
        label: 'Provenance',
        bodyClass: 'view-provenance',
      },
    },
    {
      type: 'view-modes',
      id: 'view-current',
      attributes: {
        order: 2,
        label: 'Plain current bill',
        bodyClass: 'view-current',
      },
    },
    {
      type: 'text-nodes',
      id: 'node-20-sec-22-1502',
      attributes: {
        order: 20,
        kind: 'definition-or-subdivision',
        sectionNumber: '§ 22-1502',
        text: 'd. Chain business means common landlord or principal.',
        sourceLayer: 'mixed',
        sourceAction: 'modified',
        reviewStatus: 'drafting-error',
        cityDraftStatus: 'fix',
        topics: ['chain-definition', 'drafting-error'],
      },
      relationships: {
        marks: {
          data: [
            { type: 'text-marks', id: 'mark-20-paragraph-provenance' },
            { type: 'text-marks', id: 'mark-20-landlord-drafting-error' },
          ],
        },
        omissions: {
          data: [{ type: 'omissions', id: 'omission-chain-owner' }],
        },
        sourceNotes: {
          data: [{ type: 'source-notes', id: 'source-note-chain' }],
        },
      },
    },
    {
      type: 'text-marks',
      id: 'mark-20-paragraph-provenance',
      attributes: {
        start: 0,
        end: 53,
        kind: 'paragraph-provenance',
        sourceLayer: 'mixed',
        sourceAction: 'modified',
        reviewStatus: 'drafting-error',
        topics: ['chain-definition'],
      },
    },
    {
      type: 'text-marks',
      id: 'mark-20-landlord-drafting-error',
      attributes: {
        start: 31,
        end: 39,
        kind: 'drafting-error',
        text: 'landlord',
        sourceLayer: 'albany-current',
        sourceAction: 'modified',
        reviewStatus: 'drafting-error',
        topics: ['drafting-error', 'chain-definition'],
        note: "Current text 'landlord' appears to diverge from expected source term 'owner'.",
      },
    },
    {
      type: 'omissions',
      id: 'omission-chain-owner',
      attributes: {
        anchorNodeId: 'node-20-sec-22-1502',
        omittedText: 'owner',
        omittedFromLayer: 'frnyc-redline',
        reviewStatus: 'counsel-reviewed',
        cityDraftStatus: 'consider-restore',
        topics: ['chain-definition'],
      },
    },
    {
      type: 'source-notes',
      id: 'source-note-chain',
      attributes: {
        order: 3,
        anchorNodeId: 'node-20-sec-22-1502',
        kind: 'drafting-error-note',
        text: 'Drafting error to fix: common landlord should be common owner.',
        topic: 'chain-definition',
        reviewStatus: 'review-needed',
        cityDraftStatus: 'fix',
      },
    },
    {
      type: 'issues',
      id: 'issue.chain-business-common-landlord-replaces-common-owner',
      attributes: {
        label: 'Chain-business definition drafting error',
        severity: 'high',
        status: 'open',
        summary: 'Current Albany text uses common landlord or principal.',
        cityDraftCue: 'fix',
      },
      relationships: {
        anchorNodes: {
          data: [{ type: 'text-nodes', id: 'node-20-sec-22-1502' }],
        },
        sources: {
          data: [{ type: 'source-documents', id: 'src-albany-a5568a' }],
        },
      },
    },
  ],
};

module('Unit | Utility | provenance hydrator', function () {
  test('hydrates relationships and anchors high-priority chain-business issue', function (assert) {
    const document = hydrateProvenanceDocument(chainPayload);
    const node = document.nodes[0]!;

    assert.strictEqual(
      document.title,
      'Commercial Rent Stabilization — Albany Bill Source Map',
    );
    assert.strictEqual(document.sources.length, 1);
    assert.strictEqual(document.viewModes.length, 2);
    assert.strictEqual(document.highPriorityIssues.length, 1);
    assert.ok(node, 'node hydrated');
    assert.strictEqual(node.id, 'node-20-sec-22-1502');
    assert.strictEqual(node.marks.length, 2);
    assert.strictEqual(node.omissions.length, 1);
    assert.strictEqual(node.sourceNotes.length, 1);
    assert.strictEqual(
      node.issues[0]?.label,
      'Chain-business definition drafting error',
    );
  });

  test('segments inline marks while ignoring paragraph provenance and preserving plain text', function (assert) {
    const text = 'Alpha landlord omega';
    const marks: TextMark[] = [
      {
        id: 'paragraph',
        start: 0,
        end: text.length,
        kind: 'paragraph-provenance',
        topics: [],
        className: 'should-not-segment',
      },
      {
        id: 'landlord',
        start: 6,
        end: 14,
        kind: 'drafting-error',
        reviewStatus: 'drafting-error',
        topics: ['drafting-error'],
        className: 'review-status-drafting-error flag-drafting-error',
      },
    ];

    const segments = buildTextSegments({ text }, marks);

    assert.deepEqual(
      segments.map((segment) => segment.text),
      ['Alpha ', 'landlord', ' omega'],
    );
    assert.strictEqual(
      segments[0]?.marks.length,
      0,
      'plain prefix remains unmarked',
    );
    assert.strictEqual(
      segments[1]?.marks[0]?.id,
      'landlord',
      'inline drafting-error mark covers landlord',
    );
    assert.notOk(
      segments.some((segment) =>
        segment.className.includes('should-not-segment'),
      ),
    );
  });

  test('chain-business landlord drafting-error mark is available as a semantic segment', function (assert) {
    const document = hydrateProvenanceDocument(chainPayload);
    const node = document.nodes[0];
    const landlordSegment = node?.segments.find(
      (segment) => segment.text === 'landlord',
    );

    assert.ok(landlordSegment, 'landlord segment exists');
    assert.strictEqual(landlordSegment?.marks[0]?.kind, 'drafting-error');
    assert.true(
      landlordSegment?.className.includes('review-status-drafting-error'),
    );
    assert.true(landlordSegment?.className.includes('flag-drafting-error'));
  });
});
