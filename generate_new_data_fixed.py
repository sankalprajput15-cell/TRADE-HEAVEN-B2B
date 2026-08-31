import os
import json

cashews_companies = [
    {
        "companyName": "CASHEWS ENERGY SAVER",
        "country": "United States",
        "businessType": "Supplier",
        "established": 1999,
        "employees": "11 - 50",
        "mainProducts": ["CASHEWS ENERGY SAVER"],
        "description": "We are dynamic organization, involved in promoting global reach of our clients and collaborate them globally are also involved in global - marketing in Energy related items / consumer...",
        "contactName": "Kam Patel",
        "phone": "+1-212-655"
    },
    {
        "companyName": "Jazzy Nuts Inc.",
        "country": "United States",
        "businessType": "Supplier",
        "established": 1993,
        "employees": "501 - 1000",
        "mainProducts": ["california almonds", "Pistachio", "cashew", "walnuts", "hazelnuts"],
        "description": "We are located in California's Central Valley, one of the world's most productive agricultural regions. We offer farm fresh, top quality nuts, dried fruits, and other delicio edibles. We have been...",
        "contactName": "Aaron Lewis",
        "phone": "+1-323-220"
    },
    {
        "companyName": "Global Resources Traders",
        "country": "United States",
        "businessType": "Buyer",
        "established": 2023,
        "employees": "1 - 5",
        "mainProducts": ["Corn", "Rice", "Cashew Nuts"],
        "description": "We are a U.S. global procurement consultancya dynamic firm specializing in connecting buyers with trustworthy suppliers worldwide. Our core expertise lies in strategic consulting, fostering enduring...",
        "contactName": "GL Trad",
        "phone": "+1-862-325"
    },
    {
        "companyName": "Onac Spring Global Ltd",
        "country": "United States",
        "businessType": "Supplier",
        "established": 2019,
        "employees": "6 - 10",
        "mainProducts": ["CASHEW NUTS"],
        "description": "We are looking for buyers of cashew nuts, Tiger nuts, Bitter kola, FRESH KOLA NUTS, SESAME SEEDS AND Charcoal Our prices are very competitive and our shipping proces are smooth and fast. We ship...",
        "contactName": "Michael Enyimba",
        "phone": "+6466676385"
    },
    {
        "companyName": "Jtbtradeltd",
        "country": "United States",
        "businessType": "Supplier",
        "established": 2012,
        "employees": "101 - 500",
        "mainProducts": ["Cashew Nuts", "Sunflower Oil", "copper wire"],
        "description": "Cashew Nuts WW320 plus: $2950 per ton Cashew Nuts WS: $ 2900 per ton Cashew Nu LP: $ 2400 per ton Cashew Nuts SP: $ 2400 per ton We also supply: Sweet Almond, Pistachio, Walnuts, Pecan PLEASE...",
        "contactName": "DON THOMAS",
        "phone": "+1-605-2779555"
    },
    {
        "companyName": "Zee Trading Ltd",
        "country": "United States",
        "businessType": "Supplier",
        "established": 2010,
        "employees": "51 - 100",
        "mainProducts": ["wood pallet", "cashew nuts", "red kidney beans"],
        "description": "We are a trading company dealing in a long list of agricultural products as well as packaging tools. In the outlin the business, we handle your order, and logistics and always guarantee that the...",
        "contactName": "Zee Grace",
        "phone": "+502-383-1656"
    },
    {
        "companyName": "Nutty Buddy LLC",
        "country": "United States",
        "businessType": "Manufacturer",
        "established": 1992,
        "employees": "101 - 500",
        "mainProducts": ["california almonds", "Pistachio", "cashew", "walnuts", "hazelnuts"],
        "description": "Nutty Buddy Nut Company started as a small, roadside walnut dehydrator in the heart the San Joaquin Valley and today, through hard work and perseverance, we are grower processors and handlers of...",
        "contactName": "Nick Gerald",
        "phone": "+1-213-2122320"
    },
    {
        "companyName": "B-Eco Consulting LLC",
        "country": "United States",
        "businessType": "Supplier",
        "established": 2024,
        "employees": "1 - 5",
        "mainProducts": ["Arab Gum"],
        "description": "B-Eco Consulting LLC, Is An Enterprise In The Agricultural Sector, Specializing In The Trade And Export Of High-quality Agricultural Products As Avocado, Sesame, Arab Gum, Hibiscus and Cashew Nuts.",
        "contactName": "Sam Hanse",
        "phone": "+1-302-4991426"
    },
    {
        "companyName": "Fitila Group,Inc",
        "country": "United States",
        "businessType": "Supplier",
        "established": 1995,
        "employees": "1 - 5",
        "mainProducts": ["Sea butter", "Sheanuts", "Metallic ore"],
        "description": "Seller of Agricultural commodities: Shea Butter, Shea nuts, Coffee,Cocoa Beans, Cashew nuts; and Mineral ore fron West Africa region: Lead Ore,Zinc ore, Wolframite, Zircon Sand, Tin Ore,Columbite,...",
        "contactName": "Ademola Odedele",
        "phone": "+1-908-2359195"
    },
    {
        "companyName": "Christian Yameogo Import Export",
        "country": "United States",
        "businessType": "Buyer",
        "established": 2001,
        "employees": "6 - 10",
        "mainProducts": ["cocoa beans"],
        "description": "We at Christian Yameogo Import Export (CYIMEX) can provide you with great quality of Cocoa beans, raw cash nuts, palm oil, palm acid oil, rubber cup lumps, vegetable oils, crude oil. Also, we are...",
        "contactName": "Christian Yameogo",
        "phone": "+872-234-5759"
    },
    {
        "companyName": "Patorl Inc",
        "country": "United States",
        "businessType": "Manufacturer",
        "established": 1969,
        "employees": "101 - 500",
        "mainProducts": ["jatropha oil", "sunflower oil", "soyabean oil", "olive oil"],
        "description": "global leader in the dome of manufacturing and exporting of refined/crude coconut oil, Sunflower oil, Peanut o Refined/crude rapeseed oil, Refined cumin seed oil, refined/crude Palm oil, Olive oil...",
        "contactName": "ernest",
        "phone": "+1-654-7865099876"
    },
    {
        "companyName": "Ets Fons Ltd",
        "country": "United States",
        "businessType": "Manufacturer",
        "established": 2000,
        "employees": "6 - 10",
        "mainProducts": ["wood pellet"],
        "description": "we are wholesale supplier of all kinds of product like, wood pellet, timber wood logs pinto beans hazelnut oil Sunflower oil jatropha oil soybeans oil rapeseed oil Wheat Maize Sugar cane olive...",
        "contactName": "Mr.John Smith",
        "phone": "+1-212 -8442015"
    },
    {
        "companyName": "DIGCI International Trade/Group Consultants",
        "country": "United States",
        "businessType": "Supplier",
        "established": 1998,
        "employees": "6 - 10",
        "mainProducts": ["SELLER"],
        "description": "DIGCI is an Export business trading on Agricultural commodities such as: Hardwood Charcoal, Ground nuts, Cashew Nuts, Shea butter, Shear Nuts, Sesame Seed, Dry split Ginger, Palm Kernel Shells,...",
        "contactName": "David Agbeti",
        "phone": "+1-917-6000487"
    },
    {
        "companyName": "SimCo Trade & Consultancy",
        "country": "United States",
        "businessType": "Supplier",
        "established": 2003,
        "employees": "1 - 5",
        "mainProducts": ["Cement", "Clinker", "Sugar"],
        "description": "We are a USA Trading and Wholesalers of Steam Coal, Natural Fertilizers, Cashews, Palm Kernel Oil, Coffee, Cocoa, Shea Butter and Peanuts.",
        "contactName": "Cathy Thomas",
        "phone": "+1-773-8655215"
    }
]

