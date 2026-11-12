
import "server-only";

import { createClient } from "@supabase/supabase-js";

// Obtenemos las variables de entorno.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validamos la configuración al iniciar el módulo.
// Es mejor detectar el problema inmediatamente
// que recibir errores cuando intentemos consultar la DB.
if (!supabaseUrl) {
  throw new Error("Falta configurar SUPABASE_URL");
}

if (!supabaseSecretKey) {
  throw new Error("Falta configurar SUPABASE_SERVICE_ROLE_KEY");
}

// Creamos una única instancia del cliente.
// Este cliente será reutilizado por los repositorios.
export const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey
);
