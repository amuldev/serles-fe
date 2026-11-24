// Delivery area pages. Distances: OSRM driving routes from the bakery point
// (plus code 6JWVX77J+CH) to OpenStreetMap town/village points; the first
// five measured 2 Nov 2026, the rest 24 Nov 2026 after the limit became 30 km.
// Copy rule (24 Nov 2026 review): lead with "yes, we deliver", the distance
// and the estimated charge; keep caveats to one plain line.
export const DELIVERY_AREA_PAGES = [
  {
    slug: 'panpoli', name: 'Panpoli', aliases: 'Also spelled Panpozhi', km: 9.6,
    latitude: 9.0201842, longitude: 77.2529538,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Panpoli (also spelled Panpozhi) and the villages around it.',
    heading: 'Ordering for Panpoli',
    paragraphs: [
      'If you use Panpoli as the landmark for a smaller village nearby, send that village name and a map pin, so we quote the right charge.',
      'For an event at a hall, share the hall name, entrance and cake-cutting time. For a custom design, attach a reference picture.',
    ],
    question: 'Do you also deliver to Mekkarai?',
    answer: 'Yes. Mekkarai is about 16 km by road from the bakery, a little further than Panpoli, so the charge is a little higher. Send your pin and we confirm it.',
    related: ['mekkarai', 'pudur-sengottai'],
  },
  {
    slug: 'pudur-sengottai', name: 'Pudur near Sengottai', aliases: 'Pudur, Shencottai area', km: 8.6,
    latitude: 8.9960723, longitude: 77.2153924,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Pudur near Sengottai (Shencottai).',
    heading: 'Ordering for Pudur',
    paragraphs: [
      'There is more than one Pudur in the region, so please add "Sengottai" and a map pin when you message us.',
      'Kattalai Kudiyiruppu nearby is also in our area (about 7 km by road). Send your own address so we quote the right charge.',
      'Ordering for family from another city? Agree the delivery pin with the person receiving the cake, then share their contact with us on WhatsApp.',
    ],
    question: 'Is this the same as Puttur?',
    answer: 'No. This page is for Pudur near Sengottai in Tenkasi district. For any other place, send the pin and we will check it.',
    related: ['puliyarai', 'panpoli'],
  },
  {
    slug: 'puliyarai', name: 'Puliyarai', aliases: 'Shencottai area', km: 12.0,
    latitude: 9.0043321, longitude: 77.1884827,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Puliyarai village.',
    heading: 'Ordering for Puliyarai',
    paragraphs: [
      'Some maps label the forest checkpoint area as Puliyarai too. Send your home or venue pin so we quote the charge for the right place.',
      'For tiered or delicate designs, tell us the cake-cutting time and whether someone will be ready to receive the cake.',
    ],
    question: 'Can you deliver beyond Puliyarai?',
    answer: 'Anywhere within 30 km by road of the bakery. Send the exact pin and we confirm it before you pay.',
    related: ['pudur-sengottai', 'panpoli'],
  },
  {
    slug: 'melagaram', name: 'Melagaram', aliases: 'Tenkasi–Courtallam area', km: 5.0,
    latitude: 8.9507, longitude: 77.2960936,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Melagaram, one of the closest areas to us.',
    heading: 'Ordering for Melagaram',
    paragraphs: [
      'Melagaram is right at the edge of our first-5-km zone, so most addresses pay the base ₹50 delivery. Share your street or venue pin and we confirm.',
      'If your gathering starts before the cake-cutting, tell us both times so the cake arrives fresh and on time.',
    ],
    question: 'Will I pay only ₹50?',
    answer: 'Usually, yes. If your address is just past 5 km by road, it is ₹10 for each extra kilometre. We tell you the exact amount before you pay.',
    related: ['panpoli', 'pudur-sengottai'],
  },
  {
    slug: 'mekkarai', name: 'Mekkarai', aliases: 'Also spelled Mekarai', km: 16.1,
    latitude: 9.060605, longitude: 77.21893,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Mekkarai village.',
    heading: 'Ordering for Mekkarai',
    paragraphs: [
      'Send your home or venue pin rather than the dam or a landmark, so we quote the charge for your actual address.',
      'For photo, themed or tiered cakes, share the design early; Mekkarai is a longer route, so we plan the bake and the journey together.',
    ],
    question: 'Do you deliver near Mekkarai dam?',
    answer: 'We deliver to addresses within 30 km by road. Send the exact pin for your venue and we confirm it on WhatsApp.',
    related: ['panpoli', 'puliyarai'],
  },
  {
    slug: 'kadayanallur', name: 'Kadayanallur', aliases: 'Also spelled Kadaiyanallur', km: 16.7,
    latitude: 9.084205, longitude: 77.346196,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Kadayanallur.',
    heading: 'Ordering for Kadayanallur',
    paragraphs: [
      'Kadayanallur is a large town, so the distance to your door can differ from the town centre by a few kilometres. Share a map pin and a landmark.',
      'For a birthday or function at a hall, send the hall name, entrance and cake-cutting time.',
    ],
    question: 'Can you deliver to the outskirts of Kadayanallur?',
    answer: 'Yes, anywhere within 30 km by road of the bakery. Further addresses cost ₹10 per extra kilometre; we confirm the exact amount on WhatsApp.',
    related: ['achanpudur', 'vadakarai'],
    guide: { href: '/blog/cake-delivery-in-kadayanallur', label: 'Kadayanallur cake delivery guide' },
  },
  {
    slug: 'pavoorchatram', name: 'Pavoorchatram', aliases: 'Also spelled Pavoor Chatram', km: 13.4,
    latitude: 8.916431, longitude: 77.381306,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Pavoorchatram and nearby villages.',
    heading: 'Ordering for Pavoorchatram',
    paragraphs: [
      'Ordering for a village near Pavoorchatram, such as Keelapavoor (about 15 km from the bakery)? Send that village name and its pin.',
      'For photo, themed or tiered cakes, share your design reference early so we can plan the bake.',
    ],
    question: 'Do you deliver to Keelapavoor?',
    answer: 'Yes, Keelapavoor is within our 30 km area. The charge is a little higher than Pavoorchatram; we confirm it on WhatsApp.',
    related: ['surandai', 'melagaram'],
  },
  {
    slug: 'surandai', name: 'Surandai', aliases: 'Tenkasi district', km: 19.6,
    latitude: 8.977778, longitude: 77.420073,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Surandai.',
    heading: 'Ordering for Surandai',
    paragraphs: [
      'Surandai is one of our longer routes, so leave some time between delivery and the cake-cutting, and tell us when someone will be home to receive it.',
      'Cream cakes travel best when they go straight into a fridge; ask us for handling tips for your cake.',
    ],
    question: 'Can I get same-day delivery to Surandai?',
    answer: 'Often, yes. Every cake is baked fresh after you order, so message us at least 4 hours before you need it and we confirm the time.',
    related: ['pavoorchatram', 'kadayanallur'],
  },
  {
    slug: 'achanpudur', name: 'Achanpudur', aliases: 'Also spelled Achampudur', km: 11.0,
    latitude: 9.040127, longitude: 77.29828,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Achanpudur.',
    heading: 'Ordering for Achanpudur',
    paragraphs: [
      'Village roads can make two nearby homes quite different by road, so send a map pin and a landmark.',
      'Pick the cake and size, then tell us the message, date and cake-cutting time on WhatsApp.',
    ],
    question: 'How soon can I get a cake in Achanpudur?',
    answer: 'Every cake is baked fresh after you order. Message us at least 4 hours before you need it; tier and custom designs may need longer.',
    related: ['vadakarai', 'kadayanallur'],
  },
  {
    slug: 'vadakarai', name: 'Vadakarai', aliases: 'Near Shencottai', km: 13.5,
    latitude: 9.040151, longitude: 77.273726,
    intro: 'We deliver homemade cakes from our Ilanji bakery to Vadakarai near Shencottai.',
    heading: 'Ordering for Vadakarai',
    paragraphs: [
      'For a family function, tell us the guest count and cake-cutting time and we will suggest a size.',
      'Sambavar Vadakarai, on the Surandai side, is a different village (about 17 km from the bakery). We deliver there too; include the full name and a pin.',
    ],
    question: 'Do you deliver to Sambavar Vadakarai?',
    answer: 'Yes. It is about 17 km by road, so delivery is about ₹170. We confirm the exact charge on WhatsApp.',
    related: ['achanpudur', 'puliyarai'],
  },
];

export const deliveryAreaPath = area => `/cake-delivery/${area.slug}`;
export const findDeliveryArea = slug => DELIVERY_AREA_PAGES.find(area => area.slug === slug);
