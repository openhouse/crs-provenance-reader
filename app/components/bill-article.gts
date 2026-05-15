import Component from '@glimmer/component';
import BillNode from 'crs-provenance-reader/components/bill-node';
import type { TextNode } from 'crs-provenance-reader/utils/provenance-types';

interface BillArticleSignature {
  Args: {
    nodes: TextNode[];
    viewMode: string;
    showAnnotations: boolean;
    showOmissions: boolean;
  };
}

export default class BillArticle extends Component<BillArticleSignature> {
  get hasNodes(): boolean {
    return this.args.nodes.length > 0;
  }

  <template>
    <article class="bill-article" aria-label="Current Albany bill text">
      {{#each @nodes as |node|}}
        <BillNode
          @node={{node}}
          @viewMode={{@viewMode}}
          @showAnnotations={{@showAnnotations}}
          @showOmissions={{@showOmissions}}
        />
      {{/each}}
    </article>
  </template>
}
