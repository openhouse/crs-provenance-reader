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
    showOmissions: boolean;
  };
}

type SegmentViewModel = RenderSegment & { shouldMark: boolean };

export default class BillNode extends Component<BillNodeSignature> {
  get nodeClassName(): string {
    return `${this.args.node.className} ${this.args.node.issues.length > 0 ? 'has-review-issue' : ''}`;
  }

  get renderSegments(): SegmentViewModel[] {
    return this.args.node.segments.map((segment) => ({
      ...segment,
      shouldMark: this.args.showAnnotations && segment.marks.length > 0,
    }));
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
          <span class="badge badge-ghost">{{@node.sourceLayer}}</span>
          <span class="badge badge-ghost">{{@node.reviewStatus}}</span>
          {{#if @node.cityDraftStatus}}<span
              class="badge badge-ghost"
            >{{@node.cityDraftStatus}}</span>{{/if}}
        {{/if}}
      </div>

      <p class="node-text">
        {{#if @showAnnotations}}
          {{#each this.renderSegments as |segment|}}
            {{#if segment.shouldMark}}
              <mark
                class={{segment.className}}
                title={{segment.title}}
              >{{segment.text}}</mark>
            {{else}}
              <span>{{segment.text}}</span>
            {{/if}}
          {{/each}}
        {{else}}
          {{@node.text}}
        {{/if}}
      </p>

      {{#if @showAnnotations}}
        {{#if @node.issues}}
          <div
            class="node-issues alert"
            aria-label="Issues anchored to this text"
          >
            <span class="comment-label">Unresolved editor comments</span>
            {{#each @node.issues as |issue|}}
              <a class="badge badge-error badge-outline" href="#{{issue.id}}">
                {{issue.label}}
              </a>
            {{/each}}
          </div>
        {{/if}}

        {{#each @node.sourceNotes as |note|}}
          <SourceNote @note={{note}} />
        {{/each}}

        {{#if @showOmissions}}
          {{#each @node.omissions as |omission|}}
            <OmissionCallout @omission={{omission}} />
          {{/each}}
        {{/if}}
      {{/if}}
    </section>
  </template>
}
