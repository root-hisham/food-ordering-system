import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Minimal .env.local parser — avoids adding a dotenv dependency for
// what is a one-time setup script.
function loadEnvLocal() {
  const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const STALL_BURGER = "10000000-0000-0000-0000-000000000001";
const STALL_TEA = "10000000-0000-0000-0000-000000000002";

const testAccounts = [
  {
    email: "admin@foodcourt.test",
    password: "Passw0rd!",
    fullName: "Platform Admin",
    mobile: "9000000001",
    role: "admin",
  },
  {
    email: "owner.burger@foodcourt.test",
    password: "Passw0rd!",
    fullName: "Burger Point Owner",
    mobile: "9000000002",
    role: "stall_owner",
    stallId: STALL_BURGER,
  },
  {
    email: "owner.tea@foodcourt.test",
    password: "Passw0rd!",
    fullName: "Tea Corner Owner",
    mobile: "9000000003",
    role: "stall_owner",
    stallId: STALL_TEA,
  },
];

async function cleanupOldSeedRows() {
  // The old raw-SQL seed used these fixed UUIDs. Remove any leftover
  // rows referencing them before recreating properly via the Auth API.
  const oldIds = [
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
    "00000000-0000-0000-0000-000000000003",
  ];
  await supabase.from("stall_owners").delete().in("id", oldIds);
  await supabase.from("admins").delete().in("id", oldIds);
  await supabase.from("profiles").delete().in("id", oldIds);
  for (const id of oldIds) {
    await supabase.auth.admin.deleteUser(id).catch(() => {});
  }
}

async function createAccount(account) {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    console.error(`Failed to create ${account.email}:`, createError?.message);
    return;
  }

  const userId = created.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    role: account.role,
    full_name: account.fullName,
    mobile_number: account.mobile,
  });

  if (profileError) {
    console.error(`Failed to create profile for ${account.email}:`, profileError.message);
    return;
  }

  if (account.role === "admin") {
    await supabase.from("admins").insert({ id: userId });
  }

  if (account.role === "stall_owner") {
    await supabase.from("stall_owners").insert({ id: userId, stall_id: account.stallId });
  }

  console.log(`Created ${account.email} (${account.role})`);
}

await cleanupOldSeedRows();
for (const account of testAccounts) {
  await createAccount(account);
}
console.log("Done.");