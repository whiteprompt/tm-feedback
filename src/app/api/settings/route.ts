import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedAdmin } from "@/lib/auth-utils";

export async function GET(request: Request) {
  const { error } = await getAuthenticatedAdmin();

  if (error) {
    return error;
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "Key parameter is required" },
      { status: 400 }
    );
  }

  const { data: settings, error: dbError } = await supabase
    .from("settings")
    .select("*")
    .eq("key", key)
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
  const { key, enabled } = body;

  if (!key) {
    return NextResponse.json(
      { error: "Key parameter is required" },
      { status: 400 }
    );
  }

  const { data: settings, error: dbError } = await supabase
    .from("settings")
    .update({ value: { enabled } })
    .eq("key", key)
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
