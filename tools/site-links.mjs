// Normalize document links after rendering, without changing editorial source data.
export function absoluteDocumentLinks(html){
  return html.replace(/href=(['"])(?:\.\/)?(assets\/docs\/[^'"?#]+\.pdf(?:[?#][^'"]*)?)\1/gi,'href=$1/$2$1');
}