vanilla_companies = [
    {
        "companyName": "Botanica Origin's",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2026,
        "employees": "1 - 5",
        "mainProducts": ["coffee beans", "Robusta", "Arabica", "Vanilla"],
        "description": "beans, with plans to expand into other agricultural commodities and spices based on market demand. We are committed to providing reliable sourcing, clear communicatio and product specifications...",
        "contactName": "Aadrian",
        "phone": "+62-51695-"
    },
    {
        "companyName": "Riavanille Sarl",
        "country": "Madagascar",
        "businessType": "Supplier",
        "established": 2021,
        "employees": "11 - 50",
        "mainProducts": ["Vanilla beans", "Cloves", "Coffee Beans", "Black pepper", "Ceylon Cinnamon Stic"],
        "description": "Riavanille Sarl is a certified and approved exporter whose export vanilla beans and clov directly from Madagascar with tax identification registered number 3005622331. We provide similar grade...",
        "contactName": "Baka Gilbert Philemon",
        "phone": "+261-32-97"
    },
    {
        "companyName": "Begonia",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2024,
        "employees": "1 - 5",
        "mainProducts": ["charcoal", "hardwood", "vanilla", "vanilla bean", "vanilla extract", "vanilla powder"],
        "description": "begonia is Company in Indonesia. basic regulation company start from under name. begonia is Global partner shopping B2B looking product based from Indonesia for our costumers.",
        "contactName": "Devina Christabel",
        "phone": "+62-81334-"
    },
    {
        "companyName": "La Vanille Du Pacifique. SP.",
        "country": "French Polynesia",
        "businessType": "Supplier",
        "established": 2018,
        "employees": "6 - 10",
        "mainProducts": ["Vanilla bean tahitensis"],
        "description": "Vanille Du Pacifique is the result of a love for taste and our country, French Polynesia. W cultivate our vanilla with passion and patience with the aim of promoting it and offering to great...",
        "contactName": "Chrystopher Loska",
        "phone": "+00-689-87"
    },
    {
        "companyName": "PT. Indonature Global Export",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2024,
        "employees": "6 - 10",
        "mainProducts": ["Vanilla Beans Grade A"],
        "description": "Premium Indonesian Vanilla Vanilloka is an export company based in Magelang, Centra Java, Indonesia, specializing in premium vanilla products. We source directly from train partner farmers who...",
        "contactName": "Andiani Agustin",
        "phone": "+6285-1199-64252"
    },
    {
        "companyName": "Irish West Africa Christian Health Foundation",
        "country": "Benin",
        "businessType": "Buyer",
        "established": 2024,
        "employees": "101 - 500",
        "mainProducts": ["Vanilla Beans", "Soybeans", "Meat", "FruitJuice", "Medicines", "Charcoal", "Corn"],
        "description": "Irish-WACHF representative and co-coordinator in the regional Bloc of West Africa oversees all regional contra projects and tenders for supplying of essential medical /health care products, edible...",
        "contactName": "Bidwell Zinou Isaac",
        "phone": "+229-91749348-"
    },
    {
        "companyName": "Vainuz",
        "country": "Ecuador",
        "businessType": "Manufacturer",
        "established": 2017,
        "employees": "11 - 50",
        "mainProducts": ["Vanilla beans"],
        "description": "We are a premium producer and exporter of Tahitian vanilla beans from Ecuador. Grow in the tropical region of Santo Domingo de los Tschilas, our vanilla is cultivated under greenhouse conditions and...",
        "contactName": "Andrea Cevallos",
        "phone": "+593-987852-584"
    },
    {
        "companyName": "Pt Fadila Indo Nature",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2025,
        "employees": "1 - 5",
        "mainProducts": ["vanilla bean", "spices", "cinnamon", "mace", "coconut"],
        "description": "PT Fadila Indo Nature is exporting company for Indonesian spices (cinnamon, mace, cloves, nutmeg), vanilla, coconut, and charcoal briquettes. We take pride in offering the best product quality at...",
        "contactName": "Achmad Zulkarnain",
        "phone": "+62-822-11566667"
    },
    {
        "companyName": "CV. Anju Raja Niaga",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2024,
        "employees": "1 - 5",
        "mainProducts": ["vanilla beans"],
        "description": "We are a direct supplier of vanilla beans from Indonesia, based in Medan, North Sumat We specialize in providing and supplying the finest quality dried Planifolia vanilla beans from Indonesia in...",
        "contactName": "Ojak Damanik",
        "phone": "+62-823-60776777"
    },
    {
        "companyName": "Kilembe Vanilla Exporters LTD",
        "country": "Uganda",
        "businessType": "Supplier",
        "established": 2017,
        "employees": "6 - 10",
        "mainProducts": ["vanilla powder", "vanilla extract", "vanilla beans", "vanilla split", "vanilla perfume"],
        "description": "Kilembe vanilla exporters LTD, is a Ugandan vanilla exporting company based in the capital Kampala, exporting the vanilla spice to different parts of the continents, our exp base countries include...",
        "contactName": "Kato Tito",
        "phone": "+256705928532-592-8532"
    },
    {
        "companyName": "Pt Surya Terang Nusa",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2024,
        "employees": "1 - 5",
        "mainProducts": ["Virgin Coconut Oil", "Coconut Sugar", "Vanilla beans", "Desiccated Coconut"],
        "description": "PT Surya Terang Nusa is a newly established general trading company specializing in the sourcing, distribution and sale of a wide range of products across various industries. We aim to provide...",
        "contactName": "Eveline Effendi",
        "phone": "+62-813-82800970"
    },
    {
        "companyName": "Orbit Nature",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2024,
        "employees": "6 - 10",
        "mainProducts": ["vanilla", "vanilla beans", "agriculture", "indonesia"],
        "description": "since 2018, produce vanilla beans premium, Origin from Indonesia premium vanilla plani folia tahitian",
        "contactName": "Akhdan",
        "phone": "+62-851-56279520"
    },
    {
        "companyName": "SUNTARA PERINTIS JAYA",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2023,
        "employees": "6 - 10",
        "mainProducts": ["vanilla beans"],
        "description": "vanilla is cultivated using traditional methods that respect the environment and the communities we partner with. Our vanilla beans are meticulously selected from the fertile regions of Indonesia,...",
        "contactName": "Eric Sunardi",
        "phone": "+62-8-5845627226"
    },
    {
        "companyName": "Perkasa Wira Energy",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2023,
        "employees": "1 - 5",
        "mainProducts": ["coffee", "beans", "vanilla"],
        "description": "Halo good day Sir/Madam, we are welcome you to our selling page, we are selling coffee beans, vanilla beans a others",
        "contactName": "STEVIYANI",
        "phone": "+62-82157-186488"
    },
    {
        "companyName": "Vanilla Spices Trading LLC",
        "country": "United Arab Emirates",
        "businessType": "Supplier",
        "established": 2024,
        "employees": "1 - 5",
        "mainProducts": ["Vanilla beans", "Gourmet Grade A", "Madagascar", "Vanilla Pods"],
        "description": "Vanilla & Spice is dedicated to delivering the world's finest vanilla and exceptional spices from Madagascar. Through our partnership with the leading producers of the north region of the island, we...",
        "contactName": "Sherif Bedair",
        "phone": "+971-56-6911587"
    },
    {
        "companyName": "Degor Ventures",
        "country": "Cameroon",
        "businessType": "Supplier",
        "established": 1988,
        "employees": "101 - 500",
        "mainProducts": ["Vanilla beans"],
        "description": "We specialized in the distribution of vanilla beans. We have worked hard very the years o satisfy our clients. Cli satisfaction is top priority.",
        "contactName": "William Broke",
        "phone": "+237-673-79354"
    },
    {
        "companyName": "PT Vanilla Pertiwi Makmur",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2023,
        "employees": "6 - 10",
        "mainProducts": ["vanilla bean", "vanilla", "tea", "coffee", "herb", "herba", "chocolate", "perfume", "cream", "powder", "sweetener", "flour", "spice", "spice plane", "fruit"],
        "description": "vanilla farmers with drying using a modern process so that vanilla Pertiwi Maju is free from chemical content and product quality is maintained. Vanilla Pertiwi Makmur has vanilla beans that are not...",
        "contactName": "Iqbal Fatma Rizki Fauzi",
        "phone": "+62-0-81237763050"
    },
    {
        "companyName": "Pt. Sukses Indo Gosyen",
        "country": "Indonesia",
        "businessType": "Supplier",
        "established": 2020,
        "employees": "11 - 50",
        "mainProducts": ["clove", "Cinnamon", "Vanilla Beans", "Copra", "Mace Dried", "Black pepper", "White Pepper", "Arabica Coffee"],
        "description": "We export the best spices from Indonesia with excellent quality and competitive prices Our prices are competitive because we source directly from local farmers. We hope to work together to export...",
        "contactName": "Sylvia",
        "phone": "+62-8158611-2855"
    },
    {
        "companyName": "PT. Amal Bahri Investama",
        "country": "Indonesia",
        "businessType": "Manufacturer",
        "established": 2019,
        "employees": "6 - 10",
        "mainProducts": ["Charcoal", "Sacha Inchi", "Sugar cane molasses", "shipping", "Vanilla Bean", "Agarwood"],
        "description": "PT. Amal Bahri Investama, your trusted partner for Indonesian product expertise, project management, and investment facilitation. At Amal Bahri, we are dedicated to delivering exceptional services...",
        "contactName": "Rofiq Imron Rosidi",
        "phone": "+62-813-75361077"
    },
    {
        "companyName": "Sas Clairet",
        "country": "France",
        "businessType": "Manufacturer",
        "established": 2019,
        "employees": "1 - 5",
        "mainProducts": ["vanilla", "bean", "tonka", "oedible flower"],
        "description": "Founded in 2019, SAS Clairet began its journey with a singular, exquisite product: Madagascar Vanilla. Embracing its French roots, the brand has since flourished, offerin diverse range of over 60...",
        "contactName": "Maxime Clairet",
        "phone": "+33-06-76349308"
    }
]


