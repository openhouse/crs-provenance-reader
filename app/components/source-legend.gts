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

type ViewModeOption = ViewMode & { isSelected: boolean };

export default class SourceLegend extends Component<SourceLegendSignature> {
  get viewModeOptions(): ViewModeOption[] {
    return this.args.viewModes.map((mode) => ({
      ...mode,
      isSelected: mode.id === this.args.selectedViewMode,
    }));
  }

  <template>
    <section
      class="source-legend card bg-base-100 shadow-sm"
      aria-labelledby="source-legend-title"
    >
      <div class="card-body">
        <div class="legend-toolbar">
          <div>
            <p class="eyebrow">Collaborative editor layers</p>
            <h2 id="source-legend-title" class="card-title">
              Source participants and view modes
            </h2>
          </div>

          <div class="join view-mode-buttons" aria-label="Reader view modes">
            {{#each this.viewModeOptions as |mode|}}
              <button
                type="button"
                class="btn join-item
                  {{if mode.isSelected 'btn-primary' 'btn-ghost'}}"
                aria-pressed={{if mode.isSelected "true" "false"}}
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
                <span class="badge badge-outline">{{source.sourceKind}}</span>
                {{#if source.billNumber}}
                  <span class="badge badge-ghost">{{source.billNumber}}</span>
                {{/if}}
                {{#if source.reviewAuthority}}
                  <span
                    class="badge badge-ghost"
                  >{{source.reviewAuthority}}</span>
                {{/if}}
              </p>
              {{#if source.notes}}
                <p>{{source.notes}}</p>
              {{/if}}
              {{#if source.url}}
                <a
                  class="link link-primary"
                  href={{source.url}}
                  target="_blank"
                  rel="noreferrer noopener"
                >Open source</a>
              {{/if}}
            </article>
          {{/each}}
        </div>

        <div class="visual-vocabulary" aria-label="Visual vocabulary">
          <span><b class="swatch participant-albany-current change-added"></b>
            Albany insertion</span>
          <span><b class="swatch participant-frnyc-counsel change-retained"></b>
            FRNYC retained lineage</span>
          <span><b class="swatch participant-intro93 change-deleted"></b>
            Prior-source deletion</span>
          <span><b class="swatch change-review-needed"></b>
            Unresolved suggestion</span>
          <span><b class="swatch city-draft-status-fix"></b>
            City-draft cue</span>
        </div>
      </div>
    </section>
  </template>
}
