// Shop details used across the site.
// Leave a social link as "" to hide it.

const SITE_CONFIG = {
  name: "Ben's Fry",
  tagline: "Good Food, Good Mood",
  signoff: "Good food, made with love.",

  phone: {
    display: "011-33168215",
    international: "601133168215",
  },
  whatsapp: {
    message: "Hi Ben's Fry! I'd like to ask about your menu.",
  },

  address: {
    line1: "No. 41A, Jalan Jambu 5",
    line2: "Taman Kota Masai",
    city: "Pasir Gudang",
    state: "Johor",
    postcode: "",
  },

  // TODO: paste the shop's Google Maps share link / embed link here
  maps: {
    directionsUrl: "",
    embedUrl: "",
  },

  // 24h format, use null for closed days
  timezone: "Asia/Kuala_Lumpur",
  hours: [
    { day: "Monday", open: "11:00", close: "23:00" },
    { day: "Tuesday", open: "11:00", close: "23:00" },
    { day: "Wednesday", open: "11:00", close: "23:00" },
    { day: "Thursday", open: "11:00", close: "23:00" },
    { day: "Friday", open: "11:00", close: "23:00" },
    { day: "Saturday", open: "11:00", close: "23:00" },
    { day: "Sunday", open: "11:00", close: "23:00" },
  ],
  hoursSummary: "Daily | 11:00 AM – 11:00 PM",

  socialHandle: "@bensfry",
  social: {
    instagram: "https://www.instagram.com/bensfry",
    tiktok: "https://www.tiktok.com/@bens.fry",
    threads: "https://www.threads.net/@bensfry",
    facebook: "",
  },

  menuLastUpdated: "",
};

(function (cfg) {
  const a = cfg.address;
  const fullAddress = [a.line1, a.line2, [a.postcode, a.city].filter(Boolean).join(" "), a.state]
    .filter(Boolean)
    .join(", ");
  const query = encodeURIComponent(`${cfg.name}, ${fullAddress}`);

  cfg.derived = {
    fullAddress,
    telUrl: `tel:+${cfg.phone.international}`,
    whatsappUrl: `https://wa.me/${cfg.phone.international}?text=${encodeURIComponent(cfg.whatsapp.message)}`,
    directionsUrl: cfg.maps.directionsUrl || `https://www.google.com/maps/search/?api=1&query=${query}`,
    wazeUrl: `https://waze.com/ul?q=${query}&navigate=yes`,
    embedUrl: cfg.maps.embedUrl || `https://www.google.com/maps?q=${query}&output=embed`,
    year: new Date().getFullYear(),
  };
})(SITE_CONFIG);