def gen_companies_file(companies, prefix, filename, name_prefix):
    out = []
    out.append(f"import {{ CompanyProfile }} from '../types';\n\n")
    out.append(f"export const GLOBAL_{prefix}_COMPANIES: CompanyProfile[] = [")
    for i, c in enumerate(companies):
        trustScore = 75 + (i % 25)
        out.append("  {")
        out.append(f"    id: 'comp-{name_prefix}-{i}',")
        out.append(f"    companyName: {json.dumps(c['companyName'])},")
        out.append(f"    businessType: {json.dumps(c['businessType'])},")
        out.append(f"    country: {json.dumps(c['country'])},")
        out.append(f"    establishedYear: {c['established']},")
        out.append(f"    totalEmployees: {json.dumps(c['employees'])},")
        out.append(f"    mainProducts: {json.dumps(c['mainProducts'])},")
        out.append(f"    description: {json.dumps(c['description'])},")
        out.append(f"    trustScore: {trustScore},")
        out.append(f"    isVerified: true,")
        out.append(f"    tier: {json.dumps('Gold' if i%3==0 else 'Silver')},")
        out.append(f"    contactPerson: {json.dumps(c['contactName'])},")
        out.append(f"    contactPhone: {json.dumps(c['phone'])}")
        out.append("  },")
    out.append("];\n")
    with open(f"src/data/{filename}.ts", "w") as f:
        f.write("\n".join(out))

