import { NextResponse } from "next/server";
import { teamMemberCache } from "@/lib/cache";
import { supabase } from "@/lib/supabase";

export const runtime = "edge"; // This is important for Vercel cron jobs

// This API route can be called by Vercel Cron or external cron services
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if cache cleanup is enabled in admin settings
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'enable_cache_cleanup')
        .single();

      if (error || !data?.value?.enabled) {
        console.log('[Cache Cleanup] Cache cleanup is disabled in admin settings');
        return NextResponse.json({
          success: true,
          message: "Cache cleanup is disabled in admin settings",
          timestamp: new Date().toISOString()
        });
      }
    } catch (settingsError) {
      console.error('[Cache Cleanup] Error checking admin setting:', settingsError);
      // Continue with cleanup if we can't check the setting (fail-safe)
    }

    console.log('[Cache Cleanup] Starting cache cleanup process...');
    
    await teamMemberCache.clearExpired();
    
    console.log('[Cache Cleanup] Cache cleanup completed successfully');
    
    return NextResponse.json({
      success: true,
      message: "Cache cleanup completed",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Cache Cleanup] Error during cache cleanup:', error);
    
    return NextResponse.json(
      { 
        error: "Cache cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Also allow manual cleanup via POST (for admin purposes)
export async function POST() {
  try {
    console.log('[Cache Cleanup] Manual cache cleanup initiated...');
    
    await teamMemberCache.clearExpired();
    
    console.log('[Cache Cleanup] Manual cache cleanup completed');
    
    return NextResponse.json({
      success: true,
      message: "Manual cache cleanup completed",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Cache Cleanup] Error during manual cache cleanup:', error);
    
    return NextResponse.json(
      { 
        error: "Manual cache cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}