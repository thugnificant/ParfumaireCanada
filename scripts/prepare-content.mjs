import fs from 'node:fs/promises';
import sharp from 'sharp';
const assets = JSON.parse(await fs.readFile('docs/migration/assets.json', 'utf8'));
function asset(fragment, alt) {
  const a = assets.find((a) => a.sourceUrls.some((u) => u.includes(fragment)));
  if (!a?.path) throw Error(`Missing image ${fragment}`);
  return { ...a, alt };
}
const media = {
  lifestyle: asset(
    'Luxurious-Mansion',
    'An open living room with a view, from the Parfumaire home-scenting collection',
  ),
  story: asset('FragLab_327848646', 'Fragrance materials and glass vessels in a perfume workshop'),
  about: asset(
    'slider-parfumair-grasse-france.jpg',
    'Paris rooftops and the Eiffel Tower in warm evening light',
  ),
  business: asset('Web_329019828', 'A guest arriving at a hotel reception'),
  branding: asset('slider-parfumair-retail-scenting', 'A carefully designed fashion boutique'),
  custom: asset('Web_CustomScent', 'Fragrance creation with a selection of aromatic materials'),
  odour: asset(
    'WEBCoffeeLavenderAdjust',
    'Coffee beans, lavender, citrus and aromatic ingredients',
  ),
  home: asset('detail-living-room', 'A quiet living room with flowers and natural textures'),
};
await fs.writeFile('src/data/media.json', JSON.stringify(media, null, 2));
await sharp('public' + media.lifestyle.path)
  .resize(1200, 630, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile('public/images/social-card.webp');
const pages = [
  {
    slug: 'about',
    title: 'Every fragrance tells a story.',
    eyebrow: 'OURS BEGINS WITH A FEELING',
    description:
      'Discover the Parfumaire story: French fragrance expertise, thoughtful diffusion and memorable atmospheres for homes and businesses.',
    image: 'about',
    intro: 'The power of scent, artfully delivered. Discover Parfumaire by Atmosphere Diffusion.',
    body: `<h2>Experience, quality and know-how.</h2><p>Parfumaire by Atmosphere Diffusion is an innovator in the European scent marketing industry. The brand’s knowledge and experience, combined with its fragrances and diffusion systems, bring a subtle, differentiating touch to commercial and residential spaces.</p><p>Corporations, retail and hospitality brands, as well as homes around the world, have turned to Parfumaire to inspire memories and create connections for more than 20 years.</p><h2>A French sensibility.</h2><p>The original brand describes a process guided by experienced perfumers in France: carefully choosing fragrance materials, developing a composition and selecting a scent to express a particular atmosphere.</p><p>We believe that a fragrance should feel at home in its surroundings. That begins with your space, your preferences and the feeling you want to create.</p><h2>Your atmosphere, your way.</h2><p>Explore signature fragrances for your home, discover a diffuser that suits your space, or begin a conversation about scent for your business.</p>`,
    cta: 'Explore the collection',
    href: '/collections/all/',
  },
  {
    slug: 'business-scenting',
    title: 'A welcome they’ll remember.',
    eyebrow: 'PARFUMAIRE FOR BUSINESS',
    description:
      'Explore business scenting, scent branding, odour management and custom fragrance development with Parfumaire Canada.',
    image: 'business',
    intro:
      'Make fragrance part of the experience. From a first impression to a familiar welcome, discover an atmosphere that belongs to your brand.',
    body: `<h2>Tell your brand’s story through scent.</h2><p>A carefully chosen fragrance can become part of how a space feels. Parfumaire’s business scenting services are designed around the character of your brand and the experience you want to create.</p><p>The original Parfumaire business serves retail, hospitality, showrooms and other commercial environments. Explore a signature fragrance from the collection or discuss a custom composition.</p><h2>Start with a conversation.</h2><p>Share the type of space, the atmosphere you have in mind and any existing scenting equipment. A consultation can help identify fragrance preferences and the diffusion setup to investigate.</p><p>Canadian installation, maintenance, coverage and service availability will be confirmed individually. The demo does not promise a service contract or subscription.</p><h2>Three ways to shape an atmosphere.</h2><p>Build a connection with scent branding, discuss an unwanted odour with a specialist, or develop a fragrance that is distinctive to your business.</p>`,
    cta: 'Discuss business scenting',
    href: '/contact/?interest=business',
  },
  {
    slug: 'scent-branding',
    title: 'A signature beyond the visual.',
    eyebrow: 'SCENT BRANDING',
    description:
      'Make fragrance part of your brand identity. Explore scent branding for retail, hospitality and commercial spaces with Parfumaire.',
    image: 'branding',
    intro: 'A familiar note. A distinct atmosphere. A fragrance that becomes part of your story.',
    body: `<h2>Translate a feeling into fragrance.</h2><p>Parfumaire’s scent branding service begins with the experience you want people to associate with your space. That might be a sense of serenity, a crisp and clean impression, or a more energetic atmosphere.</p><p>Choose from the signature fragrance library or explore a composition developed around your brand. The setting, intended mood and existing brand identity all help guide the conversation.</p><h2>Consider the whole space.</h2><p>Tell us about your environment, its layout and how people move through it. Fragrance preference, diffuser placement and intensity need to work together. Suitability and service arrangements will be confirmed for your location.</p>`,
    cta: 'Discuss your brand',
    href: '/contact/?interest=business',
  },
  {
    slug: 'odor-elimination',
    title: 'A fresh perspective on your space.',
    eyebrow: 'ODOUR MANAGEMENT',
    description:
      'Discuss unwanted odours and fragrance options for a commercial space. Explore Parfumaire’s odour management consultation.',
    image: 'odour',
    intro:
      'A pleasant atmosphere starts with understanding your space. Talk through unwanted odours and the options available.',
    body: `<h2>Begin with the source.</h2><p>The original Parfumaire service describes odour-counterbalancing solutions and expert assessment of unwanted smells. The appropriate approach depends on the space and the problem being addressed.</p><p>Describe where and when you notice the odour, the use of the space and any existing ventilation or scenting equipment. A consultation can help determine what to investigate.</p><h2>Set the right expectations.</h2><p>Fragrance should not be treated as a substitute for cleaning, ventilation or addressing an underlying issue. Specific performance, equipment suitability and Canadian service availability require confirmation.</p>`,
    cta: 'Discuss your space',
    href: '/contact/?interest=business',
  },
  {
    slug: 'custom-fragrances',
    title: 'Entirely, unmistakably yours.',
    eyebrow: 'CUSTOM FRAGRANCES',
    description:
      'Explore a custom signature fragrance for your brand or space. Discover Parfumaire’s fragrance-development approach.',
    image: 'custom',
    intro:
      'When the feeling is unique, the fragrance can be too. Explore a scent developed around your story.',
    body: `<h2>A fragrance with your point of view.</h2><p>Parfumaire’s original service offers custom scent development alongside its existing fragrance library. Trained fragrance specialists guide the process of finding a composition that reflects a particular style or brand.</p><h2>What is your scent story?</h2><p>Start with the mood you want to express, notes you are drawn to and the environment where the fragrance will be used. Familiar references can help make an abstract idea more tangible.</p><p>Development steps, sampling, minimum quantities, timing, formula ownership and Canadian availability are matters for an individual discussion. None are promised by this demo.</p>`,
    cta: 'Start a scent conversation',
    href: '/contact/?interest=custom',
  },
  {
    slug: 'home-scenting',
    title: 'Make yourself at home.',
    eyebrow: 'HOME SCENTING',
    description:
      'Explore fragrance oils and scent diffusers for a welcoming home. Find signature scent notes and compatible sizes.',
    image: 'home',
    intro:
      'The familiar. The comfortable. The unmistakably you. Find a fragrance that belongs in your everyday.',
    body: `<h2>A little everyday atmosphere.</h2><p>Explore fragrances through the notes you enjoy: bright citrus, delicate florals, warm spice or grounding woods. Our scent finder is a starting point, with suggestions based on the original catalog’s note lists.</p><h2>A diffuser to suit your space.</h2><p>La Tour has a stated 120 ml capacity, CozyAir 500 ml and CozyAir Max 1 L. Compare their dimensions and ask about the setup that suits your home.</p><p>The source lists 120 ml fragrance bottles for La Tour, and 500 ml and 1 L bottles for CozyAir and CozyAir Max. Confirm the refill size and equipment compatibility before use.</p>`,
    cta: 'Find your scent',
    href: '/fragrance-finder/',
  },
  {
    slug: 'privacy',
    title: 'Your privacy in this preview.',
    eyebrow: 'CLIENT REVIEW DEMO',
    description:
      'How the Parfumaire Canada client preview handles enquiry details, local interactions and hosting requests.',
    body: `<p>This public website is a client review demo. Its enquiry form runs in preview mode: it does not send your details to a recipient, analytics provider or form service. Personal details entered into the form are held only in the current page while you interact and are cleared when the preview is completed or the page is closed.</p><p>Search and scent-finder preferences are processed in your browser without being saved. No advertising or analytics scripts are installed. We do not use local storage or cookies for these interactions.</p><p>GitHub Pages and network providers may process ordinary web requests, including IP addresses, under their own policies. A noindex directive discourages search indexing; it does not make the demo private.</p><p>Product handles, variant identifiers and quantities may appear in enquiry links. Names, email addresses, phone numbers and messages are not placed in website query strings.</p><p>A Canadian privacy notice and contact destination must be approved before an actual enquiry service is enabled. If email-draft mode is later configured, the form will open a draft in your email application; the user remains responsible for sending it.</p>`,
  },
  {
    slug: 'terms',
    title: 'A preview, thoughtfully presented.',
    eyebrow: 'DEMO TERMS',
    description:
      'Understand USD reference pricing and the preview-only nature of this Parfumaire Canada client demonstration.',
    body: `<p>This site demonstrates a proposed Canadian catalog and enquiry experience. It does not accept purchases, orders, subscriptions or payments.</p><h2>Reference pricing</h2><p>All displayed prices originate from the Parfumaire USD catalog. They are labelled USD reference prices, not approved Canadian offers. Canadian pricing, applicable taxes, availability, delivery arrangements and other terms remain to be confirmed.</p><h2>Product information</h2><p>Descriptions, notes, images and specifications are preserved from the original public catalog. Some source information may be inconsistent or outdated. Confirm product suitability, scent composition, dimensions and compatibility before relying on it.</p><h2>Enquiries</h2><p>Preview enquiries send nothing and create no order or binding price agreement. Canadian contact details and enquiry delivery must be configured before the site is used for real requests.</p><h2>Original policies</h2><p>The source shop’s shipping, returns, subscription and purchase terms are archived for migration review. They are not presented as Canadian commitments.</p>`,
  },
  {
    slug: 'faq',
    title: 'Good questions. Clear answers.',
    eyebrow: 'QUESTIONS & CARE',
    description:
      'Learn about Parfumaire diffuser capacities, fragrance compatibility, reference pricing and the enquiry preview.',
    body: `<details open><summary>Which fragrance size fits my diffuser?</summary><div><p>The source catalog lists 120 ml for La Tour and 500 ml and 1 L for CozyAir and CozyAir Max. Their stated diffuser capacities are 120 ml, 500 ml and 1 L respectively. Confirm the refill against your exact equipment before use.</p></div></details><details><summary>Do I add water to La Tour?</summary><div><p>The source describes La Tour as nebulizing fragrance oil into a fine, dry mist without water or heat. Ask for the model’s current operating instructions before setup.</p></div></details><details><summary>Are these Canadian prices?</summary><div><p>No. Prices are copied from the original shop in USD and labelled as reference prices. Canadian pricing will be confirmed through an enquiry when the service goes live.</p></div></details><details><summary>Can I buy online?</summary><div><p>This phase is an enquiry catalog. There is no cart, checkout, account or payment processing.</p></div></details><details><summary>Will my enquiry be delivered?</summary><div><p>During client review, no. The preview demonstrates the form without sending or storing your personal details.</p></div></details><details><summary>What area does each diffuser cover?</summary><div><p>Verified coverage figures were not available in the current product records. Room layout, ventilation and diffusion settings can affect suitability. Include space details in your enquiry.</p></div></details><details><summary>Are these pure essential oils?</summary><div><p>The collection is presented as fragrance oils. Composition and ingredient claims need to be confirmed for the exact fragrance; we do not classify every blend as a pure essential oil.</p></div></details><details><summary>Where are cleaning and maintenance instructions?</summary><div><p>Complete current model manuals were not linked in the public product records retrieved for this demo. Ask for the appropriate guide for your model. Do not infer a cleaning procedure from another diffuser.</p></div></details>`,
  },
  {
    slug: 'journal/choosing-a-diffuser',
    title: 'Find the diffuser that fits.',
    eyebrow: 'THE SCENT JOURNAL',
    description:
      'Compare capacities, dimensions and fragrance sizes for the three Parfumaire scent diffusers.',
    body: `<p class="lead">Begin with the space. Then consider the format.</p><h2>La Tour: a vertical silhouette.</h2><p>La Tour is a freestanding design with a stated 120 ml capacity and source dimensions of 4⅜″ × 47¼″. Its tall, slender form makes footprint and placement useful starting points for a conversation.</p><h2>CozyAir: a compact format.</h2><p>The original catalog lists a 500 ml capacity and dimensions of 6⅜″ × 3¾″ × 9¾″. White and black variants are available in the source data.</p><h2>CozyAir Max: a larger capacity.</h2><p>With a stated 1 L capacity, CozyAir Max measures 15⅛″ × 9″ × 18⅜″ in the source catalog. It is listed in white and black, with different source prices for each variant.</p><p><a href="/collections/scent-diffusers/">Compare all three diffusers</a>, and include your room layout and intended use when you enquire. Verified coverage ratings were not available in the retrieved product records.</p>`,
  },
  {
    slug: 'journal/understanding-scent-notes',
    title: 'A fragrance, in three acts.',
    eyebrow: 'THE SCENT JOURNAL',
    description:
      'Explore the top, heart and base notes listed in Parfumaire’s signature fragrance collection.',
    body: `<p class="lead">A note list offers a first glimpse of a fragrance’s character.</p><p>Parfumaire’s source catalog groups each fragrance into top, middle and base notes. Our product pages preserve those lists so you can explore a composition before asking for more information.</p><h2>Follow a note you love.</h2><p>If you enjoy citrus, explore the catalog’s bergamot, lemon, mandarin or grapefruit notes. If woods appeal to you, look for cedarwood, sandalwood or vetiver. Notes often appear together across different families.</p><p><a href="/fragrance-finder/">Try the scent finder</a> for browsing suggestions based on these lists. It is a starting point, rather than a formulation guarantee or a substitute for experiencing a fragrance.</p><h2>Ask when the details differ.</h2><p>Some original descriptions and listed notes are inconsistent. These are flagged for review. Confirm the specific fragrance composition before making a decision.</p>`,
  },
];
await fs.writeFile('src/data/pages.json', JSON.stringify(pages, null, 2));
const inventory = JSON.parse(await fs.readFile('docs/migration/source-inventory.json', 'utf8'));
const aliases = new Map();
const known = new Set([
  '/',
  ...pages.map((p) => '/' + p.slug + '/'),
  '/contact/',
  '/fragrance-finder/',
  '/search/',
  '/journal/',
  '/site-map/',
  '/collections/all/',
  '/collections/shop/',
  '/collections/scents/',
  '/collections/scent-diffusers/',
  '/collections/candles/',
]);
const catalog = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
catalog.forEach((p) => known.add(`/products/${p.handle}/`));
for (const r of inventory) {
  if (r.status === 'retired' || r.status === 'inaccessible') continue;
  const u = new URL(r.source);
  let sourcePath = u.pathname;
  const isES = /^\/es(?:\/|$)/.test(sourcePath);
  let p = sourcePath.replace(/^\/es(?=\/|$)/, '').replace(/\/$/, '') || '/';
  let target = '';
  let reason = 'Preserved as a dedicated static page.';
  if (p.startsWith('/products/')) target = p + '/';
  else if (p.startsWith('/scents/'))
    target =
      '/products/' +
      p.split('/').pop().replace('bois-tibet', 'boix-tibet').replace('cuir-onyx-5', 'cuir-onyx') +
      '/';
  else if (p.startsWith('/collections/'))
    target = ['all', 'scents', 'scent-diffusers', 'candles', 'shop'].includes(p.split('/').pop())
      ? p + '/'
      : '/collections/scents/';
  else if (p === '/' || p === '/canada') target = p === '/' ? '/' : '/about/';
  else if (/fragrance-finder|perfect-fragrance/.test(p)) target = '/fragrance-finder/';
  else if (/scent-library/.test(p)) target = '/collections/scents/';
  else if (/business-service\/scent-branding/.test(p)) target = '/scent-branding/';
  else if (/business-service\/odor-elimination/.test(p)) target = '/odor-elimination/';
  else if (/business-service\/private-label/.test(p)) target = '/custom-fragrances/';
  else if (/avada-sitemap/.test(p)) target = '/site-map/';
  else if (/privacy|terms/.test(p)) target = p.includes('privacy') ? '/privacy/' : '/terms/';
  else if (/return-policy|shipping-policy/.test(p)) target = '/terms/';
  else if (/about/.test(p)) target = '/about/';
  else if (/contact/.test(p)) target = '/contact/';
  else if (/search/.test(p)) target = '/search/';
  else if (/business-scenting/.test(p)) target = '/business-scenting/';
  else if (/home-scenting|fragrance-for-home|hotel-fragrances/.test(p)) target = '/home-scenting/';
  else if (/blogs\/news/.test(p)) target = '/journal/';
  else if (p === '/shop') target = '/collections/all/';
  else if (/small-space-scent-diffuser/.test(p)) {
    target = '/collections/scent-diffusers/';
    reason =
      'Legacy Sensorie model archived; not part of the live shop catalog. Replaced with current diffuser comparison.';
  } else if (/author\//.test(p)) {
    r.status = 'archived';
    r.destination = null;
    r.reason = 'Empty author archive (No Results Found), not useful customer content.';
    continue;
  } else if (/agents\.md|llms\.txt|\.well-known/.test(p)) {
    r.status = 'retired';
    r.destination = null;
    r.reason =
      'Machine/commerce discovery endpoint; not customer content. Archived as untrusted source material.';
    continue;
  } else if (/thank-you-page/.test(p)) {
    r.status = 'retired';
    r.destination = null;
    r.reason = 'Old submission confirmation; demo never claims a message was delivered.';
    continue;
  }
  if (!target) throw Error(`Unmapped route ${r.source}`);
  if (isES) {
    r.status = 'archived';
    r.destination = target;
    r.reason =
      'Genuine Spanish source retained verbatim in the local source snapshot for translation handoff. Canadian demo is English; no invented equivalent or hreflang.';
    continue;
  }
  r.destination = target;
  r.status = p + '/' === target || p === target ? 'complete' : 'adapted';
  if (/policy|terms|privacy/.test(p)) {
    r.status = 'adapted';
    reason =
      'Original US commerce/legal copy archived. Replaced with accurate Canadian demo-only information; no US policy promises.';
  }
  if (/business-service/.test(p)) {
    r.status = 'adapted';
    reason =
      'Standalone source is lorem ipsum. Useful service content migrated from the main business-scenting page.';
  }
  if (/fragrance-finder/.test(p)) {
    r.status = 'adapted';
    reason =
      'Original multi-page questionnaire consolidated into note-based discovery without data collection; source questionnaire archived.';
  }
  if (/collections\/(?!scents|scent-diffusers|all|shop|candles)/.test(p)) {
    r.status = 'adapted';
    reason =
      'Legacy business-site taxonomy consolidated into the complete fragrance collection; source classification preserved in archive.';
  }
  r.reason = reason;
  const alias = sourcePath.replace(/\/$/, '') + '/';
  if (alias !== target && !known.has(alias) && !aliases.has(alias))
    aliases.set(alias, {
      slug: alias.slice(1, -1),
      target,
      title: r.title || 'Explore Parfumaire',
      reason,
    });
}
await fs.writeFile('docs/migration/source-to-canada.json', JSON.stringify(inventory, null, 2));
await fs.writeFile('src/data/aliases.json', JSON.stringify([...aliases.values()], null, 2));
await fs.writeFile(
  'docs/migration/demo-to-production.json',
  JSON.stringify(
    [...known].map((route) => ({
      route,
      demo: 'https://parfumairecanada.sugiweb.com' + route,
      production: null,
      status: 'Production hostname pending; preserve path on future host.',
    })),
    null,
    2,
  ),
);
await fs.writeFile(
  'docs/migration/adaptations.json',
  JSON.stringify(
    {
      date: new Date().toISOString(),
      global: [
        'US commerce copy, subscription purchasing and fulfilment promises archived and not published as Canadian commitments.',
        'Performance percentages, health claims, pure-essential-oil claims and exact Canadian service availability withheld pending evidence.',
        'Spanish translations preserved in archive; English Canadian demo has no hreflang.',
        'Business service placeholder posts replaced with meaningful content from the business-scenting page.',
        'New scent-journal articles are factual comparisons derived from product records; the source news blog was empty.',
        'Photos remain authentic. Legacy product imagery is not presented as a currently available product.',
      ],
      products: catalog
        .filter((p) => p.flags.length)
        .map((p) => ({ handle: p.handle, flags: p.flags })),
      pages: pages.map((p) => ({
        destination: '/' + p.slug + '/',
        status: 'adapted',
        source: ['privacy', 'terms', 'faq'].includes(p.slug)
          ? 'New demo-specific content; original policies archived.'
          : p.slug.startsWith('journal/')
            ? 'New editorial comparison based on catalog facts.'
            : 'Original Parfumaire brand/business content, with unsupported claims and Canadian promises omitted.',
      })),
    },
    null,
    2,
  ),
);
console.log('Prepared', pages.length, 'content pages and', aliases.size, 'legacy route pages.');
