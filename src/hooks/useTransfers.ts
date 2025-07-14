import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export const useTransfers = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("transfers")
      .select("*")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setTransfers(data ?? []);
      });
  }, []);
  return transfers;
};

export const addTransfer = async (payload: any) => {
  const { error } = await supabase.from("transfers").insert(payload);
  if (error) throw error;
};
