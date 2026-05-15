import Component from '@glimmer/component';
import type { SourceNote as SourceNoteModel } from 'crs-provenance-reader/utils/provenance-types';

interface SourceNoteSignature {
  Args: {
    note: SourceNoteModel;
  };
}

export default class SourceNote extends Component<SourceNoteSignature> {
  get hasReviewCue(): boolean {
    return Boolean(
      this.args.note.reviewStatus || this.args.note.cityDraftStatus,
    );
  }

  <template>
    <aside class={{@note.className}}>
      <p class="callout-label">Source note{{#if @note.topic}}
          ·
          {{@note.topic}}{{/if}}</p>
      <p>{{@note.text}}</p>
      <p class="callout-meta">
        {{#if @note.sourceLayer}}{{@note.sourceLayer}}{{/if}}
        {{#if @note.reviewStatus}} · {{@note.reviewStatus}}{{/if}}
        {{#if @note.cityDraftStatus}}
          · city draft:
          {{@note.cityDraftStatus}}{{/if}}
      </p>
    </aside>
  </template>
}
