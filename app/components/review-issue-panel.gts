import Component from '@glimmer/component';
import type { ReviewIssue } from 'crs-provenance-reader/utils/provenance-types';

interface ReviewIssuePanelSignature {
  Args: {
    issues: ReviewIssue[];
  };
}

export default class ReviewIssuePanel extends Component<ReviewIssuePanelSignature> {
  get hasIssues(): boolean {
    return this.args.issues.length > 0;
  }

  <template>
    <aside class="issue-panel" aria-labelledby="issue-panel-title">
      <p class="eyebrow">Counsel / policy review queue</p>
      <h2 id="issue-panel-title">High-priority issues</h2>

      <ol>
        {{#each @issues as |issue|}}
          <li id={{issue.id}} class={{issue.className}}>
            <h3>{{issue.label}}</h3>
            <p>{{issue.summary}}</p>

            {{#if issue.whyItMatters}}
              <p class="issue-detail"><strong>Why it matters:</strong>
                {{issue.whyItMatters}}</p>
            {{/if}}

            {{#if issue.recommendedAction}}
              <p class="issue-detail"><strong>Draft cue:</strong>
                {{issue.recommendedAction}}</p>
            {{/if}}

            {{#if issue.anchorNodes}}
              <nav aria-label="Issue anchors">
                {{#each issue.anchorNodes as |anchor|}}
                  <a class="issue-anchor" href="#{{anchor.id}}">
                    {{#if
                      anchor.sectionNumber
                    }}{{anchor.sectionNumber}}{{else}}Anchor{{/if}}
                  </a>
                {{/each}}
              </nav>
            {{/if}}
          </li>
        {{/each}}
      </ol>
    </aside>
  </template>
}
