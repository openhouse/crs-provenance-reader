import Component from '@glimmer/component';
import type { Omission } from 'crs-provenance-reader/utils/provenance-types';

interface OmissionCalloutSignature {
  Args: {
    omission: Omission;
  };
}

export default class OmissionCallout extends Component<OmissionCalloutSignature> {
  get hasReviewCue(): boolean {
    return Boolean(
      this.args.omission.reviewStatus || this.args.omission.cityDraftStatus,
    );
  }

  <template>
    <aside class={{@omission.className}}>
      <p class="callout-label">Omitted source-layer material</p>
      <blockquote>{{@omission.omittedText}}</blockquote>
      <p class="callout-meta">
        {{#if @omission.omittedFromLayer}}From
          {{@omission.omittedFromLayer}}{{/if}}
        {{#if @omission.reviewStatus}} · {{@omission.reviewStatus}}{{/if}}
        {{#if @omission.cityDraftStatus}}
          · city draft:
          {{@omission.cityDraftStatus}}{{/if}}
      </p>
      {{#if @omission.note}}
        <p>{{@omission.note}}</p>
      {{/if}}
    </aside>
  </template>
}
