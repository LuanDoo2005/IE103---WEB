// Book category data source
// Optional field for each product: cover: "../images/path-to-cover.jpg"
const categoryData = {
  fiction: {
    name: "Fiction",
    i18nKey: "book-cat-fiction",
    products: [
      { id: 1, title: "The Last Lantern", titleI18n: "book-fiction-1", author: "Linh Tran", price: 129000, format: "paperback", language: "vi", priceRange: "low", ageRange: "teen", tone: "amber" },
      { id: 2, title: "Silent Harbor", titleI18n: "book-fiction-2", author: "Evan K. Moore", price: 189000, format: "hardcover", language: "en", priceRange: "mid", ageRange: "adult", tone: "teal" },
      { id: 3, title: "Moon Over Saigon", titleI18n: "book-fiction-3", author: "Khanh Vo", price: 99000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "rose" },
      { id: 4, title: "The Ninth Orchard", titleI18n: "book-fiction-4", author: "Ari Cole", price: 239000, format: "hardcover", language: "en", priceRange: "high", ageRange: "adult", tone: "forest" },
      { id: 5, title: "Paper Stars at Dawn", author: "Minh Chau", price: 159000, format: "paperback", language: "vi", priceRange: "mid", ageRange: "teen", tone: "sky" },
      { id: 6, title: "The Rain Archive", author: "Noah Reed", price: 219000, format: "hardcover", language: "en", priceRange: "high", ageRange: "adult", tone: "navy" }
    ]
  },
  "non-fiction": {
    name: "Non-fiction",
    i18nKey: "book-cat-nonfiction",
    products: [
      { id: 1, title: "Mapping Everyday Ideas", titleI18n: "book-nonfiction-1", author: "Thu Nguyen", price: 149000, format: "paperback", language: "vi", priceRange: "low", ageRange: "adult", tone: "slate" },
      { id: 2, title: "The Human Signal", titleI18n: "book-nonfiction-2", author: "N. Patel", price: 205000, format: "hardcover", language: "en", priceRange: "mid", ageRange: "adult", tone: "ocean" },
      { id: 3, title: "Small Habits Atlas", titleI18n: "book-nonfiction-3", author: "Bui Minh", price: 175000, format: "paperback", language: "vi", priceRange: "mid", ageRange: "teen", tone: "olive" },
      { id: 4, title: "The Curious Notebook", author: "Lan Pham", price: 129000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "steel" },
      { id: 5, title: "Facts After Dark", author: "Ella Stone", price: 259000, format: "hardcover", language: "en", priceRange: "high", ageRange: "adult", tone: "charcoal" },
      { id: 6, title: "One Page at a Time", author: "Huy Tran", price: 99000, format: "paperback", language: "vi", priceRange: "low", ageRange: "adult", tone: "azure" }
    ]
  },
  business: {
    name: "Business",
    i18nKey: "book-cat-business",
    products: [
      { id: 1, title: "The Lean Seller", titleI18n: "book-business-1", author: "Mai Le", price: 189000, format: "paperback", language: "vi", priceRange: "mid", ageRange: "adult", tone: "charcoal" },
      { id: 2, title: "Scale Without Chaos", titleI18n: "book-business-2", author: "Jordan Lee", price: 229000, format: "hardcover", language: "en", priceRange: "high", ageRange: "adult", tone: "navy" },
      { id: 3, title: "Startup by Monday", titleI18n: "book-business-3", author: "Thanh Pham", price: 89000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "sunset" },
      { id: 4, title: "Profit Map", author: "Binh Dao", price: 119000, format: "paperback", language: "vi", priceRange: "low", ageRange: "adult", tone: "mint" },
      { id: 5, title: "Brand Signals", author: "Mia Carter", price: 179000, format: "hardcover", language: "en", priceRange: "mid", ageRange: "adult", tone: "plum" },
      { id: 6, title: "Cashflow Notes", author: "Tuan Phan", price: 99000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "coral" }
    ]
  },
  "self-help": {
    name: "Self-help",
    i18nKey: "book-cat-selfhelp",
    products: [
      { id: 1, title: "Reset in 21 Days", titleI18n: "book-selfhelp-1", author: "Diep Vu", price: 139000, format: "paperback", language: "vi", priceRange: "low", ageRange: "teen", tone: "mint" },
      { id: 2, title: "Focus in Noise", titleI18n: "book-selfhelp-2", author: "R. Andrews", price: 209000, format: "hardcover", language: "en", priceRange: "mid", ageRange: "adult", tone: "plum" },
      { id: 3, title: "Better Boundaries", titleI18n: "book-selfhelp-3", author: "Hoa Truong", price: 79000, format: "ebook", language: "vi", priceRange: "low", ageRange: "adult", tone: "coral" },
      { id: 4, title: "Calm Minutes", author: "Mai Huong", price: 99000, format: "paperback", language: "vi", priceRange: "low", ageRange: "teen", tone: "sky" },
      { id: 5, title: "Build Your Routine", author: "Iris Wood", price: 189000, format: "hardcover", language: "en", priceRange: "mid", ageRange: "adult", tone: "indigo" },
      { id: 6, title: "Tiny Wins", author: "Vu Lam", price: 129000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "azure" }
    ]
  },
  children: {
    name: "Children",
    i18nKey: "book-cat-children",
    products: [
      { id: 1, title: "Cloud City for Kids", titleI18n: "book-children-1", author: "Nhi Dao", price: 115000, format: "paperback", language: "vi", priceRange: "low", ageRange: "child", tone: "sky" },
      { id: 2, title: "The Brave Little Fox", titleI18n: "book-children-2", author: "Emma Gray", price: 169000, format: "hardcover", language: "en", priceRange: "mid", ageRange: "child", tone: "orange" },
      { id: 3, title: "Color Forest", titleI18n: "book-children-3", author: "Team Maple", price: 69000, format: "ebook", language: "en", priceRange: "low", ageRange: "child", tone: "lime" },
      { id: 4, title: "Tiny Moon Stories", author: "Anh Mai", price: 89000, format: "paperback", language: "vi", priceRange: "low", ageRange: "child", tone: "teal" },
      { id: 5, title: "Alphabet Adventure", author: "Luna Reed", price: 129000, format: "hardcover", language: "en", priceRange: "low", ageRange: "child", tone: "peach" },
      { id: 6, title: "Animal Parade", author: "Minh Phu", price: 99000, format: "ebook", language: "vi", priceRange: "low", ageRange: "child", tone: "ruby" }
    ]
  },
  science: {
    name: "Science & Tech",
    i18nKey: "book-cat-science",
    products: [
      { id: 1, title: "AI in Plain Words", titleI18n: "book-science-1", author: "Ngoc Dang", price: 219000, format: "hardcover", language: "vi", priceRange: "high", ageRange: "teen", tone: "indigo" },
      { id: 2, title: "Quantum Weekend", titleI18n: "book-science-2", author: "F. Keller", price: 189000, format: "paperback", language: "en", priceRange: "mid", ageRange: "adult", tone: "violet" },
      { id: 3, title: "Code + Cosmos", titleI18n: "book-science-3", author: "H. Tran", price: 99000, format: "ebook", language: "en", priceRange: "low", ageRange: "teen", tone: "steel" },
      { id: 4, title: "Tomorrow Lab", author: "Kien Vu", price: 149000, format: "paperback", language: "vi", priceRange: "low", ageRange: "teen", tone: "azure" },
      { id: 5, title: "Neuron Maps", author: "I. Sharma", price: 259000, format: "hardcover", language: "en", priceRange: "high", ageRange: "adult", tone: "navy" },
      { id: 6, title: "Data & Dust", author: "Phuc Le", price: 129000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "mint" }
    ]
  },
  history: {
    name: "History",
    i18nKey: "book-cat-history",
    products: [
      { id: 1, title: "Dynasties of the Coast", titleI18n: "book-history-1", author: "Vu Duc", price: 179000, format: "paperback", language: "vi", priceRange: "mid", ageRange: "adult", tone: "bronze" },
      { id: 2, title: "Archive of Cities", titleI18n: "book-history-2", author: "M. Rivera", price: 245000, format: "hardcover", language: "en", priceRange: "high", ageRange: "adult", tone: "stone" },
      { id: 3, title: "Letters from 1945", titleI18n: "book-history-3", author: "An Bui", price: 89000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "sepia" },
      { id: 4, title: "Old Maps, New Roads", author: "Lien Ho", price: 119000, format: "paperback", language: "vi", priceRange: "low", ageRange: "teen", tone: "slate" },
      { id: 5, title: "River Kingdoms", author: "C. Morgan", price: 229000, format: "hardcover", language: "en", priceRange: "high", ageRange: "adult", tone: "ocean" },
      { id: 6, title: "Chronicle Notes", author: "Bao Nguyen", price: 99000, format: "ebook", language: "vi", priceRange: "low", ageRange: "adult", tone: "charcoal" }
    ]
  },
  manga: {
    name: "Manga & Comics",
    i18nKey: "book-cat-manga",
    products: [
      { id: 1, title: "Metro Spirits Vol.1", titleI18n: "book-manga-1", author: "Yuki Han", price: 99000, format: "paperback", language: "en", priceRange: "low", ageRange: "teen", tone: "ruby" },
      { id: 2, title: "Neon Riders Vol.2", titleI18n: "book-manga-2", author: "Minh Kyo", price: 129000, format: "paperback", language: "vi", priceRange: "low", ageRange: "teen", tone: "azure" },
      { id: 3, title: "After Rain Panel", titleI18n: "book-manga-3", author: "Sora M.", price: 59000, format: "ebook", language: "en", priceRange: "low", ageRange: "teen", tone: "peach" },
      { id: 4, title: "Skyline Punch", author: "Duc Anh", price: 119000, format: "paperback", language: "vi", priceRange: "low", ageRange: "teen", tone: "indigo" },
      { id: 5, title: "Comic Harbor", author: "Rin Sato", price: 169000, format: "hardcover", language: "en", priceRange: "mid", ageRange: "teen", tone: "violet" },
      { id: 6, title: "Panel Lights", author: "Kyo Tran", price: 79000, format: "ebook", language: "vi", priceRange: "low", ageRange: "teen", tone: "teal" }
    ]
  }
};

