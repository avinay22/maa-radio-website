import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBackend } from "@/lib/spinServer";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file exceeds 10MB limit." }, { status: 400 });
    }

    const supabase = getSupabaseBackend();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("[POST /api/admin/upload] Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from("media").getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      url: data.publicUrl,
    });
  } catch (error: any) {
    console.error("[POST /api/admin/upload error]", error);
    return NextResponse.json({ error: error?.message || "Failed to upload image." }, { status: 500 });
  }
}
