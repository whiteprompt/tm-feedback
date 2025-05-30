import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedAdmin } from "@/lib/auth-utils";

export async function GET() {
  const { error } = await getAuthenticatedAdmin();

  if (error) {
    return error;
  }

  const { data: settings, error: dbError } = await supabase
    .from("settings")
    .select("*")
    .eq("key", "show_contracts")
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: "Error fetching settings" },
      { status: 500 }
    );
  }

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const { error } = await getAuthenticatedAdmin();

  if (error) {
    return error;
  }

  const body = await request.json();
  const { enabled } = body;

  const { data: settings, error: dbError } = await supabase
    .from("settings")
    .update({ value: { enabled } })
    .eq("key", "show_contracts")
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    );
  }

  return NextResponse.json(settings);
}
