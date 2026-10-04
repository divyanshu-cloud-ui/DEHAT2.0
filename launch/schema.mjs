import { LANGUAGES } from './routes.mjs';

function stripTrailingDehat(title) {
  if (typeof title !== 'string') return '';
  return title.endsWith(' | DEHAT') ? title.slice(0, -8) : title;
}

function firstSegment(title) {
  if (typeof title !== 'string') return '';
  const idx = title.indexOf(' | ');
  return idx !== -1 ? title.slice(0, idx) : title;
}

export function buildGraph({ route, seo, seoFor, fields, stories, assetExists, origin = 'https://dehatindia.org', faqItems }) {
  const baseOrigin = origin || 'https://dehatindia.org';
  const path = route?.canonicalPath || route?.path || '/';
  const canonical = baseOrigin + path;
  const lang = route?.lang || 'en';

  const orgId = baseOrigin + '/#organization';
  const websiteId = baseOrigin + '/#website';

  const isHome = (route?.routeId || route?.id) === 'home';
  const isStory = Boolean(route?.storySlug || (route?.routeId && route.routeId.startsWith('story/')));
  const isProg = Boolean(route?.progKey || route?.view === 'prog' || (route?.routeId && route.routeId.startsWith('prog/')));

  const org = fields?.organization || {};
  const orgNode = {
    '@type': 'NGO',
    '@id': orgId,
    name: org.name || 'DEHAT',
    legalName: org.legalName || 'Developmental Association for Human Advancement',
    alternateName: org.alternateName ? [...org.alternateName] : ['DEHAT India'],
    url: baseOrigin,
    logo: {
      '@type': 'ImageObject',
      url: baseOrigin + '/dehat-logo.png',
    },
    description: org.description || 'A non-profit society in Bahraich, Uttar Pradesh, working on child rights along the Indo-Nepal border. It began as a youth collective in 1989 and was registered in 2000.',
    foundingDate: org.foundingDate || '1989',
    address: org.address ? {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry,
    } : {
      '@type': 'PostalAddress',
      streetAddress: 'Sewakunj, Maseehabad Road via Kati Chauraha, Huzoorpur Marg',
      addressLocality: 'Bahraich',
      addressRegion: 'Uttar Pradesh',
      postalCode: '271801',
      addressCountry: 'IN',
    },
    email: org.email || 'joinus@dehatindia.org',
    sameAs: org.sameAs ? [...org.sameAs] : [
      'https://www.wikidata.org/wiki/Q111469552',
      'https://www.linkedin.com/company/dehat-india/',
      'https://www.facebook.com/dehatorgindia/',
      'https://www.instagram.com/dehat_india/',
      'https://www.youtube.com/@DehatIndiaOrg',
      'https://x.com/dehatindia',
      'https://give.do/ngos/dehat',
    ],
    founder: org.founder ? {
      '@type': 'Person',
      name: org.founder.name,
      birthDate: org.founder.birthDate,
      deathDate: org.founder.deathDate,
    } : {
      '@type': 'Person',
      name: 'Dr. Jitendra Chaturvedi',
      birthDate: '1968-12-19',
      deathDate: '2021-05',
    },
  };

  const websiteNode = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: fields?.website?.name || 'DEHAT',
    url: baseOrigin,
    publisher: {
      '@id': orgId,
    },
    inLanguage: [...LANGUAGES],
  };

  const webpageNode = {
    '@type': 'WebPage',
    '@id': canonical + '#webpage',
    url: canonical,
    name: seo?.title,
    description: seo?.description,
    inLanguage: lang,
    isPartOf: {
      '@id': websiteId,
    },
    about: {
      '@id': orgId,
    },
  };

  if (!isHome) {
    webpageNode.breadcrumb = {
      '@id': canonical + '#breadcrumb',
    };
  }

  const graph = [orgNode, websiteNode, webpageNode];

  if (!isHome) {
    const homeRecord = typeof seoFor === 'function' ? seoFor('home', lang) : null;
    const homeTitle = homeRecord?.title || '';
    const homeItem = lang === 'en' ? baseOrigin : baseOrigin + '/' + lang;

    let items;
    if (isStory) {
      const storiesRecord = typeof seoFor === 'function' ? seoFor('stories', lang) : null;
      const storiesTitle = storiesRecord?.title || '';
      const storiesItem = baseOrigin + (lang === 'en' ? '/stories' : '/' + lang + '/stories');

      items = [
        {
          '@type': 'ListItem',
          position: 1,
          name: firstSegment(homeTitle),
          item: homeItem,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: firstSegment(storiesTitle),
          item: storiesItem,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: stripTrailingDehat(seo?.title),
          item: canonical,
        },
      ];
    } else if (isProg) {
      const workRecord = typeof seoFor === 'function' ? seoFor('work', lang) : null;
      const workTitle = workRecord?.title || '';
      const workItem = baseOrigin + (lang === 'en' ? '/work' : '/' + lang + '/work');

      items = [
        {
          '@type': 'ListItem',
          position: 1,
          name: firstSegment(homeTitle),
          item: homeItem,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: firstSegment(workTitle),
          item: workItem,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: firstSegment(seo?.title),
          item: canonical,
        },
      ];
    } else {
      items = [
        {
          '@type': 'ListItem',
          position: 1,
          name: firstSegment(homeTitle),
          item: homeItem,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: firstSegment(seo?.title),
          item: canonical,
        },
      ];
    }

    graph.push({
      '@type': 'BreadcrumbList',
      '@id': canonical + '#breadcrumb',
      itemListElement: items,
    });
  }

  if (isStory) {
    const storySlug = route?.storySlug || (route?.routeId?.startsWith('story/') ? route.routeId.slice(6) : null);
    const story = Array.isArray(stories) ? stories.find(s => s.slug === storySlug) : null;

    let imageUrl = baseOrigin + '/dehat-og.png';
    if (story && story.art) {
      const artRelPath = 'assets/story/' + story.art + '.png';
      if (typeof assetExists === 'function' && assetExists(artRelPath)) {
        imageUrl = baseOrigin + '/' + artRelPath;
      }
    }

    const articleNode = {
      '@type': fields?.storyType || 'Article',
      '@id': canonical + '#article',
      headline: stripTrailingDehat(seo?.title),
      description: seo?.description,
      inLanguage: lang,
      url: canonical,
      mainEntityOfPage: {
        '@id': canonical + '#webpage',
      },
      author: {
        '@id': orgId,
      },
      publisher: {
        '@id': orgId,
      },
      image: [imageUrl],
      temporalCoverage: story?.year != null ? String(story.year) : undefined,
    };

    graph.push(articleNode);
  }

  if (route?.routeId === 'answers' && Array.isArray(faqItems) && faqItems.length) {
    const faqId = canonical + '#faq';
    webpageNode.mainEntity = { '@id': faqId };
    graph.push({
      '@type': 'FAQPage',
      '@id': faqId,
      url: canonical,
      inLanguage: lang,
      mainEntity: faqItems.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
