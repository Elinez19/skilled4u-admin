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

export type BlogBodyBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      leadIn: string;
      items: readonly string[];
    };

export interface WhatsNewItem {
  id: string;
  slug: string;
  categoryId: "offers" | "product-update" | "artisans";
  category: string;
  readTime: string;
  title: string;
  highlightWords?: readonly string[];
  description: string;
  fullStory: string[];
  bodyBlocks: readonly BlogBodyBlock[];
  visualType:
    | "reward"
    | "phones"
    | "emblem"
    | "referral"
    | "tracking"
    | "business";
}

export type BlogCategoryId = "all" | "offers" | "product-update" | "artisans";

export interface BlogCategoryTab {
  id: BlogCategoryId;
  label: string;
}

export interface AudienceItem {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaVariant: "primary" | "secondary";
  ctaHref: string;
  image: string;
  slabTone: "blue" | "ink" | "sapphire";
}

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

export type FaqCategoryId = "customers" | "artisans" | "businesses";

export interface FaqCategoryTab {
  id: FaqCategoryId;
  label: string;
  items: FaqItemData[];
}

export interface HowItWorksStepItem {
  id: string;
  stepNumber: "01" | "02" | "03";
  title: string;
  description: string;
  illustrationType: "store" | "dispatch" | "orders";
}

export interface HowItWorksPerkItem {
  id: string;
  label: string;
  iconType: "onboarding" | "dashboard" | "support";
}

