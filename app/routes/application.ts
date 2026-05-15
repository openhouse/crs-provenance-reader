import Route from '@ember/routing/route';
import { hydrateProvenanceDocument } from 'crs-provenance-reader/utils/provenance-hydrator';
import type {
  HydratedDocument,
  JsonApiDocument,
} from 'crs-provenance-reader/utils/provenance-types';

export default class ApplicationRoute extends Route {
  async model(): Promise<HydratedDocument> {
    // eslint-disable-next-line warp-drive/no-external-request-patterns -- Static public JSON payload; the first reader intentionally avoids Ember Data/WarpDrive.
    const response = await fetch('/api/crs-provenance.json');

    if (!response.ok) {
      throw new Error(
        `Unable to load CRS provenance payload: ${response.status} ${response.statusText}`,
      );
    }

    const payload = (await response.json()) as JsonApiDocument;

    return hydrateProvenanceDocument(payload);
  }
}