const categoryGrowthPlan = {
  fiction: { target: 14, prefix: "Night Chapter", toneStart: 0, ageCycle: ["teen", "adult"] },
  "non-fiction": { target: 9, prefix: "Insight Note", toneStart: 4, ageCycle: ["adult", "teen"] },
  business: { target: 13, prefix: "Market Signal", toneStart: 8, ageCycle: ["adult", "teen"] },
  "self-help": { target: 8, prefix: "Better You", toneStart: 12, ageCycle: ["teen", "adult"] },
  children: { target: 12, prefix: "Little Wonder", toneStart: 16, ageCycle: ["child"] },
  science: { target: 15, prefix: "Future Lab", toneStart: 20, ageCycle: ["teen", "adult"] },
  history: { target: 7, prefix: "Old World", toneStart: 24, ageCycle: ["teen", "adult"] },
  manga: { target: 11, prefix: "Panel Quest", toneStart: 0, ageCycle: ["teen"] }
};

const fillerTones = [
  "amber",
  "teal",
  "rose",
  "forest",
  "slate",
  "ocean",
  "olive",
  "charcoal",
  "navy",
  "sunset",
  "mint",
  "plum",
  "coral",
  "sky",
  "orange",
  "lime",
  "indigo",
  "violet",
  "steel",
  "bronze",
  "stone",
  "sepia",
  "ruby",
  "azure",
  "peach"
];

