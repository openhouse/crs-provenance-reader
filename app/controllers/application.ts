import Controller from '@ember/controller';
import type { HydratedDocument } from 'crs-provenance-reader/utils/provenance-types';

export default class ApplicationController extends Controller {
  declare model: HydratedDocument;
}
