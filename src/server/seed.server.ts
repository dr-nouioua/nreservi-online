import { db } from "../../db/index.js";
import {
  restaurants,
  restaurantOwners,
  staffUsers,
  adminUsers,
  areas,
  tables,
  menuCategories,
  menuItems,
  customers,
  reservations,
  marketingSegments,
  marketingTemplates,
  marketingRules,
  campaignLogs,
} from "../../db/schema.js";
import { hashPassword } from "./crypto.server.js";
import { sql } from "drizzle-orm";

let seeded = false;

/**
 * Demo seeding is OFF by default. Set SEED_DEMO=true in the environment to
 * populate demo restaurants and accounts (development/demo only — never in
 * production with real customers).
 */
export async function ensureSeeded() {
  if (seeded) return;
  if (process.env.SEED_DEMO !== "true") {
    seeded = true;
    return;
  }
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(restaurants);
  if (Number(count) > 0) {
    seeded = true;
    return;
  }

  await db.insert(adminUsers).values({
        role: "super",
        permissions: ["onboard", "subscriptions", "emails", "ads", "contacts", "mail"],
    email: "admin@platform.dev",
    passwordHash: hashPassword("admin123"),
    name: "Platform Admin",
  }).onConflictDoNothing();

  await db.insert(adminUsers).values({
        role: "admin",
        permissions: ["contacts", "ads"],
    email: "agent@platform.dev",
    passwordHash: hashPassword("agent1234"),
    name: "Agent Commercial Demo",
  }).onConflictDoNothing();

  const hours = {
    mon: [{ open: "12:00", close: "23:00" }],
    tue: [{ open: "12:00", close: "23:00" }],
    wed: [{ open: "12:00", close: "23:00" }],
    thu: [{ open: "12:00", close: "23:00" }],
    fri: [{ open: "12:00", close: "23:30" }],
    sat: [{ open: "12:00", close: "23:30" }],
    sun: [{ open: "12:00", close: "22:00" }],
  };

  const seedRestaurant = async (opts: {
    slug: string;
    name: string;
    category?: string;
    city: string;
    cuisine: string;
    avgTicket: string;
    ownerEmail: string;
    coverImageUrl: string;
    logoUrl: string;
  }) => {
    const [r] = await db
      .insert(restaurants)
      .values({
        slug: opts.slug,
        name: opts.name,
        category: opts.category || "restaurant",
        city: opts.city,
        cuisine: opts.cuisine,
        address: `12 Market Street, ${opts.city}`,
        contactEmail: opts.ownerEmail,
        contactPhone: "+1 555 0100",
        whatsappNumber: "+1 555 0199",
        logoUrl: opts.logoUrl,
        coverImageUrl: opts.coverImageUrl,
        description: `${opts.name} is a beloved ${opts.cuisine} spot in ${opts.city}, known for seasonal menus and warm hospitality.`,
        avgTicketPrice: opts.avgTicket,
        status: "active",
        subscriptionTier: "premium",
        openingHours: hours,
      })
      .returning();

    await db.insert(restaurantOwners).values({
      restaurantId: r.id,
      email: opts.ownerEmail,
      passwordHash: hashPassword("owner123"),
      name: `${opts.name} Owner`,
    });

    await db.insert(staffUsers).values({
      restaurantId: r.id,
      email: `host-${opts.slug}@platform.dev`,
      passwordHash: hashPassword("host123"),
      name: "Front of House",
      role: "host",
    });

    const areaNames = ["Indoor", "Terrace", "Bar"];
    const areaRows = await db
      .insert(areas)
      .values(areaNames.map((name) => ({ restaurantId: r.id, name })))
      .returning();

    const tableRows: { restaurantId: number; areaId: number; label: string; capacity: number; posX: number; posY: number; shape: string }[] = [];
    areaRows.forEach((area, areaIdx) => {
      for (let i = 1; i <= 6; i++) {
        tableRows.push({
          restaurantId: r.id,
          areaId: area.id,
          label: `${area.name[0]}${i}`,
          capacity: [2, 2, 4, 4, 6, 8][i - 1] ?? 4,
          posX: (i % 3) * 90 + areaIdx * 10,
          posY: Math.floor((i - 1) / 3) * 90,
          shape: i % 2 === 0 ? "round" : "square",
        });
      }
    });
    const insertedTables = await db.insert(tables).values(tableRows).returning();

    const categories = ["Starters", "Mains", "Desserts", "Drinks"];
    const catRows = await db
      .insert(menuCategories)
      .values(categories.map((name, idx) => ({ restaurantId: r.id, name, sortOrder: idx })))
      .returning();

    const itemsByCat: Record<string, { name: string; price: string; description: string; photoUrl: string }[]> = {
      Starters: [
        { name: "Burrata & Heirloom Tomato", price: "12.00", description: "Basil oil, sourdough crisp", photoUrl: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=700&q=80" },
        { name: "Charred Octopus", price: "16.00", description: "Smoked paprika, lemon", photoUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=80" },
      ],
      Mains: [
        { name: "Wood-Fired Sea Bass", price: "28.00", description: "Fennel, citrus butter", photoUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80" },
        { name: "Truffle Tagliatelle", price: "24.00", description: "Fresh pasta, black truffle", photoUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=80" },
        { name: "Dry-Aged Ribeye", price: "36.00", description: "Bone marrow jus", photoUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80" },
      ],
      Desserts: [{ name: "Basque Cheesecake", price: "9.00", description: "Salted caramel", photoUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80" }],
      Drinks: [
        { name: "House Negroni", price: "13.00", description: "Barrel-aged", photoUrl: "https://images.unsplash.com/photo-1551751299-1b51cab2694c?auto=format&fit=crop&w=700&q=80" },
        { name: "Citrus Spritz", price: "11.00", description: "Non-alcoholic option available", photoUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=80" },
      ],
    };

    for (const cat of catRows) {
      const items = itemsByCat[cat.name] ?? [];
      if (items.length) {
        await db.insert(menuItems).values(
          items.map((it) => ({
            restaurantId: r.id,
            categoryId: cat.id,
            name: it.name,
            description: it.description,
            price: it.price,
            photoUrl: it.photoUrl,
            available: true,
          })),
        );
      }
    }

    const segNames: { name: string; kind: string }[] = [
      { name: "Lapsed 30+ days", kind: "lapsed_30" },
      { name: "Birthday this week", kind: "birthday_week" },
      { name: "High-frequency VIPs", kind: "vip" },
      { name: "No-shows to win back", kind: "no_show_winback" },
    ];
    const segRows = await db
      .insert(marketingSegments)
      .values(segNames.map((s) => ({ restaurantId: r.id, name: s.name, kind: s.kind })))
      .returning();

    const templateRows = await db
      .insert(marketingTemplates)
      .values([
        {
          restaurantId: r.id,
          name: "We miss you",
          body: "Hi {{name}}, it's been a while since your visit on {{last_visit_date}}! Book this week and use code {{offer_code}} for 15% off.",
        },
        {
          restaurantId: r.id,
          name: "Happy Birthday",
          body: "Happy Birthday {{name}}! Celebrate with us — show code {{offer_code}} for a complimentary dessert.",
        },
        {
          restaurantId: r.id,
          name: "VIP thank you",
          body: "Thank you for being one of our most loyal guests, {{name}}! Enjoy priority booking with code {{offer_code}}.",
        },
      ])
      .returning();

    await db.insert(marketingRules).values([
      { restaurantId: r.id, segmentId: segRows[0].id, templateId: templateRows[0].id, active: true },
      { restaurantId: r.id, segmentId: segRows[1].id, templateId: templateRows[1].id, active: true },
      { restaurantId: r.id, segmentId: segRows[2].id, templateId: templateRows[2].id, active: true },
    ]);

    const custData = [
      { phone: `+1555${r.id}0001`, name: "Ava Thompson" },
      { phone: `+1555${r.id}0002`, name: "Liam Chen" },
      { phone: `+1555${r.id}0003`, name: "Sofia Martinez" },
      { phone: `+1555${r.id}0004`, name: "Noah Williams" },
    ];
    const custRows = await db
      .insert(customers)
      .values(custData.map((c) => ({ phone: c.phone, name: c.name, whatsappOptIn: true })))
      .onConflictDoNothing()
      .returning();

    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const statuses = ["confirmed", "seated", "completed", "no_show", "cancelled"];
    const resRows: any[] = [];
    for (let i = 0; i < 14; i++) {
      const dayOffset = i % 5 === 0 ? -3 : i % 3 === 0 ? 1 : 0;
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);
      const table = insertedTables[i % insertedTables.length];
      const cust = custRows[i % custRows.length] ?? null;
      resRows.push({
        restaurantId: r.id,
        customerId: cust?.id ?? null,
        tableId: table.id,
        areaId: table.areaId,
        guestName: cust?.name ?? `Guest ${i + 1}`,
        guestPhone: cust?.phone ?? `+1555000${i}`,
        partySize: [2, 2, 4, 3, 6][i % 5],
        date: fmt(d),
        time: `${12 + (i % 8)}:${i % 2 === 0 ? "00" : "30"}:00`,
        status: dayOffset < 0 ? statuses[i % statuses.length] : i % 3 === 0 ? "seated" : "confirmed",
        source: i % 5 === 0 ? "walk_in" : "online",
        specialRequests: i % 4 === 0 ? "Birthday celebration" : "",
        confirmationCode: `SEED${r.id}${i}`,
      });
    }
    await db.insert(reservations).values(resRows);

    if (custRows.length) {
      await db.insert(campaignLogs).values([
        { restaurantId: r.id, ruleId: null, customerId: custRows[0].id, templateId: templateRows[0].id, status: "booked" },
        { restaurantId: r.id, ruleId: null, customerId: custRows[1].id, templateId: templateRows[0].id, status: "read" },
        { restaurantId: r.id, ruleId: null, customerId: custRows[2].id, templateId: templateRows[1].id, status: "delivered" },
      ]);
    }

    return r;
  };

  // ── Restaurants ──────────────────────────────────────────────────────
  await seedRestaurant({
    slug: "le-17-corner",
    name: "Le 17 Corner",
    city: "Algiers",
    cuisine: "Cuisine algérienne, Pizza, Grillades",
    avgTicket: "18.00",
    ownerEmail: "owner@le17corner.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
  });

  await seedRestaurant({
    slug: "la-villa-constantine",
    name: "La Villa",
    city: "Constantine",
    cuisine: "Cuisine française, Méditerranéen",
    avgTicket: "32.00",
    ownerEmail: "owner@lavilla.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=300&q=80",
  });

  // ── Beauty Salons ───────────────────────────────────────────────────
  await seedRestaurant({
    slug: "beauty-paradise",
    name: "Beauty Paradise",
    category: "beauty_salon",
    city: "Algiers",
    cuisine: "Coiffure, Manucure, Soins du visage",
    avgTicket: "25.00",
    ownerEmail: "owner@beautyparadise.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
  });

  await seedRestaurant({
    slug: "salon-elegance",
    name: "Salon Élégance",
    category: "beauty_salon",
    city: "Annaba",
    cuisine: "Coiffure, Barbe, Coloration",
    avgTicket: "20.00",
    ownerEmail: "owner@salonelegance.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=300&q=80",
  });

  // ── Spas ────────────────────────────────────────────────────────────
  await seedRestaurant({
    slug: "spa-serenity",
    name: "Spa Sérénité",
    category: "spa",
    city: "Oran",
    cuisine: "Massage, Hammam, Soins du corps",
    avgTicket: "45.00",
    ownerEmail: "owner@spaserenite.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?auto=format&fit=crop&w=300&q=80",
  });

  await seedRestaurant({
    slug: "hammam-el-baraka",
    name: "Hammam El Baraka",
    category: "spa",
    city: "Blida",
    cuisine: "Hammam traditionnel, Gommage, Massage",
    avgTicket: "15.00",
    ownerEmail: "owner@hammambaraka.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=300&q=80",
  });

  // ── Football Pitches ────────────────────────────────────────────────
  await seedRestaurant({
    slug: "terrain-goal",
    name: "Terrain Goal Arena",
    category: "football_pitch",
    city: "Algiers",
    cuisine: "5v5 Synthétique, 6v6, 7v7 Indoor",
    avgTicket: "20.00",
    ownerEmail: "owner@terraingoal.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=300&q=80",
  });

  await seedRestaurant({
    slug: "football-park5",
    name: "Football Park 5v5",
    category: "football_pitch",
    city: "Oran",
    cuisine: "5v5 Gazon synthétique, Éclairé",
    avgTicket: "18.00",
    ownerEmail: "owner@footballpark5.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=300&q=80",
  });

  await seedRestaurant({
    slug: "complexe-sportif-constantine",
    name: "Complexe Sportif Constantine",
    category: "football_pitch",
    city: "Constantine",
    cuisine: "7v7 Extérieur, 5v5 Couvert",
    avgTicket: "22.00",
    ownerEmail: "owner@complexeconstantine.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=300&q=80",
  });

  // ── Car Rentals ─────────────────────────────────────────────────────
  await seedRestaurant({
    slug: "rent-drive",
    name: "Rent & Drive Algérie",
    category: "car_rental",
    city: "Algiers",
    cuisine: "Berline, SUV, Utilitaire",
    avgTicket: "35.00",
    ownerEmail: "owner@rentdrive.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1449965408869-ebd3fee4656e?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=300&q=80",
  });

  await seedRestaurant({
    slug: "location-auto-plus",
    name: "Location Auto Plus",
    category: "car_rental",
    city: "Oran",
    cuisine: "Citadine, Berline, SUV 4x4",
    avgTicket: "30.00",
    ownerEmail: "owner@locationautoplus.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=300&q=80",
  });

  // Doctor establishments
  await seedRestaurant({
    slug: "cabinet-dr-benali",
    name: "Cabinet Dr Benaali",
    category: "doctor",
    city: "Alger",
    cuisine: "Cardiologue",
    avgTicket: "20.00",
    ownerEmail: "dr.benali@cabinet.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=300&q=80",
  });
  await seedRestaurant({
    slug: "cabinet-dr-mebarki",
    name: "Cabinet Dr Mebarki",
    category: "doctor",
    city: "Oran",
    cuisine: "Généraliste, Pédiatre",
    avgTicket: "15.00",
    ownerEmail: "dr.mebarki@cabinet.dev",
    coverImageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=80",
    logoUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=300&q=80",
  });

  // A restaurant awaiting super-admin approval, to demonstrate onboarding workflow
  await db.insert(restaurants).values({
    slug: "cafe-dz-annaba",
    name: "Café DZ Annaba",
    city: "Annaba",
    cuisine: "Café, Pâtisserie, Petit-déjeuner",
    address: "14 Rue Didouche Mourad, Annaba",
    contactEmail: "owner@cafedz.dev",
    contactPhone: "+213 38 86 12 34",
    whatsappNumber: null,
    description: "Nouveau café en attente de validation par l'administration.",
    avgTicketPrice: "8.00",
    status: "pending",
    subscriptionTier: "basic",
    openingHours: hours,
  });

  seeded = true;
}
