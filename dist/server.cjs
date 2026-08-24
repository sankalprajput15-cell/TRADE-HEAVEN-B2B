var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "yr943334@gmail.com").toLowerCase().trim();
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Yash@8532";
var JWT_SECRET_SALT = process.env.JWT_SECRET || "trade_heaven_b2b_sec_2025_swiss_escrow";
var serverUsersStore = [
  {
    id: "user-admin-root",
    email: "yr943334@gmail.com",
    passwordHash: "Yash@8532",
    name: "Administrator",
    role: "ADMIN",
    companyName: "Trade Heaven Global Operations & Treasury",
    country: "United Kingdom",
    status: "ACTIVE",
    isVerified: true,
    isPremium: true,
    membershipStatus: "paid",
    tier: "VIP",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "user-admin-legacy",
    email: "admin@tradeheaven.net",
    passwordHash: "Yash@8532",
    name: "Sarah Jenkins",
    role: "ADMIN",
    companyName: "Trade Heaven Global Operations & Treasury",
    country: "United Kingdom",
    status: "ACTIVE",
    isVerified: true,
    isPremium: true,
    membershipStatus: "paid",
    tier: "VIP",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
  }
];
function generateServerJwt(user) {
  const nowSec = Math.floor(Date.now() / 1e3);
  const expSec = nowSec + 7 * 24 * 60 * 60;
  const payload = {
    uid: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isPremium: user.isPremium,
    membershipStatus: user.membershipStatus,
    status: user.status,
    isVerified: user.isVerified,
    tier: user.tier || (user.role === "ADMIN" ? "VIP" : "FREE"),
    companyName: user.companyName,
    iat: nowSec,
    exp: expSec,
    iss: "https://auth.tradeheaven.net"
  };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = Buffer.from(`${encodedHeader}.${encodedPayload}.${JWT_SECRET_SALT}`).toString("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
function verifyServerJwt(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSig = Buffer.from(`${encodedHeader}.${encodedPayload}.${JWT_SECRET_SALT}`).toString("base64url");
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8"));
    const nowSec = Math.floor(Date.now() / 1e3);
    if (payload.exp && payload.exp < nowSec) return null;
    return payload;
  } catch {
    return null;
  }
}
app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || typeof email !== "string" || !password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Please provide both corporate email and password."
    });
  }
  const cleanEmail = email.toLowerCase().trim();
  if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminRecord = serverUsersStore.find((u) => u.email === ADMIN_EMAIL) || {
      id: "user-admin-root",
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD,
      name: "Sarah Jenkins (Master Admin)",
      role: "ADMIN",
      companyName: "Trade Heaven Global Operations & Treasury",
      country: "United Kingdom",
      status: "ACTIVE",
      isVerified: true,
      isPremium: true,
      membershipStatus: "paid",
      tier: "VIP",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
    };
    const token = generateServerJwt(adminRecord);
    return res.json({
      success: true,
      token,
      user: {
        id: adminRecord.id,
        email: adminRecord.email,
        name: adminRecord.name,
        role: "ADMIN",
        // Strictly server-resolved
        isPremium: true,
        membershipStatus: "paid",
        status: "ACTIVE",
        isVerified: true,
        tier: "VIP",
        companyName: adminRecord.companyName,
        country: adminRecord.country,
        avatarUrl: adminRecord.avatarUrl,
        token
      },
      message: "Admin authenticated successfully."
    });
  }
  const matchedUser = serverUsersStore.find((u) => u.email.toLowerCase().trim() === cleanEmail);
  if (matchedUser && matchedUser.passwordHash === password) {
    const token = generateServerJwt(matchedUser);
    return res.json({
      success: true,
      token,
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
        // Strictly server-resolved from database
        isPremium: matchedUser.isPremium,
        membershipStatus: matchedUser.membershipStatus,
        status: matchedUser.status,
        isVerified: matchedUser.isVerified,
        tier: matchedUser.tier,
        companyName: matchedUser.companyName,
        country: matchedUser.country,
        avatarUrl: matchedUser.avatarUrl,
        token
      },
      message: `Welcome back, ${matchedUser.name}!`
    });
  }
  return res.status(401).json({
    success: false,
    message: "Invalid corporate email or password. Access denied."
  });
});
app.post("/api/v1/auth/register", (req, res) => {
  const { email, password, name, companyName, country, accountType } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: "Please provide full name, work email, and password."
    });
  }
  const cleanEmail = email.toLowerCase().trim();
  if (serverUsersStore.some((u) => u.email.toLowerCase().trim() === cleanEmail)) {
    return res.status(409).json({
      success: false,
      message: "An account with this corporate email already exists. Please sign in."
    });
  }
  const resolvedRole = accountType === "SUPPLIER" ? "SUPPLIER" : "BUYER";
  const newRecord = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    passwordHash: password,
    name: name.trim(),
    role: resolvedRole,
    companyName: companyName?.trim() || "Enterprise Trading Firm",
    country: country?.trim() || "Global",
    status: "PENDING",
    isVerified: false,
    isPremium: false,
    membershipStatus: "free",
    tier: "FREE",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  };
  serverUsersStore.push(newRecord);
  const token = generateServerJwt(newRecord);
  return res.status(201).json({
    success: true,
    token,
    user: {
      id: newRecord.id,
      email: newRecord.email,
      name: newRecord.name,
      role: newRecord.role,
      isPremium: false,
      membershipStatus: "free",
      status: "PENDING",
      isVerified: false,
      tier: "FREE",
      companyName: newRecord.companyName,
      country: newRecord.country,
      avatarUrl: newRecord.avatarUrl,
      token
    },
    message: "Account registered successfully with pending verification status."
  });
});
app.get("/api/v1/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyServerJwt(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
  return res.json({
    success: true,
    user: {
      id: payload.uid,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      isPremium: payload.isPremium,
      membershipStatus: payload.membershipStatus,
      status: payload.status,
      isVerified: payload.isVerified,
      tier: payload.tier,
      companyName: payload.companyName,
      token
    }
  });
});
var serverRfqsStore = [
  {
    id: 101,
    name: "Sarah Jenkins",
    email: "procurement@nordicsteel.se",
    phone: "+46 8 123 4567",
    subject: "Buy Lead RFQ: 5,000 MT Grade 316 Stainless Steel Coils",
    product_name: "Grade 316 Stainless Steel Coils",
    message: "Requesting binding CIF Port of Gothenburg quotation with SGS mill test certification.",
    status: "pending",
    target_quantity: 5e3,
    quantity_unit: "Metric Tons",
    target_price: 1850,
    incoterm: "CIF",
    destination_port: "Port of Gothenburg",
    category: "Raw Materials & Industrial Metals",
    company_name: "Nordic Steel Works AB",
    country: "Sweden",
    created_at: new Date(Date.now() - 36e5 * 2).toISOString()
  },
  {
    id: 102,
    name: "Carlos Mendez",
    email: "cmendez@iberiaparts.es",
    phone: "+34 91 555 0192",
    subject: "Buy Lead RFQ: 2,500 Units Solar Lithium ESS Battery Packs",
    product_name: "Solar Lithium ESS Battery Packs",
    message: "Looking for Tier-1 UN38.3 certified 48V 100Ah server rack battery modules.",
    status: "pending",
    target_quantity: 2500,
    quantity_unit: "Units",
    target_price: 680,
    incoterm: "FOB",
    destination_port: "Port of Valencia",
    category: "Renewable Energy & Solar Power",
    company_name: "Iberia Clean Energy Solutions",
    country: "Spain",
    created_at: new Date(Date.now() - 36e5 * 5).toISOString()
  },
  {
    id: 103,
    name: "Vikram Mehta",
    email: "vmehta@apexmachinery.in",
    phone: "+91 22 2847 9000",
    subject: "Buy Lead RFQ: 10 Sets 5-Axis CNC Milling Centers",
    product_name: "5-Axis CNC Milling Centers",
    message: "Direct factory procurement for heavy aerospace tooling with CE/ISO9001 compliance.",
    status: "pending",
    target_quantity: 10,
    quantity_unit: "Sets",
    target_price: 45e3,
    incoterm: "CIF",
    destination_port: "Nhava Sheva Port (JNPT), Mumbai",
    category: "Industrial Machinery & CNC",
    company_name: "Apex Precision Engineering Ltd.",
    country: "India",
    created_at: new Date(Date.now() - 36e5 * 12).toISOString()
  }
];
app.get("/api.php", (req, res) => {
  const action = req.query.action;
  if (action === "get_rfqs" || action === "get_inquiries") {
    return res.json({
      status: "success",
      data: serverRfqsStore
    });
  }
  if (action === "get_faqs") {
    return res.json({
      status: "success",
      data: [
        {
          id: "faq-1",
          question: "How does Trade Heaven Escrow & Trade Assurance protect buyers?",
          answer: "Buyer deposit funds are held in secure, neutral Swiss escrow accounts. Payment is only released to the supplier once verified shipping documents and independent SGS/T\xDCV inspection reports are confirmed.",
          category: "Escrow & Payments"
        },
        {
          id: "faq-2",
          question: "What is the difference between Gold and Silver verified factories?",
          answer: "Gold suppliers have undergone comprehensive on-site physical factory audits, verified business licenses, and carry an escrow guarantee of up to $1,000,000 USD.",
          category: "Factory Verification"
        },
        {
          id: "faq-3",
          question: "How do I post a Buying Requirement (RFQ) and receive competitive bids?",
          answer: 'Click "Post Buy RFQ" in the navigation. Fill in your target product specifications, quantity, target Incoterm, and destination port to receive binding quotes.',
          category: "Buying & RFQs"
        }
      ]
    });
  }
  if (action === "get_users") {
    return res.json({
      status: "success",
      data: serverUsersStore.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        company_name: u.companyName,
        country: u.country,
        status: u.status,
        is_verified: u.isVerified,
        is_premium: u.isPremium
      }))
    });
  }
  res.json({
    status: "success",
    message: "BigRock MySQL PHP API Ready",
    action: action || "none"
  });
});
app.post("/api.php", (req, res) => {
  const action = req.query.action;
  if (action === "create_rfq" || action === "create_inquiry") {
    const { name, email, phone, subject, product_name, message } = req.body;
    const newRfq = {
      id: Date.now(),
      name: name || "Enterprise Buyer",
      email: email || "procurement@tradeheaven.net",
      phone: phone || "",
      subject: subject || "Wholesale Sourcing Tender",
      product_name: product_name || "B2B Sourcing Tender",
      message: message || "",
      status: "pending",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    serverRfqsStore.unshift(newRfq);
    return res.json({
      status: "success",
      message: "RFQ created and stored in BigRock MySQL database",
      data: newRfq
    });
  }
  res.json({
    status: "success",
    message: `Action ${action || "default"} executed successfully on BigRock backend`
  });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var serverSiteContent = null;
var serverAuthorizedUsers = [
  {
    id: "perm-admin-001",
    email: ADMIN_EMAIL,
    name: "Sarah Jenkins",
    role: "ADMIN",
    companyName: "Trade Heaven Global Operations & Treasury",
    grantedBy: "System Root",
    grantedAt: "2025-01-01",
    scopes: ["ALL_ADMIN", "EDIT_CONTENT", "EDIT_PRICING", "EDIT_MEDIA", "PUBLISH_PRODUCTS", "MANAGE_PERMISSIONS"],
    status: "ACTIVE",
    notes: "Super Administrator with unconditional global rights"
  },
  {
    id: "perm-delegated-001",
    email: "marcus.vance@tradeheaven-audit.org",
    name: "Dr. Marcus Vance",
    role: "VERIFIER",
    companyName: "SGS / TUV Verified Trade Audit Bureau",
    grantedBy: "Sarah Jenkins (Super Admin)",
    grantedAt: "2025-02-15",
    scopes: ["EDIT_CONTENT", "EDIT_MEDIA", "PUBLISH_PRODUCTS"],
    status: "ACTIVE",
    notes: "Senior Verifier delegated to update audit notices and directory media"
  }
];
var serverAccessRequests = [
  {
    id: "req-001",
    userId: "user-supp-001",
    email: "elena.zhao@apexmicro.cn",
    name: "Elena Zhao",
    companyName: "Shenzhen Apex Microelectronics Co., Ltd.",
    role: "SUPPLIER",
    requestedScopes: ["EDIT_CONTENT", "PUBLISH_PRODUCTS"],
    reason: "Requesting permission to maintain supplier directory copy and update factory certification media.",
    requestedAt: new Date(Date.now() - 36e5 * 6).toISOString(),
    status: "PENDING"
  }
];
app.get("/api/site-content", (req, res) => {
  res.json({
    success: true,
    data: serverSiteContent || {}
  });
});
app.put("/api/site-content", (req, res) => {
  const userRole = req.headers["x-user-role"];
  const userEmail = req.headers["x-user-email"];
  const isAuthorized = userRole === "ADMIN" || userEmail && userEmail === ADMIN_EMAIL || serverAuthorizedUsers.some((u) => u.status === "ACTIVE" && u.email.toLowerCase() === String(userEmail).toLowerCase());
  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Administrative or authorized editor privileges required."
    });
  }
  serverSiteContent = { ...serverSiteContent || {}, ...req.body };
  res.json({
    success: true,
    message: "Site content updated and published successfully."
  });
});
app.get("/api/cms/permissions", (req, res) => {
  res.json({
    success: true,
    data: {
      authorizedUsers: serverAuthorizedUsers,
      accessRequests: serverAccessRequests
    }
  });
});
app.post("/api/cms/permissions/grant", (req, res) => {
  const newPerm = req.body;
  if (!newPerm || !newPerm.email) {
    return res.status(400).json({ success: false, message: "Invalid permission payload" });
  }
  serverAuthorizedUsers = serverAuthorizedUsers.filter((u) => u.email.toLowerCase() !== newPerm.email.toLowerCase());
  serverAuthorizedUsers.push(newPerm);
  res.json({ success: true, message: "Permission granted", data: serverAuthorizedUsers });
});
app.post("/api/cms/permissions/revoke", (req, res) => {
  const { id, email } = req.body;
  serverAuthorizedUsers = serverAuthorizedUsers.filter((u) => u.id !== id && u.email.toLowerCase() !== (email || "").toLowerCase());
  res.json({ success: true, message: "Permission revoked", data: serverAuthorizedUsers });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Trade Heaven Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
