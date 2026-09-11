import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { doctors } from "../../db/schema.js";
import { requireRestaurantId } from "./owner.functions.js";

export const listDoctors = createServerFn({ method: "GET" })
  .inputValidator((data: { restaurantId: number }) => data)
  .handler(async ({ data }) => {
    return db
      .select()
      .from(doctors)
      .where(eq(doctors.restaurantId, data.restaurantId))
      .orderBy(asc(doctors.sortOrder), asc(doctors.id));
  });

export const getDoctor = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const rows = await db.select().from(doctors).where(eq(doctors.id, data.id));
    return rows[0] ?? null;
  });

export const createDoctor = createServerFn({ method: "POST" })
  .validator((data: {
    name: string;
    specialty: string;
    bio?: string;
    photoUrl?: string;
    qualifications?: string;
    sortOrder?: number;
  }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const rows = await db
      .insert(doctors)
      .values({
        restaurantId,
        name: data.name,
        specialty: data.specialty,
        bio: data.bio ?? "",
        photoUrl: data.photoUrl ?? null,
        qualifications: data.qualifications ?? "",
        sortOrder: data.sortOrder ?? 0,
      })
      .returning();
    return rows[0];
  });

export const updateDoctor = createServerFn({ method: "POST" })
  .validator((data: {
    id: number;
    name: string;
    specialty: string;
    bio?: string;
    photoUrl?: string;
    qualifications?: string;
    sortOrder?: number;
  }) => data)
  .handler(async ({ data }) => {
    const restaurantId = await requireRestaurantId();
    const rows = await db
      .update(doctors)
      .set({
        name: data.name,
        specialty: data.specialty,
        bio: data.bio ?? "",
        photoUrl: data.photoUrl ?? null,
        qualifications: data.qualifications ?? "",
        sortOrder: data.sortOrder ?? 0,
      })
      .where(eq(doctors.id, data.id))
      .returning();
    return rows[0] ?? null;
  });

export const deleteDoctor = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireRestaurantId();
    await db.delete(doctors).where(eq(doctors.id, data.id));
  });

export const toggleDoctorAvailability = createServerFn({ method: "POST" })
  .validator((data: { id: number; available: boolean }) => data)
  .handler(async ({ data }) => {
    await requireRestaurantId();
    await db
      .update(doctors)
      .set({ available: data.available })
      .where(eq(doctors.id, data.id));
  });
