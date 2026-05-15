import { pageTitle } from 'ember-page-title';
import BillReader from 'crs-provenance-reader/components/bill-reader';

<template>
  {{! @glint-ignore: Ember provides the application route model to its template at runtime. }}
  {{pageTitle @model.title}}
  {{! @glint-ignore: Ember provides the application route model to its template at runtime. }}
  <BillReader @document={{@model}} />
</template>
