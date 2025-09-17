import { supabase } from "@/lib/supabaseClient";

export async function toggleBookmark(
  objectType: "concept" | "mcq" | "flashcard" | "conversation_hyf" | "conversation_mcq",
  objectUuid: string,
  newValue: boolean,
  userId: string
) {
  if (!objectUuid || !userId) {
    console.error("❌ Missing uuid or user", { objectUuid, userId });
    return;
  }

  console.log("🔖 Bookmark toggle", { objectType, objectUuid, newValue });

  const { error } = await supabase.from("student_signals").upsert(
    {
      student_id: userId,
      object_type: objectType,
      object_uuid: objectUuid, // must be UUID type
      bookmark: newValue,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,object_type,object_uuid" }
  );

  if (error) console.error("❌ DB error:", error);
}