import Component from '@glimmer/component';
import OmissionCallout from 'crs-provenance-reader/components/omission-callout';
import SourceNote from 'crs-provenance-reader/components/source-note';
import type {
  RenderSegment,
  TextNode,
} from 'crs-provenance-reader/utils/provenance-types';

interface BillNodeSignature {
  Args: {
    node: TextNode;
    viewMode: string;
    showAnnotations: boolean;
  };
}

export default class BillNode extends Component<BillNodeSignature> {
  get nodeClassName(): string {
    return `${this.args.node.className} ${this.args.node.issues.length > 0 ? 'has-review-issue' : ''}`;
  }

  shouldMarkSegment(segment: RenderSegment): boolean {
    return this.args.viewMode !== 'view-current' && segment.marks.length > 0;
  }

  <template>
    <section
      id={{@node.id}}
      class={{this.nodeClassName}}
      data-node-order={{@node.order}}
    >
      <div class="node-meta" aria-label="Text node metadata">
        {{#if @node.sectionNumber}}
          <a href="#{{@node.id}}">{{@node.sectionNumber}}</a>
        {{else}}
          <a href="#{{@node.id}}">¶ {{@node.order}}</a>
        {{/if}}

        {{#if @showAnnotations}}
          <span>{{@node.sourceLayer}}</span>
          <span>{{@node.reviewStatus}}</span>
          {{#if @node.cityDraftStatus}}<span
            >{{@node.cityDraftStatus}}</span>{{/if}}
        {{/if}}
      </div>

      <p class="node-text">
        {{#each @node.segments as |segment|}}
          {{#if (this.shouldMarkSegment segment)}}
            <mark
              class={{segment.className}}
              title={{segment.title}}
            >{{segment.text}}</mark>
          {{else}}
            <span>{{segment.text}}</span>
          {{/if}}
        {{/each}}
      </p>

      {{#if @showAnnotations}}
        {{#if @node.issues}}
          <div class="node-issues" aria-label="Issues anchored to this text">
            {{#each @node.issues as |issue|}}
              <a href="#{{issue.id}}">{{issue.label}}</a>
            {{/each}}
          </div>
        {{/if}}

        {{#each @node.sourceNotes as |note|}}
          <SourceNote @note={{note}} />
        {{/each}}

        {{#each @node.omissions as |omission|}}
          <OmissionCallout @omission={{omission}} />
        {{/each}}
      {{/if}}
    </section>
  </template>
}
