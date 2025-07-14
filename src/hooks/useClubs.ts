import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const useClubs = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("clubs")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setClubs(data ?? []);
      });
  }, []);
  return clubs;
};