const fillerFormats = ["paperback", "hardcover", "ebook"];
const fillerPrices = [
  { price: 99000, priceRange: "low" },
  { price: 129000, priceRange: "low" },
  { price: 169000, priceRange: "mid" },
  { price: 219000, priceRange: "high" }
];
const fillerLanguages = ["vi", "en"];

Object.entries(categoryGrowthPlan).forEach(([slug, plan]) => {
  const category = categoryData[slug];
  if (!category) return;

  const currentCount = category.products.length;
  const missingCount = plan.target - currentCount;

  for (let index = 0; index < missingCount; index += 1) {
    const bookIndex = currentCount + index + 1;
    const priceChoice = fillerPrices[(bookIndex - 1) % fillerPrices.length];
    const language = fillerLanguages[(bookIndex - 1) % fillerLanguages.length];
    const format = fillerFormats[(bookIndex - 1) % fillerFormats.length];
    const ageRange = plan.ageCycle[(bookIndex - 1) % plan.ageCycle.length];
    const tone = fillerTones[(plan.toneStart + index) % fillerTones.length];

    category.products.push({
      id: bookIndex,
      title: `${plan.prefix} ${bookIndex}`,
      author: `${plan.prefix} Author ${bookIndex}`,
      price: priceChoice.price,
      format,
      language,
      priceRange: priceChoice.priceRange,
      ageRange,
      tone,
    });
  }
});

function getCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("cat") || "fiction";
}

function getAllCategories() {
  return Object.keys(categoryData).map((slug) => ({
    slug,
    name: categoryData[slug].name,
    i18nKey: categoryData[slug].i18nKey
  }));
}
