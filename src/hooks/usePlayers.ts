import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const usePlayers = () => {
  const [players, setPlayers] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("players")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setPlayers(data ?? []);
      });
  }, []);
  return players;
};
