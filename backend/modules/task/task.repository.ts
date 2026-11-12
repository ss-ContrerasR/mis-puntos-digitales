
import { supabase } from "@/backend/config/database";
import type {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
} from "./task.types";

/**
 * TASK REPOSITORY
 *
 * Responsabilidad:
 * Comunicarse directamente con la tabla public.tasks.
 *
 * Aquí no colocamos reglas de negocio ni respuestas HTTP.
 */

/**
 * Obtener todas las tareas.
 *
 * Ordenamos por fecha de creación descendente,
 * para mostrar primero las tareas más recientes.
 */
export async function findAll(): Promise<Task[]> {
  const { data, error } = await supabase
    // SELECCIONA LA TABLA
    .from("tasks")
    // SELECCIONA TODOS LOS CAMPOS
    .select("*")
    .order("fecha_creacion", { ascending: false });

  if (error) {
    throw new Error(`Error al consultar tareas: ${error.message}`);
  }

  return data as Task[];
}

/**
 * Buscar una tarea por su identificador.
 *
 * maybeSingle() permite que el resultado sea null
 * cuando no existe una tarea con ese ID.
 */
export async function findById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    // SELECCIONA LA TABLA
    .from("tasks")
    // SELECCIONA TODOS LOS CAMPOS
    .select("*")
    // FILTRA POR INDICADOR
    .eq("id", id)
    // DEVUELVE UN SOLO REGISTRO O NULL SI NO EXISTE
    .maybeSingle();

  if (error) {
    throw new Error(`Error al buscar tarea: ${error.message}`);
  }

  return data as Task | null;
}

/**
 * Crear una tarea.
 *
 * No enviamos id ni fecha_creacion:
 * PostgreSQL genera ambos valores automáticamente.
 */
export async function create(
  task: CreateTaskDTO
): Promise<Task> {
  const { data, error } = await supabase
    // SELECCIONA LA TABLA
    .from("tasks")
    // INSERTA EL NUEVO REGISTRO
    .insert(task)
    // SELECCIONA TODOS LOS CAMPOS
    .select("*")
    // DEVUELVE UN SOLO REGISTRO
    .single();

  if (error) {
    throw new Error(`Error al crear tarea: ${error.message}`);
  }

  return data as Task;
}

/**
 * Actualizar una tarea existente.
 *
 * Solo enviamos los campos que queremos modificar.
 */
export async function update(
  id: string,
  task: UpdateTaskDTO
): Promise<Task | null> {
  const { data, error } = await supabase
    // SELECCIONA LA TABLA
    .from("tasks")
    // ACTUALIZA LOS CAMPOS ENVIADOS
    .update(task)
    // FILTRA POR INDICADOR
    .eq("id", id)
    // SELECCIONA TODOS LOS CAMPOS
    .select("*")
    // DEVUELVE UN SOLO REGISTRO O NULL SI NO EXISTE
    .maybeSingle();

  if (error) {
    throw new Error(`Error al actualizar tarea: ${error.message}`);
  }

  return data as Task | null;
}

/**
 * Eliminar una tarea.
 *
 * Devolvemos true si encontramos y eliminamos
 * un registro, o false si no existía.
 */
export async function remove(id: string): Promise<boolean> {
  const { data, error } = await supabase
    // SELECCIONA LA TABLA
    .from("tasks")
    // ELIMINA EL REGISTRO
    .delete()
    // FILTRA POR INDICADOR
    .eq("id", id)
    // SELECCIONA EL CAMPO ID
    .select("id")
    // DEVUELVE UN SOLO REGISTRO O NULL SI NO EXISTE
    .maybeSingle();

  if (error) {
    throw new Error(`Error al eliminar tarea: ${error.message}`);
  }

  return data !== null;
}
