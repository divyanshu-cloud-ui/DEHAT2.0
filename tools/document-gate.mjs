// The ordinary audit reports pending uploads; the launch gate names every missing file.
export function documentGate({documentLinks,redirectDestinations,available,requireDocuments=false}){
  const pendingDocumentLinks=documentLinks.filter(row=>!available(row.target));
  const missingDocuments=[...new Set(pendingDocumentLinks.map(row=>row.target))].sort();
  const missingRedirects=[...new Set(redirectDestinations.filter(target=>!available(target)))];
  const errors=[],warnings=[];
  if(requireDocuments){
    for(const target of missingDocuments)errors.push({kind:'pending-document-uploads',detail:target});
    for(const target of missingRedirects)errors.push({kind:'pending-uploads',detail:target});
  }else{
    if(pendingDocumentLinks.length)warnings.push({kind:'pending-document-uploads',detail:`${pendingDocumentLinks.length} links to ${missingDocuments.length} unpublished PDFs`});
    if(missingRedirects.length)warnings.push({kind:'pending-uploads',detail:`${missingRedirects.length} local redirect destinations are absent: ${missingRedirects.join(', ')}`});
  }
  return {pendingDocumentLinks,missingDocuments,missingRedirects,errors,warnings};
}
