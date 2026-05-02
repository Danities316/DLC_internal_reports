"use server";

import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const PIN_REGEX = /^C-\d{5}$/;

export async function signup(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const pin = formData.get("pin") as string;

  if (!name || !phone || !pin) {
    return { error: "All fields are required" };
  }

  if (!PIN_REGEX.test(pin)) {
    return { error: "PIN must follow format C-xxxxx (e.g., C-12345)" };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, { pin }] },
    });

    if (existingUser) {
      return { error: "Phone or PIN already registered" };
    }

    const hashedPassword = await bcrypt.hash(pin, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        pin, // Storing original for login flexibility as requested? 
        // Wait, user says "login using EITHER phone OR pin". 
        // Usually PIN is the password. I'll store it as is and check match.
      },
    });

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({
      userId: user.id,
      name: user.name,
      role: user.role,
      centreId: user.centreId,
      expires
    });

    (await cookies()).set("session", session, { expires, httpOnly: true });
  } catch (e) {
    console.error(e);
    return { error: "Signup failed" };
  }

  redirect("/");
}

export async function login(prevState: any, formData: FormData) {
  const identifier = formData.get("identifier") as string; // phone or pin
  const pin = formData.get("pin") as string;

  if (!identifier || !pin) {
    return { error: "All fields are required" };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { pin: identifier }
        ]
      }
    });

    if (!user || user.pin !== pin) {
      return { error: "Invalid credentials" };
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({
      userId: user.id,
      name: user.name,
      role: user.role,
      centreId: user.centreId,
      expires
    });

    (await cookies()).set("session", session, { expires, httpOnly: true });
  } catch (e) {
    console.error(e);
    return { error: "Login failed" };
  }

  redirect("/");
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
  redirect("/");
}
