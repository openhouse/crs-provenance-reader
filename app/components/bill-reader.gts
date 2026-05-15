import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import BillArticle from 'crs-provenance-reader/components/bill-article';
import ReviewIssuePanel from 'crs-provenance-reader/components/review-issue-panel';
import SourceLegend from 'crs-provenance-reader/components/source-legend';
import type { HydratedDocument } from 'crs-provenance-reader/utils/provenance-types';

interface BillReaderSignature {
  Args: {
    document: HydratedDocument;
  };
}

export default class BillReader extends Component<BillReaderSignature> {
  @tracked selectedViewMode = this.initialViewMode;

  get initialViewMode(): string {
    if (typeof window !== 'undefined') {
      const requestedViewMode = new URLSearchParams(window.location.search).get(
        'view',
      );

      if (
        requestedViewMode &&
        this.args.document.viewModes.some(
          (mode) => mode.id === requestedViewMode,
        )
      ) {
        return requestedViewMode;
      }
    }

    return this.args.document.defaultViewMode;
  }

  get activeViewModeClass(): string {
    return (
      this.args.document.viewModes.find(
        (mode) => mode.id === this.selectedViewMode,
      )?.bodyClass ?? this.selectedViewMode
    );
  }

  get showAnnotations(): boolean {
    return this.selectedViewMode !== 'view-current';
  }

  get showOmissions(): boolean {
    return this.showAnnotations && this.selectedViewMode !== 'hide-omissions';
  }

  @action
  selectViewMode(viewMode: string): void {
    this.selectedViewMode = viewMode;

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', viewMode);
      window.history.replaceState({}, '', url);
    }
  }

  <template>
    <div
      class="reader-shell {{this.activeViewModeClass}}"
      data-view-mode={{this.selectedViewMode}}
    >
      <header class="reader-header hero bg-base-100 shadow-sm">
        <div class="hero-content block">
          <p class="eyebrow">Collaborative legislative text editor</p>
          <h1>{{@document.title}}</h1>

          {{#if @document.description}}
            <p class="lede">{{@document.description}}</p>
          {{/if}}

          <dl class="document-meta" aria-label="Bill metadata">
            {{#if @document.billNumber}}
              <div>
                <dt>Bill</dt>
                <dd>{{@document.billNumber}}</dd>
              </div>
            {{/if}}
            {{#if @document.session}}
              <div>
                <dt>Session</dt>
                <dd>{{@document.session}}</dd>
              </div>
            {{/if}}
            {{#if @document.status}}
              <div>
                <dt>Status</dt>
                <dd>{{@document.status}}</dd>
              </div>
            {{/if}}
            <div>
              <dt>Payload</dt>
              <dd>{{@document.smokeCheck.textNodes}}
                nodes ·
                {{@document.smokeCheck.textMarks}}
                marks ·
                {{@document.smokeCheck.issues}}
                issues</dd>
            </div>
          </dl>

          <aside
            class="legal-caveat alert alert-warning"
            aria-label="Legal review caveat"
          >
            <strong>Review caveat:</strong>
            This is a legislative-reading and provenance interface, not legal
            advice.
            <code>counsel-reviewed</code>
            means substantially carried through the Fair Rent NYC 2022
            counsel-redline lineage, not an independent guarantee of legal
            sufficiency. Review flags are metadata for counsel/policy review,
            not final legal conclusions.
          </aside>
        </div>
      </header>

      <SourceLegend
        @sources={{@document.sources}}
        @viewModes={{@document.viewModes}}
        @selectedViewMode={{this.selectedViewMode}}
        @onSelectViewMode={{this.selectViewMode}}
      />

      <main class="reader-layout">
        {{#if this.showAnnotations}}
          <ReviewIssuePanel @issues={{@document.highPriorityIssues}} />
        {{/if}}

        <BillArticle
          @nodes={{@document.nodes}}
          @viewMode={{this.selectedViewMode}}
          @showAnnotations={{this.showAnnotations}}
          @showOmissions={{this.showOmissions}}
        />
      </main>
    </div>
  </template>
}
