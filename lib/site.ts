// Central contact and company details.
export const site = {
 address: 'Daugavas iela 1A, Smiltene, LV-4729',
 addressShort: 'Daugavas iela 1A, Smiltene',
 coords: { lat: 57.426145, lng: 25.900276 },
 phone: '+371 22 33 44 55',
 email: 'info@gym82.lv',
 hours: '05:00–24:00',
 company: {
  name: 'SIA “LatLA ECO”',
  regNo: '40203646557',
  vatNo: 'LV40203646557',
  legalAddress: 'Rīgas iela 64–3, Smiltene, Smiltenes nov., LV-4729',
 },
};

export const WAZE_URL = `https://waze.com/ul?ll=${site.coords.lat},${site.coords.lng}&navigate=yes`;
export const MAPS_URL = 'https://maps.app.goo.gl/ZUUwwFeaDZMvB2Vq6';
export const MAPS_EMBED_URL = `https://maps.google.com/maps?q=${site.coords.lat},${site.coords.lng}&z=17&hl=lv&output=embed`;
