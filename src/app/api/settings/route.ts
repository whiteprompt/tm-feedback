import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const ALLOWED_ADMIN_EMAILS = ["mariano.selvaggi@whiteprompt.com"];

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: settings, error } = await supabase
    .from("settings")
    .select("*")
    .eq("key", "show_contracts")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Error fetching settings" },
      { status: 500 }
    );
  }

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { enabled } = body;

  const { data: settings, error } = await supabase
    .from("settings")
    .update({ value: { enabled } })
    .eq("key", "show_contracts")
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    );
  }

  return NextResponse.json(settings);
}