gen_companies_file(cashews_companies, "CASHEW", "cashewCompanies", "th-cash")
gen_companies_file(vanilla_companies, "VANILLA", "vanillaBeansCompanies", "th-van")

def gen_buyers_file(companies, prefix, filename, name_prefix):
    out = []
    out.append(f"import {{ DetailedBuyerProfile }} from '../types';\n\n")
    out.append(f"export const GLOBAL_{prefix}_BUYER_PROFILES: DetailedBuyerProfile[] = [")
    buyers = [c for i, c in enumerate(companies) if c['businessType'] == 'Buyer' or i%4==0]
    for i, c in enumerate(buyers):
        out.append("  {")
        out.append(f"    id: 'buyer-{name_prefix}-{i}',")
        out.append(f"    companyName: {json.dumps(c['companyName'])},")
        out.append(f"    country: {json.dumps(c['country'])},")
        out.append(f"    totalSourcingRequests: {10 + i * 5},")
        out.append(f"    memberSince: '{c['established']}-01-01',")
        out.append(f"    isVerified: true,")
        out.append(f"    preferredSourcingCategories: {json.dumps(c['mainProducts'])},")
        out.append(f"    contactName: {json.dumps(c['contactName'])},")
        out.append(f"    contactPhone: {json.dumps(c['phone'])}")
        out.append("  },")
    out.append("];\n")
    with open(f"src/data/{filename}.ts", "w") as f:
        f.write("\n".join(out))

