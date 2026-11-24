// Route research: OSM village/town points, not blanket address coverage.
// First five pages 2 Nov 2026; Kadayanallur and nearby towns added 24 Nov 2026
// after the limit rose to 30 km (OSRM driving routes from the bakery point).
// Origin is the centre of the bakery's known plus code 6JWVX77J+CH.
export const DELIVERY_AREA_PAGES = [
  {
    slug: 'panpoli', name: 'Panpoli', aliases: 'Panpozhi', km: 9.6,
    latitude: 9.0201842, longitude: 77.2529538,
    intro: 'Planning a cake for Panpoli, also called Panpozhi? Send your village address or venue pin to our bakery in Ilanji. The driving-route estimate to the mapped Panpoli village point is about 9.6 km; the route to your door is checked separately.',
    heading: 'Panpoli and the destination beyond the town name',
    paragraphs: [
      'If Panpoli is the landmark you use for a smaller settlement, include that settlement and its map pin as well. A route to Panpoli does not establish the distance to a house further along the road. Tell us the destination before choosing the delivery arrangements.',
      'For an event at a hall, send the hall name, its entrance and the cake-cutting time. If you are ordering a custom design, attach a reference and say which parts matter most. We will check the design, date and address together before confirming availability.',
    ],
    question: 'Does the Panpoli route cover Mekkarai too?',
    answer: 'No. They are separate destinations. Our Mekkarai guide uses a separate village-point route. Send the actual delivery pin so we can check it against the 30 km road limit.',
    related: ['mekkarai', 'pudur-sengottai'],
    checked: '2 November 2026',
  },
  {
    slug: 'pudur-sengottai', name: 'Pudur near Sengottai', aliases: 'Pudur (S), Shencottai area', km: 8.6,
    latitude: 8.9960723, longitude: 77.2153924,
    intro: 'This guide is for the mapped Pudur village in the Shenkottai area of Tenkasi district. The driving-route estimate from our Ilanji bakery to that village point is about 8.6 km. Share your exact address so we can confirm that it is the same Pudur and check the final route.',
    heading: 'Make sure we are discussing the right Pudur',
    paragraphs: [
      'Pudur is a name used by more than one settlement. Please include Sengottai or Shencottai, your postcode where known, and a map pin in the order conversation. This page does not refer to Puttur in Karnataka or confirm that every similarly written village is the same destination.',
      'Kattalai Kudiyiruppu is another local destination to identify separately. A public location listed in a Tamil Nadu health-department document gives a driving-route estimate of about 7.2 km from the bakery coordinates (checked 2 November 2026). That is a route to the public point, not every home in the settlement. Send your own address rather than using the Pudur village estimate for it.',
      'If a relative is placing the order from another city, agree the delivery pin with the person receiving the cake before sending it to us. A local contact can explain the entrance or nearby landmark. Share their contact privately in the WhatsApp order conversation.',
    ],
    question: 'Is this the same place as every Puttur search result?',
    answer: 'No. This page refers only to the mapped Pudur near Sengottai in Tenkasi district. For another spelling or settlement, send the pin and ask us to check it.',
    related: ['puliyarai', 'panpoli'],
    checked: '2 November 2026',
  },
  {
    slug: 'puliyarai', name: 'Puliyarai', aliases: 'Shenkottai area, Tenkasi district', km: 12.0,
    latitude: 9.0043321, longitude: 77.1884827,
    intro: 'For a celebration in Puliyarai, check the destination with Serle’s Bake in Ilanji before arranging your cake. A driving route to the mapped Puliyarai village point is about 12.0 km. This is a village-point estimate, not a promise for every address beyond it.',
    heading: 'Use your destination, rather than a road or forest-area label',
    paragraphs: [
      'Some map and travel results use a Puliyarai forest-area or road endpoint rather than the village. The estimate on this page uses the mapped village point. Send the home or venue pin for your order, especially if Puliyarai is only a landmark on the way.',
      'For a fragile or tiered design, discuss the final handover and storage before confirming. Tell us the cake-cutting time and whether someone will be ready to receive the cake. If any access arrangement or restriction applies to your destination, explain it when you enquire so that we can check feasibility.',
    ],
    question: 'Can a cake be delivered further along my journey?',
    answer: 'We check the actual destination against the 30 km road limit from Ilanji. A route passing through Puliyarai does not confirm delivery to a further stop. Ask before making plans or payment.',
    related: ['pudur-sengottai', 'panpoli'],
    checked: '2 November 2026',
  },
  {
    slug: 'melagaram', name: 'Melagaram', aliases: 'Tenkasi–Courtallam area', km: 5.0,
    latitude: 8.9507, longitude: 77.2960936,
    intro: 'Ordering a cake for Melagaram? Our bakery is in Ilanji, and the driving-route estimate to the mapped Melagaram village point is about 5.0 km. Send your home, hall or other venue pin so we can check the actual distance, availability and charge.',
    heading: 'Check the entrance and handover for your Melagaram address',
    paragraphs: [
      'A broader Tenkasi or Courtallam address may not identify the precise entrance in Melagaram. Give us the street or venue name alongside the pin. The published first-5-km delivery rate is applied to the checked route, not automatically to every order using the Melagaram name.',
      'If your gathering starts before the cake-cutting, tell us both times so we can discuss the handover. Ask the recipient or venue where the cake can be kept until serving. Agree the cake message, preferred weight and design before you confirm the order.',
    ],
    question: 'Does a 5 km village estimate guarantee the first-zone delivery charge?',
    answer: 'No. Your final address can be closer or further away than the mapped point. We check the road distance and quote the delivery charge for that address before confirming.',
    related: ['panpoli', 'pudur-sengottai'],
    checked: '2 November 2026',
  },
  {
    slug: 'mekkarai', name: 'Mekkarai', aliases: 'Mekarai, Mekkara', km: 16.1,
    latitude: 9.060605, longitude: 77.21893,
    intro: 'For Mekkarai cake enquiries, send your exact destination to our Ilanji bakery. The driving-route estimate to the mapped Mekkarai village point is about 16.1 km, within the 30 km limit at that point. Addresses beyond the village point need their own route check.',
    heading: 'Mekkarai village and other Mekkara endpoints need separate checks',
    paragraphs: [
      'A search result for a dam, a road or a nearby locality can describe a different endpoint from Mekkarai village. This page uses the village coordinates shown below. Include your venue or home pin instead of asking us to infer it from a similarly named attraction.',
      'Because the remaining distance from the village to your address matters to the 30 km boundary, confirm coverage before settling the cake and payment. Tell us if the recipient needs a particular handover point. For photo, themed or tiered cakes, discuss the design and transport arrangements early; the route estimate is not a delivery-time promise.',
    ],
    question: 'Does a route to Mekkara dam confirm my delivery?',
    answer: 'No. A dam route and a village-address route can have different endpoints. Send your actual destination and we will check the road distance from the bakery and the available arrangements.',
    related: ['panpoli', 'puliyarai'],
    checked: '2 November 2026',
  },
  {
    slug: 'kadayanallur', name: 'Kadayanallur', aliases: 'Kadaiyanallur, Tenkasi district', km: 16.7,
    latitude: 9.084205, longitude: 77.346196, checked: '24 November 2026',
    intro: 'Ordering a cake for Kadayanallur? Our bakery in Ilanji delivers there: the driving route to the mapped town point is about 16.7 km, comfortably inside our 30 km limit. Send your street or venue pin on WhatsApp and we confirm the exact route and charge.',
    heading: 'Kadayanallur is a large town, so your pin matters',
    paragraphs: [
      'Kadayanallur spreads across many streets and wards, and the distance to your door can differ from the town point by a few kilometres either way. Share a map pin rather than only the town name, and add a landmark for the delivery person.',
      'For a birthday or function at a hall, send the hall name, the entrance and the cake-cutting time. Choose the cake and size first, then we check the design, date and delivery together before confirming.',
    ],
    question: 'How much is delivery to Kadayanallur?',
    answer: 'At the published rate, delivery to the mapped town point works out to about ₹170 (₹50 for the first 5 km, then ₹10 per km). Your exact address can be a little closer or further, so we quote the final charge on WhatsApp before you pay.',
    related: ['achanpudur', 'vadakarai'],
    guide: { href: '/blog/cake-delivery-in-kadayanallur', label: 'Kadayanallur cake delivery guide' },
  },
  {
    slug: 'pavoorchatram', name: 'Pavoorchatram', aliases: 'Pavoor Chatram, Tenkasi district', km: 13.4,
    latitude: 8.916431, longitude: 77.381306, checked: '24 November 2026',
    intro: 'Planning a cake for Pavoorchatram? The driving route from our Ilanji bakery to the mapped Pavoorchatram town point is about 13.4 km, inside our 30 km delivery limit. Send your exact address or venue pin and we check the route and charge before you order.',
    heading: 'Pavoorchatram and the villages around it',
    paragraphs: [
      'Pavoorchatram is often used as the landmark for nearby villages such as Keelapavoor (about 15.3 km by road from the bakery). If you are ordering for one of them, give that village name and its pin, not just Pavoorchatram.',
      'Tell us the cake-cutting time and who will receive the cake. For photo, themed or tiered cakes, send your design reference early so we can plan the bake and the journey.',
    ],
    question: 'How much is delivery to Pavoorchatram?',
    answer: 'At the published rate, delivery to the mapped town point works out to about ₹130. We confirm the exact charge for your address on WhatsApp before you pay.',
    related: ['surandai', 'melagaram'],
  },
  {
    slug: 'surandai', name: 'Surandai', aliases: 'Tenkasi district', km: 19.6,
    latitude: 8.977778, longitude: 77.420073, checked: '24 November 2026',
    intro: 'Ordering a cake for Surandai? Our Ilanji bakery delivers within 30 km by road, and the driving route to the mapped Surandai town point is about 19.6 km. Share your address or map pin on WhatsApp so we can confirm the route and the charge.',
    heading: 'Plan a little extra time for Surandai',
    paragraphs: [
      'Surandai is one of the longer routes in our area, so allow time between the delivery and your cake-cutting. Send both the event time and when someone will be available to receive the cake.',
      'Cream cakes travel best when they can go straight into a fridge. Ask us for handling advice for the cake you choose, especially for an afternoon delivery.',
    ],
    question: 'How much is delivery to Surandai?',
    answer: 'At the published rate, delivery to the mapped town point works out to about ₹200. We quote the final charge for your exact address on WhatsApp before you pay.',
    related: ['pavoorchatram', 'kadayanallur'],
  },
  {
    slug: 'achanpudur', name: 'Achanpudur', aliases: 'Achampudur, Shenkottai taluk', km: 11.0,
    latitude: 9.040127, longitude: 77.29828, checked: '24 November 2026',
    intro: 'Cake for Achanpudur? The driving route from our Ilanji bakery to the mapped Achanpudur village point is about 11.0 km, well within our 30 km limit. Send your house or venue pin and we confirm the route and charge before you order.',
    heading: 'Send your pin, not just the village name',
    paragraphs: [
      'Village roads around Achanpudur can make two nearby addresses quite different by road. A map pin and a landmark help us quote the right charge and find you on the day.',
      'Pick the cake and size first, then tell us the message, date and cake-cutting time. We check the design and delivery together and confirm everything in the chat.',
    ],
    question: 'How much is delivery to Achanpudur?',
    answer: 'At the published rate, delivery to the mapped village point works out to about ₹110. We confirm the exact charge for your address on WhatsApp before you pay.',
    related: ['vadakarai', 'kadayanallur'],
  },
  {
    slug: 'vadakarai', name: 'Vadakarai', aliases: 'Vadakarai near Shenkottai (not Sambavar Vadakarai)', km: 13.5,
    latitude: 9.040151, longitude: 77.273726, checked: '24 November 2026',
    intro: 'This page is for Vadakarai in Shenkottai taluk. The driving route from our Ilanji bakery to the mapped village point is about 13.5 km, inside our 30 km limit. Send your exact address or pin so we can confirm it is the same Vadakarai and check the route.',
    heading: 'Which Vadakarai are you ordering for?',
    paragraphs: [
      'Sambavar Vadakarai, on the Surandai side, is a different place (about 17 km by road from the bakery). Both are inside our delivery area, but the charge differs, so include the full place name and a map pin.',
      'For a family function, tell us the guest count and the cake-cutting time. We can suggest a size and confirm the design, date and delivery before you pay.',
    ],
    question: 'How much is delivery to Vadakarai?',
    answer: 'At the published rate, delivery to the mapped village point works out to about ₹140 (and about ₹170 to Sambavar Vadakarai). We quote the exact charge for your address on WhatsApp.',
    related: ['achanpudur', 'puliyarai'],
  },
];

export const deliveryAreaPath = area => `/cake-delivery/${area.slug}`;
export const findDeliveryArea = slug => DELIVERY_AREA_PAGES.find(area => area.slug === slug);
