import { KOL } from "./types"; // Assuming you have a types file

export const KOLS: KOL[] = [
  // --- Base & Coinbase Ecosystem ---
  {
    id: "0x54ee7dc2425581581c47469e5eb1f5eed4233fcbddf6c7592f1580aa348c89b4", // keccak("Jesse Pollak")
    name: "Jesse Pollak",
    imageUrl: "/kols/jesse-pollak.png",
    link: "https://twitter.com/jessepollak",
    twitterHandle: "@jessepollak",
    attributes: {
      association: "Base",
      ecosystem: "Base",
      pfpTheme: "Human",
      followers: 280000,
      age: 36,
    },
  },
  {
    id: "0xfa4dffc9e824f830cf7d07fc7765ba1d7b344d923dd9083258189156f4932796", // keccak("Brian Armstrong")
    name: "Brian Armstrong",
    imageUrl: "/kols/brian-armstrong.png",
    link: "https://twitter.com/brian_armstrong",
    twitterHandle: "@brian_armstrong",
    attributes: {
      association: "Coinbase",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 1300000,
      age: 42,
    },
  },
  // --- Ethereum Ecosystem ---
  {
    id: "0x33fd3a1a2f6025be5b2d3026fea143df162bb647c138b6d16851023d3c6518a7", // keccak("Vitalik Buterin")
    name: "Vitalik Buterin",
    imageUrl: "/kols/vitalik-buterin.png",
    link: "https://twitter.com/VitalikButerin",
    twitterHandle: "@VitalikButerin",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 5200000,
      age: 31,
    },
  },
  {
    id: "0x4577b1186726aefd500341efa18943241fb9994e2e412da5cc558d28c6e52ddf", // keccak("Hayden Adams")
    name: "Hayden Adams",
    imageUrl: "/kols/hayden-adams.png",
    link: "https://twitter.com/haydenzadams",
    twitterHandle: "@haydenzadams",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Animal", // Unicorn PFP
      followers: 450000,
      age: 32,
    },
  },
  {
    id: "0xcb43db8e11342c57139c6028ef0ca9ff0606bfa1218225ea9a0ccb7e42206362", // keccak("Tim Beiko")
    name: "Tim Beiko",
    imageUrl: "/kols/tim-beiko.png",
    link: "https://twitter.com/TimBeiko",
    twitterHandle: "@TimBeiko",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 150000,
      age: 30,
    },
  },
  // --- Solana Ecosystem ---
  {
    id: "0x673c01c3285d988aa04a27f5a542a4a304005c687956087d40ac2df25856dcdb", // keccak("Anatoly Yakovenko")
    name: "Anatoly Yakovenko",
    imageUrl: "/kols/anatoly-yakovenko.png",
    link: "https://twitter.com/aeyakovenko",
    twitterHandle: "@aeyakovenko",
    attributes: {
      association: "Other",
      ecosystem: "Solana",
      pfpTheme: "Abstract",
      followers: 480000,
      age: 44,
    },
  },
  {
    id: "0x0524cdf42f7e19c1b50b880d9d343bed05b80f21f29ecec6cff29e9657177853", // keccak("Raj Gokal")
    name: "Raj Gokal",
    imageUrl: "/kols/raj-gokal.png",
    link: "https://twitter.com/rajgokal",
    twitterHandle: "@rajgokal",
    attributes: {
      association: "Other",
      ecosystem: "Solana",
      pfpTheme: "Human",
      followers: 200000,
      age: 40,
    },
  },
  // --- Investors & VCs ---
  {
    id: "0x48c5a7987a74c243ccde734e1679bd0ec85b03ad4b0d329815fa18a928bed2ca", // keccak("Balaji Srinivasan")
    name: "Balaji Srinivasan",
    imageUrl: "/kols/balaji-srinivasan.png",
    link: "https://twitter.com/balajis",
    twitterHandle: "@balajis",
    attributes: {
      association: "a16z",
      ecosystem: "Cross-Chain",
      pfpTheme: "Human",
      followers: 980000,
      age: 45,
    },
  },
  {
    id: "0xf62eed8c614d9af05170cfd5366e70ce2b5b581277ed9bda90ee06ec1c0ac70b", // keccak("Chris Dixon")
    name: "Chris Dixon",
    imageUrl: "/kols/chris-dixon.jpg",
    link: "https://twitter.com/cdixon",
    twitterHandle: "@cdixon",
    attributes: {
      association: "a16z",
      ecosystem: "Cross-Chain",
      pfpTheme: "Human",
      followers: 950000,
      age: 53,
    },
  },
  // --- Artists & Culture ---
  {
    id: "0x1607be6baa59b952f720dc10f894f0fb97723aa12c72c2f925dfbd8f301ea770", // keccak("Beeple")
    name: "Beeple",
    imageUrl: "/kols/beeple.png",
    link: "https://twitter.com/beeple",
    twitterHandle: "@beeple",
    attributes: {
      association: "Artist",
      ecosystem: "Ethereum",
      pfpTheme: "Abstract",
      followers: 700000,
      age: 44,
    },
  },
  {
    id: "0xc6efb078ba9e17a714af044d45caa889df54c72db5a8f519a48117964c45e811", // keccak("Gmoney")
    name: "Gmoney",
    imageUrl: "/kols/gmoney.png",
    link: "https://twitter.com/gmoneyNFT",
    twitterHandle: "@gmoneyNFT",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Pixel Art", // Ape PFP
      followers: 300000,
      age: 38,
    },
  },
  // --- Developers & Researchers ---
  {
    id: "0xbcf86f88c85a4d7c8956da3d72aa06352a87f16a97cd2c9897a07492f92a6ad2", // keccak("Dan Finlay")
    name: "Dan Finlay",
    imageUrl: "/kols/dan-finlay.png",
    link: "https://twitter.com/danfinlay",
    twitterHandle: "@danfinlay",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 120000,
      age: 37,
    },
  },
  {
    id: "0x6dc2f619db0779da93991f96b7d19da693074782b6575cd6617f98bb4ff77bdc", // keccak("Stani Kulechov")
    name: "Stani Kulechov",
    imageUrl: "/kols/stani-kulechov.png",
    link: "https://twitter.com/StaniKulechov",
    twitterHandle: "@StaniKulechov",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 250000,
      age: 34,
    },
  },
  {
    id: "0x89a423337cdbf4041d1f104772e9b3b58f5c0141b08227b35aab83cab7e0e1ed", // keccak("Sandeep Nailwal")
    name: "Sandeep Nailwal",
    imageUrl: "/kols/sandeep-nailwal.png",
    link: "https://twitter.com/sandeepnailwal",
    twitterHandle: "@sandeepnailwal",
    attributes: {
      association: "Other",
      ecosystem: "Ethereum",
      pfpTheme: "Human",
      followers: 400000,
      age: 36,
    },
  },
  {
    id: "0xdbbb309b2d1e68f542ca8002db4910bef497c5ad9e7e7c1168159960dd05d2e7", // keccak("Emilie Choi")
    name: "Emilie Choi",
    imageUrl: "/kols/emilie-choi.png",
    link: "https://twitter.com/emiliemc",
    twitterHandle: "@emiliemc",
    attributes: {
      association: "Coinbase",
      ecosystem: "Cross-Chain",
      pfpTheme: "Human",
      followers: 100000,
      age: 45,
    },
  },
];

export const getTodayTarget = (): KOL => {
  const today = new Date();
  const dayOfYear = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
  return KOLS[dayOfYear % KOLS.length];
};

export const fetchKOLs = (): KOL[] => {
  return KOLS;
};