gen_buyers_file(cashews_companies, "CASHEW", "cashewBuyers", "th-cash")
gen_buyers_file(vanilla_companies, "VANILLA", "vanillaBeansBuyers", "th-van")

def gen_products_file(companies, prefix, filename, name_prefix, cat):
    out = []
    out.append(f"import {{ Product }} from '../types';\n\n")
    out.append(f"export const GLOBAL_{prefix}_PRODUCTS: Product[] = [")
    for i, c in enumerate(companies):
        if not c['mainProducts']: continue
        prodName = c['mainProducts'][0]
        out.append("  {")
        out.append(f"    id: 'prod-{name_prefix}-{i}',")
        out.append(f"    title: {json.dumps(prodName)},")
        out.append(f"    category: '{cat}',")
        out.append(f"    supplierId: 'comp-{name_prefix}-{i}',")
        out.append(f"    supplierName: {json.dumps(c['companyName'])},")
        out.append(f"    supplierCountry: {json.dumps(c['country'])},")
        out.append(f"    minOrderQuantity: '1 Ton',")
        out.append(f"    moq: 1,")
        out.append(f"    priceTiers: [{{ minUnits: 1, maxUnits: 10, priceUsd: {1000 + (i*150)} }}],")
        out.append(f"    images: [],")
        out.append(f"    specifications: [{{ name: 'Type', value: {json.dumps(prodName)} }}],")
        out.append(f"    description: {json.dumps(c['description'])}")
        out.append("  },")
    out.append("];\n")
    with open(f"src/data/{filename}.ts", "w") as f:
        f.write("\n".join(out))

