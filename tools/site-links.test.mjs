import test from 'node:test';
import assert from 'node:assert/strict';
import {absoluteDocumentLinks} from './site-links.mjs';

test('rendered finance and governance PDF links use root-relative URLs',()=>{
  const html='<a href="assets/docs/balance-sheet-2024-25.pdf">Balance sheet</a>'+
    '<a href=\'./assets/docs/dehat-organisation-structure.pdf#board\'>Structure</a>'+
    '<a href="/assets/docs/already.pdf">Existing</a>'+
    '<a href="https://example.org/assets/docs/report.pdf">External</a>';
  const fixed=absoluteDocumentLinks(html);
  assert.match(fixed,/href="\/assets\/docs\/balance-sheet-2024-25\.pdf"/);
  assert.match(fixed,/href='\/assets\/docs\/dehat-organisation-structure\.pdf#board'/);
  assert.match(fixed,/href="\/assets\/docs\/already\.pdf"/);
  assert.match(fixed,/href="https:\/\/example\.org\/assets\/docs\/report\.pdf"/);
  assert.equal(absoluteDocumentLinks(fixed),fixed);
});
