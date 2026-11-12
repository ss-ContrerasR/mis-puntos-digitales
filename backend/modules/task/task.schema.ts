
import { t } from "elysia";

/**
 * Datos necesarios para crear una tarea.
 */
export const createTaskSchema = t.Object({
  cliente: t.String({
    minLength: 1,
    description: "Nombre del cliente.",
    examples: ["Empresa ABC"],
  }),

  indicadores: t.String({
    minLength: 1,
    description: "Indicadores de la tarea.",
    examples: ["Cumplimiento"],
  }),

  descripcion: t.String({
    minLength: 1,
    description: "Descripción de la tarea.",
    examples: ["Revisar objetivos mensuales."],
  }),

  puntos: t.Number({
    minimum: 0,
    maximum: 99999999.99,
    description: "Puntos asignados, con dos decimales.",
    examples: [12.22],
  }),
});

/**
 * Todos los campos son opcionales al actualizar.
 */
export const updateTaskSchema = t.Partial(createTaskSchema);

/**
 * Representación de una tarea almacenada.
 *
 * Incluye los campos generados por PostgreSQL.
 */
export const taskResponseSchema = t.Object({
  id: t.String({
    format: "uuid",
  }),

  cliente: t.String(),
  indicadores: t.String(),
  descripcion: t.String(),
  puntos: t.Number(),

  fecha_creacion: t.String({
    format: "date-time",
  }),
});

/**
 * Respuesta exitosa al crear, consultar o actualizar
 * una tarea individual.
 */
export const taskSingleResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.Optional(t.String()),
  data: taskResponseSchema,
});

/**
 * Respuesta exitosa al listar tareas.
 */
export const taskListResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Array(taskResponseSchema),
});

/**
 * Respuesta al eliminar una tarea.
 */
export const taskDeleteResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.String(),
});
