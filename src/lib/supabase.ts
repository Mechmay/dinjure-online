// Add debug logging
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Supabase connection failed:", error);
      return false;
    }

    console.log("Supabase connection successful:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection error:", error);
    return false;
  }
};