export const landingContent = {
  preloader: {
    brandName: "skilled4U",
    tagline: "Trusted Artisans · Right on Time",
  },
  navbar: {
    links: [
      { label: "Home", href: "/" },
      { label: "Artisans", href: "/artisans" },
      { label: "Services", href: "/#services" },
      { label: "Coverage", href: "/#coverage" },
      { label: "FAQs", href: "/faqs" },
      { label: "Blog", href: "/blog" },
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
    cardCta: "Read More",
    moreCta: "See More",
    moreHref: "/blog",
    items: [
      {
        id: "new-1",
        slug: "your-first-booking-pays-you-back",
        categoryId: "offers",
        category: "Offers",
        readTime: "3 mins read",
        title: "Your First Booking Pays You Back",
        highlightWords: ["First", "Booking"],
        description:
          "At Skilled4U, we believe every great home repair experience should come with an extra reason to smile.",
        fullStory: [
          "Booking a reliable technician shouldn't just solve a problem at home—it should feel rewarding from the very first tap. That's why every new customer on Skilled4U receives an instant ₦2,000 wallet bonus and a free first diagnostic inspection.",
          "Once you create your account and confirm your Abuja address, your ₦2,000 First Booking Reward is automatically credited to your Skilled4U Wallet and ready to apply at checkout on AC servicing, plumbing, electrical work, carpentry, or deep cleaning.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Booking a reliable technician shouldn't just solve a problem at home — it should feel rewarding from the very first tap, and that's exactly why your first booking on Skilled4U pays you back.",
          },
          {
            type: "list",
            leadIn: "Every new customer on Skilled4U unlocks:",
            items: [
              "An instant ₦2,000 First Booking Reward credited to your wallet",
              "Zero callout inspection fee on your first diagnostic visit",
              "Upfront service pricing before any work begins",
              "Full Service Protection Guarantee across all trade categories",
            ],
          },
          {
            type: "paragraph",
            text: "Once you create your account and confirm your Abuja address, your ₦2,000 reward is automatically added to your Skilled4U Wallet. Whether you're booking split-unit AC servicing in Wuse II, fixing a pipe leak in Maitama, or scheduling deep home cleaning in Jabi, your bonus applies seamlessly.",
          },
          {
            type: "list",
            leadIn: "You can redeem your First Booking Reward across:",
            items: [
              "AC & Refrigeration servicing and gas refills",
              "Emergency plumbing and water pump repairs",
              "Electrical fault finding and solar inverter setups",
              "Custom carpentry, TV mounting, and home deep cleaning",
            ],
          },
          {
            type: "list",
            leadIn: "Claiming your wallet bonus takes less than a minute:",
            items: [
              "Download the Skilled4U app on iOS or Android",
              "Verify your phone number and Abuja neighbourhood",
              "Pick any home or office service category",
              "Select Skilled4U Wallet at checkout to apply your ₦2,000 bonus",
            ],
          },
          {
            type: "paragraph",
            text: "Plus, every completed booking earns cashback loyalty points and referral rewards whenever you invite friends or neighbours across Abuja.",
          },
          {
            type: "paragraph",
            text: "Download the Skilled4U app today, claim your ₦2,000 First Booking Reward, and experience stress-free home repairs done right the first time.",
          },
        ],
        visualType: "reward",
      },
      {
        id: "new-2",
        slug: "the-all-new-skilled4u-app-experience",
        categoryId: "product-update",
        category: "Product Update",
        readTime: "2 mins read",
        title: "The All-New Skilled4U App Experience",
        highlightWords: ["All-New", "Skilled4U"],
        description:
          "Booking your favourite plumber, electrician, or AC technician should be fast, simple, and enjoyable, and that's exactly what the new Skilled4U app delivers.",
        fullStory: [
          "We rebuilt the Skilled4U mobile experience from the ground up so homeowners and facility managers across Abuja can go from a leaking pipe or warm AC to a verified technician on the way in under 60 seconds.",
          "With upfront callout and service pricing, real-time GPS arrival tracking, video diagnostics before arrival, and instant escrow-protected wallet checkout, every fix is smoother from start to finish.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Booking your favourite plumber, electrician, or AC technician should be fast, simple, and enjoyable — and that's exactly what the new Skilled4U app delivers.",
          },
          {
            type: "list",
            leadIn: "We've completely redesigned the app to make it:",
            items: [
              "Faster when browsing verified artisans and categories",
              "Smoother to use",
              "Easier to track bookings",
              "More intuitive from start to finish",
            ],
          },
          {
            type: "paragraph",
            text: "The updated experience makes discovering top-rated workshops, browsing upfront service menus, and placing bookings easier than ever before. Whether you're scheduling an urgent AC repair at work, fixing a leaking pipe at home, or booking weekend deep cleaning, everything feels effortless.",
          },
          {
            type: "list",
            leadIn: "Behind the scenes, the app has been optimized for:",
            items: [
              "Better speed",
              "Improved stability",
              "Cleaner layout and visuals",
              "Seamless checkout and live artisan tracking",
            ],
          },
          {
            type: "list",
            leadIn: "That means with the new Skilled4U app you can:",
            items: [
              "Find verified pros in seconds",
              "Rebook favourites faster",
              "Track artisan arrivals in real time",
              "Get updates on every step of your booking",
            ],
          },
          {
            type: "paragraph",
            text: "New features like 1-tap rebooking, 15-second video diagnostics, and smarter workshop recommendations mean you spend less time waiting and more time enjoying a comfortable home.",
          },
          {
            type: "paragraph",
            text: "Update or download the Skilled4U app today and experience a faster, cleaner, and more rewarding way to book trusted artisans.",
          },
        ],
        visualType: "phones",
      },
      {
        id: "new-3",
        slug: "abuja-master-artisans-guild-is-now-on-skilled4u",
        categoryId: "artisans",
        category: "Artisans",
        readTime: "3 mins read",
        title: "Abuja Master Artisans Guild Is Now on Skilled4U",
        highlightWords: ["Master", "Artisans"],
        description:
          "Renowned for rich, precision AC servicing, neat electrical wiring, custom carpentry, and fast 20-minute arrival across Wuse II, Maitama, and Gwarinpa...",
        fullStory: [
          "We are thrilled to welcome over 500 certified specialists from the Abuja Master Artisans Guild onto the Skilled4U platform—spanning Wuse II, Maitama, Gwarinpa, Jabi, Asokoro, and Garki.",
          "Each onboarded workshop has passed our hands-on trade assessment, identity verification, and upfront pricing pledge, bringing workshop-grade craftsmanship straight to your doorstep.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Finding a master craftsman you can trust with your home or office shouldn't feel like guesswork — and with the Abuja Master Artisans Guild now live on Skilled4U, world-class workmanship is only a tap away.",
          },
          {
            type: "list",
            leadIn: "Every Guild workshop onboarded onto Skilled4U has completed:",
            items: [
              "Hands-on technical trade testing and safety certification",
              "Full government ID and workshop address verification",
              "Standardized upfront pricing with zero hidden callout surprises",
              "Real-time dispatch readiness across 15+ Abuja neighbourhoods",
            ],
          },
          {
            type: "paragraph",
            text: "We are thrilled to welcome over 500 certified specialists from the Abuja Master Artisans Guild onto the Skilled4U platform. From Wuse II and Maitama to Gwarinpa, Jabi, Asokoro, and Garki, homeowners and facility managers can now book Guild-certified pros on demand.",
          },
          {
            type: "list",
            leadIn: "Guild specialists are available for immediate dispatch across:",
            items: [
              "Precision split & central AC diagnostics and gas refilling",
              "Three-phase electrical wiring, changeover switches, and solar inverters",
              "Bespoke cabinetry, security door locks, and wardrobe installations",
              "High-pressure plumbing, borehole pumps, and water treatment",
            ],
          },
          {
            type: "list",
            leadIn: "When you book an Abuja Master Artisans Guild member, you get:",
            items: [
              "20-minute average dispatch in core Abuja districts",
              "Genuine replacement parts backed by workshop warranty",
              "Escrow-protected payment released only when you're satisfied",
              "48-hour post-service protection guarantee",
            ],
          },
          {
            type: "paragraph",
            text: "Look out for the GoldVerified Guild badge on workshop profiles inside the Skilled4U app to book Abuja's finest trade specialists.",
          },
          {
            type: "paragraph",
            text: "Open the Skilled4U app today and book a certified Abuja Master Artisan for your next home or office fix.",
          },
        ],
        visualType: "emblem",
      },
    ] satisfies WhatsNewItem[],
  },
  blogPage: {
    hero: {
      headline: "The Good Stuff",
      highlightWords: ["Good"],
      subtitle:
        "Product updates, home repair stories, artisan highlights, workshop spotlights, and everything we're building at Skilled4U.",
    },
    detail: {
      defaultArticleId: "new-2",
      shareLabel: "Share",
      socials: ["IG", "𝕏", "in"] as const,
      moreNewsHeadline: "More News",
      moreNewsHighlightWords: ["News"] as const,
    },
    categories: [
      { id: "all", label: "All" },
      { id: "offers", label: "Offers" },
      { id: "product-update", label: "Product Update" },
      { id: "artisans", label: "Artisans" },
    ] satisfies BlogCategoryTab[],
    cardCta: "Read More",
    loadMoreCta: "Load More",
    showLessCta: "Show Less",
    items: [
      {
        id: "new-1",
        slug: "your-first-booking-pays-you-back",
        categoryId: "offers",
        category: "Offers",
        readTime: "3 mins read",
        title: "Your First Booking Pays You Back",
        highlightWords: ["First", "Booking"],
        description:
          "At Skilled4U, we believe every great home repair experience should come with an extra reason to smile.",
        fullStory: [
          "Booking a reliable technician shouldn't just solve a problem at home—it should feel rewarding from the very first tap. That's why every new customer on Skilled4U receives an instant ₦2,000 wallet bonus and a free first diagnostic inspection.",
          "Once you create your account and confirm your Abuja address, your ₦2,000 First Booking Reward is automatically credited to your Skilled4U Wallet and ready to apply at checkout on AC servicing, plumbing, electrical work, carpentry, or deep cleaning.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Booking a reliable technician shouldn't just solve a problem at home — it should feel rewarding from the very first tap, and that's exactly why your first booking on Skilled4U pays you back.",
          },
          {
            type: "list",
            leadIn: "Every new customer on Skilled4U unlocks:",
            items: [
              "An instant ₦2,000 First Booking Reward credited to your wallet",
              "Zero callout inspection fee on your first diagnostic visit",
              "Upfront service pricing before any work begins",
              "Full Service Protection Guarantee across all trade categories",
            ],
          },
          {
            type: "paragraph",
            text: "Once you create your account and confirm your Abuja address, your ₦2,000 reward is automatically added to your Skilled4U Wallet. Whether you're booking split-unit AC servicing in Wuse II, fixing a pipe leak in Maitama, or scheduling deep home cleaning in Jabi, your bonus applies seamlessly.",
          },
          {
            type: "list",
            leadIn: "You can redeem your First Booking Reward across:",
            items: [
              "AC & Refrigeration servicing and gas refills",
              "Emergency plumbing and water pump repairs",
              "Electrical fault finding and solar inverter setups",
              "Custom carpentry, TV mounting, and home deep cleaning",
            ],
          },
          {
            type: "list",
            leadIn: "Claiming your wallet bonus takes less than a minute:",
            items: [
              "Download the Skilled4U app on iOS or Android",
              "Verify your phone number and Abuja neighbourhood",
              "Pick any home or office service category",
              "Select Skilled4U Wallet at checkout to apply your ₦2,000 bonus",
            ],
          },
          {
            type: "paragraph",
            text: "Plus, every completed booking earns cashback loyalty points and referral rewards whenever you invite friends or neighbours across Abuja.",
          },
          {
            type: "paragraph",
            text: "Download the Skilled4U app today, claim your ₦2,000 First Booking Reward, and experience stress-free home repairs done right the first time.",
          },
        ],
        visualType: "reward",
      },
      {
        id: "new-2",
        slug: "the-all-new-skilled4u-app-experience",
        categoryId: "product-update",
        category: "Product Update",
        readTime: "2 mins read",
        title: "The All-New Skilled4U App Experience",
        highlightWords: ["All-New", "Skilled4U"],
        description:
          "Booking your favourite plumber, electrician, or AC technician should be fast, simple, and enjoyable, and that's exactly what the new Skilled4U app delivers.",
        fullStory: [
          "We rebuilt the Skilled4U mobile experience from the ground up so homeowners and facility managers across Abuja can go from a leaking pipe or warm AC to a verified technician on the way in under 60 seconds.",
          "With upfront callout and service pricing, real-time GPS arrival tracking, video diagnostics before arrival, and instant escrow-protected wallet checkout, every fix is smoother from start to finish.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Booking your favourite plumber, electrician, or AC technician should be fast, simple, and enjoyable — and that's exactly what the new Skilled4U app delivers.",
          },
          {
            type: "list",
            leadIn: "We've completely redesigned the app to make it:",
            items: [
              "Faster when browsing verified artisans and categories",
              "Smoother to use",
              "Easier to track bookings",
              "More intuitive from start to finish",
            ],
          },
          {
            type: "paragraph",
            text: "The updated experience makes discovering top-rated workshops, browsing upfront service menus, and placing bookings easier than ever before. Whether you're scheduling an urgent AC repair at work, fixing a leaking pipe at home, or booking weekend deep cleaning, everything feels effortless.",
          },
          {
            type: "list",
            leadIn: "Behind the scenes, the app has been optimized for:",
            items: [
              "Better speed",
              "Improved stability",
              "Cleaner layout and visuals",
              "Seamless checkout and live artisan tracking",
            ],
          },
          {
            type: "list",
            leadIn: "That means with the new Skilled4U app you can:",
            items: [
              "Find verified pros in seconds",
              "Rebook favourites faster",
              "Track artisan arrivals in real time",
              "Get updates on every step of your booking",
            ],
          },
          {
            type: "paragraph",
            text: "New features like 1-tap rebooking, 15-second video diagnostics, and smarter workshop recommendations mean you spend less time waiting and more time enjoying a comfortable home.",
          },
          {
            type: "paragraph",
            text: "Update or download the Skilled4U app today and experience a faster, cleaner, and more rewarding way to book trusted artisans.",
          },
        ],
        visualType: "phones",
      },
      {
        id: "new-3",
        slug: "abuja-master-artisans-guild-is-now-on-skilled4u",
        categoryId: "artisans",
        category: "Artisans",
        readTime: "3 mins read",
        title: "Abuja Master Artisans Guild Is Now on Skilled4U",
        highlightWords: ["Master", "Artisans"],
        description:
          "Renowned for rich, precision AC servicing, neat electrical wiring, custom carpentry, and fast 20-minute arrival across Wuse II, Maitama, and Gwarinpa...",
        fullStory: [
          "We are thrilled to welcome over 500 certified specialists from the Abuja Master Artisans Guild onto the Skilled4U platform—spanning Wuse II, Maitama, Gwarinpa, Jabi, Asokoro, and Garki.",
          "Each onboarded workshop has passed our hands-on trade assessment, identity verification, and upfront pricing pledge, bringing workshop-grade craftsmanship straight to your doorstep.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Finding a master craftsman you can trust with your home or office shouldn't feel like guesswork — and with the Abuja Master Artisans Guild now live on Skilled4U, world-class workmanship is only a tap away.",
          },
          {
            type: "list",
            leadIn: "Every Guild workshop onboarded onto Skilled4U has completed:",
            items: [
              "Hands-on technical trade testing and safety certification",
              "Full government ID and workshop address verification",
              "Standardized upfront pricing with zero hidden callout surprises",
              "Real-time dispatch readiness across 15+ Abuja neighbourhoods",
            ],
          },
          {
            type: "paragraph",
            text: "We are thrilled to welcome over 500 certified specialists from the Abuja Master Artisans Guild onto the Skilled4U platform. From Wuse II and Maitama to Gwarinpa, Jabi, Asokoro, and Garki, homeowners and facility managers can now book Guild-certified pros on demand.",
          },
          {
            type: "list",
            leadIn: "Guild specialists are available for immediate dispatch across:",
            items: [
              "Precision split & central AC diagnostics and gas refilling",
              "Three-phase electrical wiring, changeover switches, and solar inverters",
              "Bespoke cabinetry, security door locks, and wardrobe installations",
              "High-pressure plumbing, borehole pumps, and water treatment",
            ],
          },
          {
            type: "list",
            leadIn: "When you book an Abuja Master Artisans Guild member, you get:",
            items: [
              "20-minute average dispatch in core Abuja districts",
              "Genuine replacement parts backed by workshop warranty",
              "Escrow-protected payment released only when you're satisfied",
              "48-hour post-service protection guarantee",
            ],
          },
          {
            type: "paragraph",
            text: "Look out for the Gold Verified Guild badge on workshop profiles inside the Skilled4U app to book Abuja's finest trade specialists.",
          },
          {
            type: "paragraph",
            text: "Open the Skilled4U app today and book a certified Abuja Master Artisan for your next home or office fix.",
          },
        ],
        visualType: "emblem",
      },
      {
        id: "new-4",
        slug: "20-percent-off-split-ac-servicing-and-gas-refill",
        categoryId: "offers",
        category: "Offers",
        readTime: "2 mins read",
        title: "20% Off Split AC Servicing & Gas Refill This Week",
        highlightWords: ["20%", "Split", "AC"],
        description:
          "Beat the Abuja heat with crystal-cold air conditioning. Enjoy 20% off complete split-unit servicing, coil washing, and pressure gas refills across all districts.",
        fullStory: [
          "Keep your home and office cool all season long. For a limited time, Skilled4U is offering 20% off full split-unit AC maintenance and R410A/R22 gas refills booked through the app.",
          "Simply pick 'AC & Refrigeration' in the Skilled4U app, select your preferred time slot in Wuse II, Maitama, Gwarinpa, or Jabi, and your discount applies automatically at checkout.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Keeping your home and office crystal-cold through the Abuja heat should be effortless and affordable — and this week, every split-unit AC service on Skilled4U comes with 20% off.",
          },
          {
            type: "list",
            leadIn: "Every discounted AC maintenance booking includes:",
            items: [
              "High-pressure indoor evaporator and outdoor condenser coil washing",
              "Drainage pipe flushing to stop indoor water leaks",
              "R410A or R22 refrigerant gas pressure testing and top-up",
              "Full thermostat, capacitor, and airflow inspection",
            ],
          },
          {
            type: "paragraph",
            text: "Routine servicing not only restores ice-cold airflow in minutes, it also reduces compressor power consumption on your prepaid meter and inverter batteries by up to 30%.",
          },
          {
            type: "list",
            leadIn: "How to book your 20% off AC service in seconds:",
            items: [
              "Open the Skilled4U app and tap AC & Refrigeration",
              "Choose Split AC Servicing or AC Gas Refill",
              "Pick your preferred arrival slot in Wuse II, Maitama, Gwarinpa, Jabi, or Asokoro",
              "Enjoy automatic 20% savings applied right at checkout",
            ],
          },
          {
            type: "paragraph",
            text: "Book for a single bedroom unit or schedule multi-unit servicing for your entire home or office branch with our verified cooling specialists.",
          },
        ],
        visualType: "referral",
      },
      {
        id: "new-5",
        slug: "introducing-live-map-tracking-and-video-diagnostics",
        categoryId: "product-update",
        category: "Product Update",
        readTime: "3 mins read",
        title: "Introducing Live Map Tracking & Video Diagnostics",
        highlightWords: ["Live", "Map", "Video"],
        description:
          "Show your artisan the fault before they set out and watch their dispatch scooter arrive in real time on the interactive Abuja neighbourhood map.",
        fullStory: [
          "No more guessing when your technician will arrive or whether they brought the right spare part. Upload a 15-second video clip when booking and follow your pro's live route right to your gate.",
          "Video Diagnostics helps our plumbers, electricians, and AC specialists pre-pack the exact replacement valves, capacitors, and tools needed to complete 94% of repairs on the very first visit.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Waiting around wondering when your technician will arrive or whether they packed the right spare part is officially a thing of the past — thanks to Live Map Tracking and Video Diagnostics on Skilled4U.",
          },
          {
            type: "list",
            leadIn: "With 15-Second Video Diagnostics, you can:",
            items: [
              "Record or upload a short clip of the faulty AC, leaking pipe, or sparking socket",
              "Let your matched artisan inspect the exact model and fault before leaving their workshop",
              "Ensure your technician brings the right replacement valve, capacitor, or seal",
              "Complete 94% of home repairs on the very first visit",
            ],
          },
          {
            type: "paragraph",
            text: "As soon as your artisan confirms the booking and sets out, our new Live Map Tracking view activates automatically on your home screen.",
          },
          {
            type: "list",
            leadIn: "Live Map Tracking gives you complete visibility with:",
            items: [
              "Real-time GPS scooter movement across Abuja streets",
              "Minute-by-minute arrival countdown updated for live traffic",
              "Direct in-app chat and masked voice calls for gate instructions",
              "Instant push alerts when your pro is 2 minutes away",
            ],
          },
          {
            type: "paragraph",
            text: "Update your Skilled4U app today to try Video Diagnostics and Live Map Tracking on your next repair booking.",
          },
        ],
        visualType: "tracking",
      },
      {
        id: "new-6",
        slug: "how-coolbreeze-tech-tripled-bookings-in-wuse-ii",
        categoryId: "artisans",
        category: "Artisans",
        readTime: "4 mins read",
        title: "How CoolBreeze Tech Tripled Bookings in Wuse II",
        highlightWords: ["CoolBreeze", "Tripled"],
        description:
          "From a two-man AC workshop in Wuse Zone 4 to one of Abuja's highest-rated service teams on Skilled4U—discover how digital dispatch transformed their craft.",
        fullStory: [
          "Before joining Skilled4U, CoolBreeze Tech relied solely on word-of-mouth referrals. Within 60 days of going live on Skilled4U Pro, their team expanded to six certified technicians serving Wuse II, Maitama, and Jabi daily.",
          "With instant wallet payouts and automated job routing, their technicians spend less time stuck in traffic looking for customers and more time delivering five-star cooling repairs.",
        ],
        bodyBlocks: [
          {
            type: "paragraph",
            text: "Two years ago, CoolBreeze Tech was a two-man refrigeration workshop in Wuse Zone 4 relying entirely on word-of-mouth calls — today, they are one of Abuja's busiest 4.9-star service teams on Skilled4U.",
          },
          {
            type: "list",
            leadIn: "Joining Skilled4U Pro helped CoolBreeze Tech transform their daily operations:",
            items: [
              "3x increase in completed weekly AC and refrigeration bookings",
              "Automated proximity matching with homeowners in Wuse II, Maitama, and Jabi",
              "Zero time wasted negotiating callout fees thanks to upfront pricing",
              "Instant Pro Wallet payouts after every confirmed repair",
            ],
          },
          {
            type: "paragraph",
            text: "By using Video Diagnostics before dispatch, CoolBreeze Tech's technicians review customer clips in advance, pack the exact compressor capacitors and gas gauges needed, and arrive on scooters in under 20 minutes.",
          },
          {
            type: "list",
            leadIn: "With the Skilled4U multi-technician workshop dashboard, their team now:",
            items: [
              "Manages six verified field technicians from one screen",
              "Tracks live job completion and customer ratings in real time",
              "Schedules recurring monthly office AC maintenance across Central Area",
              "Unlocks weekly top-rated artisan performance bonuses",
            ],
          },
          {
            type: "paragraph",
            text: "Whether you're an independent master tradesperson or run a growing Abuja workshop, Skilled4U gives your skill the crowd it deserves.",
          },
        ],
        visualType: "business",
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
        ctaHref: "#download",
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
        ctaHref: "/artisans",
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
        ctaHref: "#download",
        image: "/images/landing/audience-business.svg",
        slabTone: "sapphire",
      },
    ] satisfies AudienceItem[],
  },
  artisanPage: {
    hero: {
      headlineLine1: "Great Skill Deserves",
      headlineLine2: "A Crowd.",
      subtitle:
        "Join hundreds of top Abuja workshops and pros growing their business on Skilled4U.",
      primaryCta: "Download on App Store",
      secondaryCta: "Download on Play Store",
    },
    howItWorks: {
      headline: "How It Works",
      subtitle:
        "With Skilled4U, setting up your workshop, managing bookings, and growing your business is simple and stress-free.",
      steps: [
        {
          id: "step-01",
          stepNumber: "01",
          title: "Create Your Workshop",
          description:
            "Set up your trade profile, list your services and upfront pricing, and go live in minutes.",
          illustrationType: "store",
        },
        {
          id: "step-02",
          stepNumber: "02",
          title: "Fast Job Dispatch",
          description:
            "Get matched with verified homeowners and offices near your location in real time.",
          illustrationType: "dispatch",
        },
        {
          id: "step-03",
          stepNumber: "03",
          title: "Start Receiving Bookings",
          description:
            "Accept jobs on your phone, track every repair, and receive fast payouts to your wallet.",
          illustrationType: "orders",
        },
      ] satisfies HowItWorksStepItem[],
      perks: [
        {
          id: "perk-onboarding",
          label: "Quick Onboarding",
          iconType: "onboarding",
        },
        {
          id: "perk-dashboard",
          label: "Easy Job Management",
          iconType: "dashboard",
        },
        {
          id: "perk-support",
          label: "24/7 Partner Support",
          iconType: "support",
        },
      ] satisfies HowItWorksPerkItem[],
      ctaLabel: "Become a Partner",
      ctaHref: "#join",
    },
    coverage: {
      badge: "15+ Areas Covered in Abuja",
      headline: "Reach More Ready Customers",
      highlightWords: ["Ready", "Customers"],
      subtitle:
        "Skilled4U connects your workshop with homeowners and businesses across Abuja—giving you steady bookings without the marketing stress.",
    },
    faqs: {
      headline: "Got Questions ?",
      subtitle:
        "Everything you need to know about joining Skilled4U, receiving bookings, payouts, and growing your workshop across Abuja.",
      moreCta: "See More",
      items: [
        {
          id: "artisan-faq-1",
          question: "How quickly does an artisan usually get booked?",
          answer:
            "Once your workshop profile is verified, you begin receiving nearby job requests within 20 to 45 minutes depending on your trade category and Abuja district.",
        },
        {
          id: "artisan-faq-2",
          question: "Which areas do you currently serve?",
          answer:
            "We currently serve 15+ neighbourhoods across Abuja—including Wuse II, Maitama, Gwarinpa, Asokoro, Jabi, Garki, Utako, and Lugbe—with Lagos and Port Harcourt launching soon.",
        },
        {
          id: "artisan-faq-3",
          question: "Can I track my bookings and earnings in real time?",
          answer:
            "Yes! Every accepted job, live customer route, and completed payout is tracked in real time right inside the Skilled4U Pro app.",
        },
        {
          id: "artisan-faq-4",
          question: "Can I list multiple trade skills or technicians at once?",
          answer:
            "Absolutely. Whether you are an independent specialist or manage a multi-technician workshop, you can list multiple service categories and assign jobs seamlessly.",
        },
        {
          id: "artisan-faq-5",
          question: "Do you offer bonuses or incentives for top-rated artisans?",
          answer:
            "Yes! Top-rated artisans enjoy priority dispatch, lower commission tiers, and weekly performance bonuses for maintaining high customer ratings.",
        },
      ] satisfies FaqItemData[],
    },
  },
  faqsPage: {
    headline: "Got Questions ?",
    highlightWords: ["Questions"],
    subtitle:
      "Everything you need to know about booking, arrival times, payments, and using Skilled4U across Abuja.",
    categories: [
      {
        id: "customers",
        label: "For Customers",
        items: [
          {
            id: "cust-faq-1",
            question: "What is Skilled4U?",
            answer:
              "Skilled4U is an on-demand home and office services platform that connects you with your favourite verified plumbers, electricians, AC technicians, carpenters, and cleaners—bringing trusted professionals directly to your doorstep.",
          },
          {
            id: "cust-faq-2",
            question: "Where is Skilled4U available?",
            answer:
              "We currently cover 15+ neighbourhoods across Abuja—including Wuse II, Maitama, Gwarinpa, Asokoro, Jabi, Garki, Utako, Katampe, and Lugbe—with Lagos and Port Harcourt launching soon.",
          },
          {
            id: "cust-faq-3",
            question: "How do I place a booking?",
            answer:
              "Download the Skilled4U app, select the service category you need (such as AC servicing, plumbing, or electrical repair), view upfront pricing, and confirm your address. A verified specialist near you will be matched in seconds.",
          },
          {
            id: "cust-faq-4",
            question: "What payment methods are accepted?",
            answer:
              "You can pay securely in the app using debit cards, instant bank transfers, USSD, or your Skilled4U Wallet balance. Every payment is protected in escrow until your repair is completed.",
          },
          {
            id: "cust-faq-5",
            question: "Can I track my booking?",
            answer:
              "Yes! As soon as a verified artisan accepts your booking, you can track their live movement on the map, see their estimated arrival time, and message or call them directly in the app.",
          },
          {
            id: "cust-faq-6",
            question: "What is the Skilled4U Wallet?",
            answer:
              "The Skilled4U Wallet is your built-in in-app balance for fast, seamless checkout. You can fund it anytime via transfer or card, and receive referral bonuses, cashback, and instant refunds directly into your wallet.",
          },
          {
            id: "cust-faq-7",
            question: "Can I withdraw money from my Skilled4U Wallet?",
            answer:
              "Wallet balances funded via top-ups and promotional bonuses are designed for booking services on Skilled4U. However, if a booking refund is issued, you can request a direct reversal to your verified Nigerian bank account.",
          },
          {
            id: "cust-faq-8",
            question: "I received a Wallet Top-Up. How do I use it?",
            answer:
              "When confirming any service booking at checkout, simply select 'Skilled4U Wallet' as your payment method. Your available top-up or bonus balance will be applied automatically to your total.",
          },
          {
            id: "cust-faq-9",
            question: "Can I cancel my booking?",
            answer:
              "Yes, you can cancel or reschedule a booking directly from the app before the artisan arrives. Free cancellation applies before dispatch; a small callout fee may apply if the technician is already at your doorstep.",
          },
          {
            id: "cust-faq-10",
            question: "What should I do if my artisan is delayed?",
            answer:
              "You can check your artisan's live GPS location or reach them via in-app chat. If traffic or an unexpected delay occurs, our 24/7 support team can immediately reassign the nearest available pro at no extra cost.",
          },
          {
            id: "cust-faq-11",
            question: "What if there is an issue with my repair or service?",
            answer:
              "Every booking on Skilled4U is backed by our Service Protection Guarantee. If a fix isn't completed as agreed, report it in the app within 48 hours and we will send a senior specialist to resolve it for free.",
          },
          {
            id: "cust-faq-12",
            question: "What is Video Inspection & Diagnostics?",
            answer:
              "Video Inspection lets you upload or stream a short clip of a faulty AC, leaking pipe, or electrical issue when booking—helping your artisan arrive with the exact tools and replacement parts needed on the first visit.",
          },
        ],
      },
      {
        id: "artisans",
        label: "For Artisans",
        items: [
          {
            id: "pro-faq-1",
            question: "How do I join Skilled4U as an artisan or workshop?",
            answer:
              "Download the Skilled4U Pro app, complete your profile with your trade specialization, upload your valid ID and workshop details, and pass our quick skill verification to start receiving nearby bookings.",
          },
          {
            id: "pro-faq-2",
            question: "How quickly will I start receiving job requests?",
            answer:
              "Once your workshop profile is verified and you toggle your status to Online, you can start receiving job dispatches in your Abuja neighbourhood within 20 to 45 minutes.",
          },
          {
            id: "pro-faq-3",
            question: "How and when do artisans get paid?",
            answer:
              "As soon as you mark a job complete and the customer confirms, your earnings are credited to your Skilled4U Pro Wallet. You can withdraw instantly to any Nigerian bank account.",
          },
          {
            id: "pro-faq-4",
            question: "Can I set my own working hours and availability?",
            answer:
              "Yes! You have 100% control over your schedule. Go online whenever you are ready to accept jobs, or schedule recurring workshop hours across the week.",
          },
          {
            id: "pro-faq-5",
            question: "Can I register multiple technicians under one workshop?",
            answer:
              "Absolutely. Workshop owners can add multiple verified technicians, list several trade categories, and assign incoming jobs from a single dashboard.",
          },
          {
            id: "pro-faq-6",
            question: "What happens if a job requires extra spare parts?",
            answer:
              "After inspecting the issue on-site, you can submit an itemized parts quote directly in the app. Once the customer approves it in-app, you can proceed with complete transparency.",
          },
          {
            id: "pro-faq-7",
            question: "Are there bonuses for top-rated artisans?",
            answer:
              "Yes! Artisans who maintain a 4.8+ rating and fast arrival times unlock priority job dispatch, lower platform commission tiers, and weekly cash bonuses.",
          },
          {
            id: "pro-faq-8",
            question: "What if a customer cancels after I have arrived?",
            answer:
              "If a customer cancels after you have already travelled to their location, your callout fee is protected and credited directly to your Pro Wallet.",
          },
        ],
      },
      {
        id: "businesses",
        label: "For Businesses",
        items: [
          {
            id: "biz-faq-1",
            question: "How does Skilled4U work for offices and estates?",
            answer:
              "Skilled4U for Businesses gives facility managers, offices, and residential estates priority access to vetted AC, electrical, plumbing, and cleaning teams across Abuja with centralized invoicing.",
          },
          {
            id: "biz-faq-2",
            question: "Can we schedule recurring preventive maintenance?",
            answer:
              "Yes! You can set up monthly or quarterly maintenance schedules for split ACs, inverters, plumbing systems, and deep office cleaning right from your business account.",
          },
          {
            id: "biz-faq-3",
            question: "Do business accounts get dedicated support?",
            answer:
              "Every business and estate partner receives a dedicated account manager, 20-minute priority emergency dispatch, and 24/7 help desk coverage.",
          },
          {
            id: "biz-faq-4",
            question: "How does billing and invoicing work for companies?",
            answer:
              "You can fund a company wallet, pay per booking via corporate transfer or card, and download VAT-compliant receipts and monthly maintenance statements automatically.",
          },
          {
            id: "biz-faq-5",
            question: "Can we manage multiple office branches in Abuja?",
            answer:
              "Yes. Whether your properties are in Maitama, Wuse II, Central Area, Jabi, or Gwarinpa, you can request and track technicians across all locations from one account.",
          },
          {
            id: "biz-faq-6",
            question: "Are the technicians background-checked and insured?",
            answer:
              "Every Skilled4U specialist undergoes strict identity verification, trade testing, and background screening, and all corporate jobs are covered by our Service Protection Guarantee.",
          },
        ],
      },
    ] satisfies FaqCategoryTab[],
  },
  faqs: {
    headline: "Got Questions ?",
    subtitle:
      "Everything you need to know about booking, arrival times, payments, and using Skilled4U across Abuja and Nigeria.",
    moreCta: "See More",
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
      { label: "Home", href: "/" },
      { label: "Our Story", href: "/blog" },
      { label: "Artisans", href: "/artisans" },
      { label: "Coverage", href: "/#coverage" },
    ],
    quickLinks: [
      { label: "Terms of Services", href: "/faqs" },
      { label: "Privacy Policy", href: "/faqs" },
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

export function getBlogArticleBySlug(slugOrId?: string): WhatsNewItem {
  const { items, detail } = landingContent.blogPage;
  const fallback =
    items.find((item) => item.id === detail.defaultArticleId) ?? items[0];

  if (!slugOrId) {
    return fallback;
  }

  const normalized = decodeURIComponent(slugOrId).trim().toLowerCase();
  const match = items.find(
    (item) =>
      item.slug.toLowerCase() === normalized ||
      item.id.toLowerCase() === normalized
  );

  return match ?? fallback;
}

export function getRelatedBlogArticles(
  currentId: string,
  count = 2
): WhatsNewItem[] {
  const { items } = landingContent.blogPage;
  return items.filter((item) => item.id !== currentId).slice(0, count);
}
