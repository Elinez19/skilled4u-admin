export interface ArtisanMarqueeItem {
  id: string;
  title: string;
  provider: string;
  area: string;
  price: string;
  fromFee: string;
  rating: string;
  reviews: number;
  eta: string;
  badgeText: string;
  image: string;
  tiltDeg: number;
}

export interface ServiceCategoryItem {
  id: string;
  title: string;
  description: string;
  startingPrice: string;
  etaBadge: string;
  image: string;
  popularTags: string[];
}

export interface FloatingNotificationItem {
  id: string;
  title: string;
  subtitle: string;
  tone: "blue" | "ink" | "sapphire";
  iconType: "scooter" | "gift" | "tag" | "check";
  position: "top-left" | "bottom-left" | "top-right" | "bottom-right";
  tiltDeg: number;
}

export interface AbujaBubbleItem {
  id: string;
  name: string;
  xPercent: number;
  yPercent: number;
  size: "md" | "lg";
}

export interface TestimonialItem {
  id: string;
  type: "quote" | "story";
  quote?: string;
  authorName: string;
  authorRole: string;
  area: string;
  storyTitle?: string;
  storyTrade?: string;
  tiltDeg: number;
}

export interface WhatsNewItem {
  id: string;
  category: string;
  title: string;
  description: string;
  visualType: "reward" | "phones" | "emblem";
}

export interface AudienceItem {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaVariant: "primary" | "secondary";
  image: string;
  slabTone: "blue" | "ink" | "sapphire";
}

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