gen_products_file(cashews_companies, "CASHEW", "cashewProducts", "th-cash", "Cashew Nuts")
gen_products_file(vanilla_companies, "VANILLA", "vanillaBeansProducts", "th-van", "Vanilla Beans")

def gen_rfqs_file(companies, prefix, filename, name_prefix):
    out = []
    out.append(f"import {{ RfqRequirement }} from '../types';\n\n")
    out.append(f"export const GLOBAL_{prefix}_RFQS: RfqRequirement[] = [")
    buyers = [c for i, c in enumerate(companies) if c['businessType'] == 'Buyer' or i%3==0]
    for i, c in enumerate(buyers):
        if not c['mainProducts']: continue
        prodName = c['mainProducts'][0]
        out.append("  {")
        out.append(f"    id: 'RFQ-TH-{name_prefix.upper()}-{1000+i}',")
        out.append(f"    buyerId: 'buyer-{name_prefix}-{i}',")
        out.append(f"    buyerName: {json.dumps(c['contactName'])},")
        out.append(f"    buyerCompany: {json.dumps(c['companyName'])},")
        out.append(f"    buyerCountry: {json.dumps(c['country'])},")
        out.append(f"    productName: {json.dumps(prodName)},")
        out.append(f"    category: {json.dumps(prodName)},")
        out.append(f"    targetQuantity: {10 + i * 5},")
        out.append(f"    quantityUnit: 'Tons',")
        out.append(f"    postedDate: '2026-08-30T00:00:00.000Z',")
        out.append(f"    expiryDate: '2026-09-30T00:00:00.000Z',")
        out.append(f"    status: 'OPEN',")
        out.append(f"    quotesCount: {i % 5},")
        out.append(f"    buyerVerified: true,")
        out.append(f"    destinationPort: 'Any Port, {c['country']}',")
        out.append(f"    preferredIncoterm: 'CIF',")
        out.append(f"    detailedRequirements: {json.dumps('Looking for ' + prodName + '. ' + c['description'])}")
        out.append("  },")
    out.append("];\n")
    with open(f"src/data/{filename}.ts", "w") as f:
        f.write("\n".join(out))

gen_rfqs_file(cashews_companies, "CASHEW", "cashewRfqs", "th-cash")
gen_rfqs_file(vanilla_companies, "VANILLA", "vanillaBeansRfqs", "th-van")
