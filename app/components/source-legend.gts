import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import type {
  SourceDocument,
  ViewMode,
} from 'crs-provenance-reader/utils/provenance-types';

interface SourceLegendSignature {
  Args: {
    sources: SourceDocument[];
    viewModes: ViewMode[];
    selectedViewMode: string;
    onSelectViewMode: (viewMode: string) => void;
  };
}

export default class SourceLegend extends Component<SourceLegendSignature> {
  isSelected(viewMode: string): boolean {
    return viewMode === this.args.selectedViewMode;
  }

  <template>
    <section class="source-legend" aria-labelledby="source-legend-title">
      <div class="legend-toolbar">
        <div>
          <p class="eyebrow">View mode</p>
          <h2 id="source-legend-title">Source legend and annotation layers</h2>
        </div>

        <div
          class="view-mode-buttons"
          role="group"
          aria-label="Reader view modes"
        >
          {{#each @viewModes as |mode|}}
            <button
              type="button"
              class="view-mode-button
                {{if (this.isSelected mode.id) 'is-active'}}"
              aria-pressed={{if (this.isSelected mode.id) "true" "false"}}
              title={{mode.description}}
              {{on "click" (fn @onSelectViewMode mode.id)}}
            >
              {{mode.label}}
            </button>
          {{/each}}
        </div>
      </div>

      <div class="legend-grid">
        {{#each @sources as |source|}}
          <article class={{source.className}}>
            <h3>{{source.label}}</h3>
            <p class="source-meta">
              {{source.sourceKind}}
              {{#if source.billNumber}} · {{source.billNumber}}{{/if}}
              {{#if source.reviewAuthority}} · {{source.reviewAuthority}}{{/if}}
            </p>
            {{#if source.notes}}
              <p>{{source.notes}}</p>
            {{/if}}
            {{#if source.url}}
              <a
                href={{source.url}}
                target="_blank"
                rel="noreferrer noopener"
              >Open source</a>
            {{/if}}
          </article>
        {{/each}}
      </div>

      <div class="visual-vocabulary" aria-label="Visual vocabulary">
        <span><b class="swatch source-action-added"></b>
          Albany-added/current</span>
        <span><b class="swatch review-status-counsel-reviewed"></b>
          FRNYC counsel-redline lineage</span>
        <span><b class="swatch review-status-review-needed"></b>
          Needs review</span>
        <span><b class="swatch review-status-drafting-error"></b>
          Drafting-error cue</span>
        <span><b class="swatch city-draft-status-fix"></b>
          City-draft fix/restore cue</span>
      </div>
    </section>
  </template>
}