export const landingContent = {
  preloader: {
    brandName: "skilled4U",
    tagline: "Trusted Artisans · Right on Time",
  },
  navbar: {
    links: [
      { label: "Home", href: "#top" },
      { label: "Services", href: "#services" },
      { label: "Artisans", href: "#artisans" },
      { label: "Coverage", href: "#coverage" },
      { label: "FAQs", href: "#faqs" },
    ],
    primaryCta: "Play Store",
    secondaryCta: "Download App",
  },
  hero: {
    eyebrow: "Verified Artisans · Fast Arrival Across Abuja",
    headlineLine1: "Broken Pipe or AC?",
    headlineLine2: "Fixed in Minutes.",
    subtitle:
      "Book top-rated plumbers, electricians, carpenters, and AC technicians near you in seconds.",
    primaryCta: "Download on App Store",
    secondaryCta: "Download on Play Store",
    marqueeCards: [
      {
        id: "ac-refill",
        title: "AC Gas Refill & Service",
        provider: "CoolBreeze Tech",
        area: "Wuse II",
        price: "₦14,000",
        fromFee: "Callout from ₦1,500",
        rating: "4.9",
        reviews: 210,
        eta: "20 Min",
        badgeText: "Free Inspection",
        image: "/images/landing/service-ac.jpg",
        tiltDeg: -4,
      },
      {
        id: "pipe-leak",
        title: "Emergency Pipe & Leak Fix",
        provider: "Master Emeka",
        area: "Maitama",
        price: "₦15,000",
        fromFee: "Callout from ₦1,500",
        rating: "4.8",
        reviews: 185,
        eta: "18 Min",
        badgeText: "Free Inspection",
        image: "/images/landing/service-plumbing.svg",
        tiltDeg: 3.5,
      },
      {
        id: "carpentry-doors",
        title: "Custom Wardrobe & Doors",
        provider: "WoodCraft Studio",
        area: "Gwarinpa",
        price: "₦20,000",
        fromFee: "Callout from ₦2,000",
        rating: "4.9",
        reviews: 164,
        eta: "30 Min",
        badgeText: "Free Inspection",
        image: "/images/landing/service-carpentry.svg",
        tiltDeg: -3,
      },
      {
        id: "inverter-solar",
        title: "Inverter & Wiring Setup",
        provider: "BrightSpark Pros",
        area: "Asokoro",
        price: "₦12,000",
        fromFee: "Callout from ₦1,500",
        rating: "4.8",
        reviews: 192,
        eta: "25 Min",
        badgeText: "Free Inspection",
        image: "/images/landing/service-electrical.svg",
        tiltDeg: 4,
      },
      {
        id: "deep-clean",
        title: "Full Home Deep Clean",
        provider: "Sparkle Crew",
        area: "Jabi",
        price: "₦18,000",
        fromFee: "Callout from ₦1,000",
        rating: "4.9",
        reviews: 240,
        eta: "25 Min",
        badgeText: "Free Inspection",
        image: "/images/landing/service-cleaning.svg",
        tiltDeg: -3.5,
      },
      {
        id: "tv-mounting",
        title: "Wall TV Mounting & Setup",
        provider: "FixIt Express",
        area: "Garki",
        price: "₦10,000",
        fromFee: "Callout from ₦1,000",
        rating: "4.7",
        reviews: 150,
        eta: "20 Min",
        badgeText: "Free Inspection",
        image: "/images/landing/service-electronics.svg",
        tiltDeg: 3,
      },
    ] satisfies ArtisanMarqueeItem[],
  },
  appShowcase: {
    headline: "An App For Every Home",
    subtitle:
      "Find the right artisan, discover top-rated specialists near you, and get every fix done smoothly with Skilled4U.",
    primaryCta: "Download on App Store",
    secondaryCta: "Download on Play Store",
    promoLine: "Download & get your first inspection free.",
    notifications: [
      {
        id: "notif-1",
        title: "Artisan On The Way",
        subtitle: "Emeka is heading to your address.",
        tone: "blue",
        iconType: "scooter",
        position: "top-left",
        tiltDeg: -5,
      },
      {
        id: "notif-2",
        title: "First Booking Bonus.",
        subtitle: "₦2,000 has been added to your wallet.",
        tone: "ink",
        iconType: "gift",
        position: "bottom-left",
        tiltDeg: 2,
      },
      {
        id: "notif-3",
        title: "Pro Assigned",
        subtitle: "Heading to your location in Wuse II.",
        tone: "ink",
        iconType: "check",
        position: "top-right",
        tiltDeg: -3,
      },
      {
        id: "notif-4",
        title: "20% Off AC Servicing",
        subtitle: "Offer expires in 2 hours",
        tone: "sapphire",
        iconType: "tag",
        position: "bottom-right",
        tiltDeg: 4,
      },
    ] satisfies FloatingNotificationItem[],
  },
  services: {
    eyebrow: "Popular Categories",
    headline: "Every Home & Office Fix Covered",
    subtitle:
      "Pick a category, see clear starting prices upfront, and book a verified professional in minutes.",
    items: [
      {
        id: "cat-ac",
        title: "AC & Refrigeration",
        description:
          "Complete split-unit AC servicing, gas refilling, freezer and cold-room repairs.",
        startingPrice: "From ₦14,000",
        etaBadge: "20 Min Arrival",
        image: "/images/landing/service-ac.jpg",
        popularTags: ["AC Gas Refill", "Split AC Install", "Fridge Repair"],
      },
      {
        id: "cat-carpentry",
        title: "Carpentry & Interiors",
        description:
          "Custom wardrobes, doors, kitchen cabinets, roofing, and wall TV mounting.",
        startingPrice: "From ₦20,000",
        etaBadge: "Same-Day Pro",
        image: "/images/landing/service-carpentry.svg",
        popularTags: ["Wardrobes", "Door Locks", "TV Mounting"],
      },
      {
        id: "cat-plumbing",
        title: "Plumbing Services",
        description:
          "Emergency leak repairs, water pumps, toilet fittings, and overhead tank washing.",
        startingPrice: "From ₦15,000",
        etaBadge: "18 Min Arrival",
        image: "/images/landing/service-plumbing.svg",
        popularTags: ["Leak Fixing", "Water Pump", "Bathroom Fittings"],
      },
      {
        id: "cat-cleaning",
        title: "Home & Office Cleaning",
        description:
          "Thorough deep cleaning, post-construction cleanup, and sofa upholstery washing.",
        startingPrice: "From ₦18,000",
        etaBadge: "25 Min Arrival",
        image: "/images/landing/service-cleaning.svg",
        popularTags: ["Deep Clean", "Move-In Clean", "Sofa Wash"],
      },
      {
        id: "cat-electronics",
        title: "Electronics & Appliances",
        description:
          "Smart TV diagnostics, home theatre setup, microwave and washing machine servicing.",
        startingPrice: "From ₦10,000",
        etaBadge: "20 Min Arrival",
        image: "/images/landing/service-electronics.svg",
        popularTags: ["Smart TV", "Sound Systems", "Washing Machine"],
      },
      {
        id: "cat-electrical",
        title: "Electrical & Solar",
        description:
          "Full house wiring, socket repairs, changeover switches, and solar inverter setups.",
        startingPrice: "From ₦12,000",
        etaBadge: "25 Min Arrival",
        image: "/images/landing/service-electrical.svg",
        popularTags: ["Inverter & Solar", "Fault Finding", "Lighting Setup"],
      },
    ] satisfies ServiceCategoryItem[],
  },
  coverage: {
    badge: "15+ Areas Covered",
    headline: "Trusted Across Abuja and Nigeria",
    subtitle:
      "From Wuse II to Maitama, Gwarinpa to Jabi, Skilled4U brings top-rated artisans wherever you need a hand.",
    comingSoonNote: "Lagos and Port Harcourt coming soon.",
    topBubbles: [
      { id: "wuse", name: "Wuse II", xPercent: 18, yPercent: 22, size: "lg" },
      { id: "maitama", name: "Maitama", xPercent: 52, yPercent: 18, size: "md" },
      { id: "jabi", name: "Jabi", xPercent: 82, yPercent: 24, size: "md" },
    ] satisfies AbujaBubbleItem[],
    bottomBubbles: [
      { id: "gwarinpa", name: "Gwarinpa", xPercent: 16, yPercent: 72, size: "md" },
      { id: "asokoro", name: "Asokoro", xPercent: 45, yPercent: 76, size: "md" },
      { id: "garki", name: "Garki", xPercent: 78, yPercent: 68, size: "lg" },
    ] satisfies AbujaBubbleItem[],
    stats: [
      { value: 2400, suffix: "+", label: "Verified Artisans" },
      { value: 15, suffix: "+", label: "Abuja Districts" },
      { value: 20, suffix: " Min", label: "Average Arrival" },
    ],
  },
  roadJourney: {
    headline: "Discover Abuja's Top-Rated Artisans",
    subtitle:
      "Book verified pros in your neighbourhood, track their arrival in real time, and get quality repairs done right at your door.",
    signposts: [
      { id: "sign-wuse", name: "Wuse II", direction: "right" as const, heightClass: "tall" as const },
      { id: "sign-maitama", name: "Maitama", direction: "right" as const, heightClass: "mid" as const },
      { id: "sign-gwarinpa", name: "Gwarinpa", direction: "right" as const, heightClass: "short" as const },
      { id: "sign-jabi", name: "Jabi", direction: "left" as const, heightClass: "short" as const },
    ],
  },
  testimonials: {
    headline: "What Abuja Is Saying",
    subtitle:
      "See why homeowners and offices across Abuja trust Skilled4U for fast arrival, great deals, and reliable repairs.",
    items: [
      {
        id: "test-1",
        type: "quote",
        quote:
          "Skilled4U is the best home service app and the fastest! I got a verified plumber in Wuse II in 20 minutes and their app has lots of discounts and offers.",
        authorName: "Amina Bello",
        authorRole: "Homeowner · Wuse II",
        area: "Wuse II",
        tiltDeg: -4,
      },
      {
        id: "test-2",
        type: "story",
        storyTitle: "Split AC Servicing",
        storyTrade: "CoolBreeze Tech · Maitama",
        authorName: "Chinedu O.",
        authorRole: "Verified Booking",
        area: "Maitama",
        tiltDeg: 3,
      },
      {
        id: "test-3",
        type: "story",
        storyTitle: "Emergency Pipe Repair",
        storyTrade: "Master Emeka · Wuse II",
        authorName: "Zainab M.",
        authorRole: "Verified Booking",
        area: "Wuse II",
        tiltDeg: -3,
      },
      {
        id: "test-4",
        type: "story",
        storyTitle: "Inverter & Solar Setup",
        storyTrade: "BrightSpark · Gwarinpa",
        authorName: "David A.",
        authorRole: "Verified Booking",
        area: "Gwarinpa",
        tiltDeg: 3.5,
      },
      {
        id: "test-5",
        type: "quote",
        quote:
          "Skilled4U is the best artisan app and the fastest! Our Maitama office uses them for AC servicing and electrical work every month.",
        authorName: "Tunde Okonkwo",
        authorRole: "Facility Manager · Maitama",
        area: "Maitama",
        tiltDeg: 4,
      },
    ] satisfies TestimonialItem[],
  },
  everythingYouNeed: {
    headline: "Everything You Need To Book Better",
    primaryCta: "Download on App Store",
    secondaryCta: "Download on Play Store",
    promoLine: "Download & get your first inspection free.",
    chips: [
      "Verified Pros",
      "Upfront Pricing",
      "Live Map Tracking",
      "20-Min Fast Arrival",
      "In-App Chat",
      "Top-Rated Artisans",
      "Easy Card & Transfer Pay",
    ],
  },
  whatsNew: {
    headline: "What's New on Skilled4U",
    subtitle:
      "Discover new service categories, exclusive offers, product updates, and everything happening on Skilled4U.",
    items: [
      {
        id: "new-1",
        category: "Offers",
        title: "Your First Booking Pays You Back",
        description:
          "At Skilled4U, we believe every home repair should come with an extra reason to smile. Enjoy ₦2,000 off your first service booking.",
        visualType: "reward",
      },
      {
        id: "new-2",
        category: "Product Update",
        title: "The All-New Skilled4U App Experience",
        description:
          "Booking a verified plumber, electrician, or AC technician should be fast, simple, and stress-free—and that's what the new Skilled4U app delivers.",
        visualType: "phones",
      },
      {
        id: "new-3",
        category: "Artisans",
        title: "500+ Top Abuja Master Artisans Now Live",
        description:
          "Renowned for fast arrival across Wuse II, Maitama, Gwarinpa, and Jabi, our newly onboarded technicians bring workshop quality to your door.",
        visualType: "emblem",
      },
    ] satisfies WhatsNewItem[],
  },
  joinYourWay: {
    headline: "Join Skilled4U Your Way.",
    subtitle:
      "Whether you're booking a home fix, growing your workshop, or earning on your schedule, there's a place for you on Skilled4U.",
    items: [
      {
        id: "join-customers",
        title: "For Customers",
        description:
          "Book top-rated artisans near you, see upfront prices, and enjoy fast, reliable home repairs wherever you are in Abuja.",
        ctaLabel: "Book Now",
        ctaVariant: "primary",
        image: "/images/landing/audience-customer.svg",
        slabTone: "blue",
      },
      {
        id: "join-artisans",
        title: "For Artisans",
        description:
          "Reach more customers across Abuja, manage every booking on your phone, and grow your business with Skilled4U.",
        ctaLabel: "Learn More",
        ctaVariant: "secondary",
        image: "/images/landing/audience-artisan.svg",
        slabTone: "ink",
      },
      {
        id: "join-businesses",
        title: "For Businesses",
        description:
          "Keep your offices, estates, and properties running smoothly on your schedule with dedicated, verified technicians.",
        ctaLabel: "Learn More",
        ctaVariant: "secondary",
        image: "/images/landing/audience-business.svg",
        slabTone: "sapphire",
      },
    ] satisfies AudienceItem[],
  },
  faqs: {
    headline: "Got Questions ?",
    subtitle:
      "Everything you need to know about booking, arrival times, payments, and using Skilled4U across Abuja and Nigeria.",
    moreCta: "See More FAQs",
    items: [
      {
        id: "faq-1",
        question: "How quickly does an artisan usually arrive?",
        answer:
          "Most artisans arrive within 20 to 45 minutes depending on your location in Abuja, the trade category, and current demand.",
      },
      {
        id: "faq-2",
        question: "Which areas do you currently serve?",
        answer:
          "We currently serve 15+ neighbourhoods across Abuja—including Wuse II, Maitama, Gwarinpa, Asokoro, Jabi, Garki, Utako, and Lugbe—with Lagos and Port Harcourt launching soon.",
      },
      {
        id: "faq-3",
        question: "Can I track my artisan in real time?",
        answer:
          "Yes! As soon as an artisan accepts your booking, you can follow their live arrival on the map and message or call them directly in the app.",
      },
      {
        id: "faq-4",
        question: "Can I book multiple services at once?",
        answer:
          "Absolutely. You can schedule an AC technician, a plumber, and a home cleaning crew for the same day or different times right from your Skilled4U app.",
      },
      {
        id: "faq-5",
        question: "Do you offer discounts or promo codes?",
        answer:
          "Yes! New customers enjoy a free first inspection and ₦2,000 bonus on their first booking, plus weekly deals on AC servicing and cleaning.",
      },
    ] satisfies FaqItemData[],
  },
  footer: {
    socialLabel: "Follow us on our socials",
    companyLinks: [
      { label: "Home", href: "#top" },
      { label: "Our Story", href: "#app-showcase" },
      { label: "Artisans", href: "#join" },
      { label: "Coverage", href: "#coverage" },
    ],
    quickLinks: [
      { label: "Terms of Services", href: "#faqs" },
      { label: "Privacy Policy", href: "#faqs" },
    ],
    helpDesk: {
      contactLabel: "Contact Us",
      email: "contact@skilled4u.ng",
      phone1: "+2349046044085",
      phone2: "+2349130009099",
    },
    wordmark: "skilled4U",
  },
} as const;

