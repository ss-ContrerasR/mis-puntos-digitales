
/**
 * Representa una tarea almacenada en la base de datos.
 *
 * Incluye todos los campos de la tabla public.tasks.
 */
export interface Task {
  id: string;
  cliente: string;
  indicadores: string;
  descripcion: string;
  puntos: number;
  fecha_creacion: string;
}

/**
 * Datos necesarios para crear una tarea.
 *
 * No incluimos id ni fecha_creacion porque
 * PostgreSQL los genera automáticamente.
 */
export interface CreateTaskDTO {
  cliente: string;
  indicadores: string;
  descripcion: string;
  puntos: number;
}

/**
 * Datos permitidos para actualizar una tarea.
 *
 * Todos los campos son opcionales porque
 * una actualización puede modificar solo algunos.
 */
export interface UpdateTaskDTO {
  cliente?: string;
  indicadores?: string;
  descripcion?: string;
  puntos?: number;
}
