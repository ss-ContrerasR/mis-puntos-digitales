
import { Elysia, t } from "elysia";
import * as taskService from "./task.service";

import {
  createTaskSchema,
  updateTaskSchema,
  taskSingleResponseSchema,
  taskListResponseSchema,
  taskDeleteResponseSchema,
} from "./task.schema";

/**
 * =====================================================
 * TASK CONTROLLER
 * =====================================================
 *
 * Responsabilidad:
 * - Definir los endpoints HTTP del módulo de tareas.
 * - Validar parámetros y cuerpos de las solicitudes.
 * - Delegar las operaciones al Service.
 * - Documentar las respuestas para OpenAPI / Swagger.
 *
 * No contiene consultas directas a Supabase.
 * No contiene reglas de negocio.
 * =====================================================
 */

export const taskController = new Elysia({
  prefix: "/tasks",
  detail: {
    tags: ["Tasks"],
  },
})

  /**
   * =====================================================
   * GET /api/tasks
   * =====================================================
   * Obtener todas las tareas.
   *
   * Respuesta:
   * 200 - Lista de tareas.
   */

  .get(
    "/",
    async () => {
      const tasks = await taskService.getAll();

      return {
        success: true,
        data: tasks,
      };
    },
    {
      response: {
        200: taskListResponseSchema,
      },
      detail: {
        summary: "Listar tareas",
        description:
          "Obtiene todas las tareas registradas, ordenadas por fecha de creación.",
        operationId: "getAllTasks",
      },
    }
  )

  /**
   * =====================================================
   * GET /api/tasks/:id
   * =====================================================
   * Consultar una tarea por su identificador.
   *
   * Respuestas:
   * 200 - Tarea encontrada.
   * 404 - Tarea inexistente.
   * 422 - Identificador inválido.
   */

  .get(
    "/:id",
    async ({ params }) => {
      const task = await taskService.getById(params.id);

      return {
        success: true,
        data: task,
      };
    },
    {
      params: t.Object({
        id: t.String({
          format: "uuid",
          description: "Identificador UUID de la tarea.",
          examples: ["b68bdbcd-c28e-4208-9b00-8d337a0e5ac5"],
        }),
      }),

      response: {
        200: taskSingleResponseSchema,
      },

      detail: {
        summary: "Consultar tarea por ID",
        description:
          "Obtiene una tarea existente mediante su identificador UUID.",
        operationId: "getTaskById",
      },
    }
  )

  /**
   * =====================================================
   * POST /api/tasks
   * =====================================================
   * Crear una tarea.
   *
   * Respuestas:
   * 201 - Tarea creada.
   * 422 - Datos de entrada inválidos.
   */

  .post(
    "/",
    async ({ body, set }) => {
      const task = await taskService.create(body);

      set.status = 201;

      return {
        success: true,
        message: "Tarea creada correctamente",
        data: task,
      };
    },
    {
      body: createTaskSchema,
      response: {
        201: taskSingleResponseSchema,
      },
      detail: {
        summary: "Crear tarea",
        description:
          "Registra una nueva tarea. El identificador y la fecha de creación son generados automáticamente por PostgreSQL.",
        operationId: "createTask",
      },
    }
  )

  /**
   * =====================================================
   * PATCH /api/tasks/:id
   * =====================================================
   * Actualizar parcialmente una tarea.
   *
   * Respuestas:
   * 200 - Tarea actualizada.
   * 404 - Tarea inexistente.
   * 422 - Datos de entrada inválidos.
   */

  .patch(
    "/:id",
    async ({ params, body }) => {
      const task = await taskService.update(params.id, body);

      return {
        success: true,
        message: "Tarea actualizada correctamente",
        data: task,
      };
    },
    {
      params: t.Object({
        id: t.String({
          format: "uuid",
          description: "Identificador UUID de la tarea.",
        }),
      }),
      body: updateTaskSchema,
      response: {
        200: taskSingleResponseSchema,
      },
      detail: {
        summary: "Actualizar tarea",
        description:
          "Actualiza uno o varios campos de una tarea existente. Los campos no enviados conservan su valor.",
        operationId: "updateTask",
      },
    }
  )

  /**
   * =====================================================
   * DELETE /api/tasks/:id
   * =====================================================
   * Eliminar una tarea.
   *
   * Respuestas:
   * 200 - Tarea eliminada.
   * 404 - Tarea inexistente.
   * 422 - Identificador inválido.
   */

  .delete(
    "/:id",
    async ({ params }) => {
      await taskService.remove(params.id);

      return {
        success: true,
        message: "Tarea eliminada correctamente",
      };
    },
    {
      params: t.Object({
        id: t.String({
          format: "uuid",
          description: "Identificador UUID de la tarea.",
        }),
      }),
      response: {
        200: taskDeleteResponseSchema,
      },
      detail: {
        summary: "Eliminar tarea",
        description:
          "Elimina permanentemente una tarea utilizando su identificador UUID.",
        operationId: "deleteTask",
      },
    }
  );
