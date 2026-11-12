
import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";

import { taskController } from "./modules/task/task.controller";
import { TaskNotFoundError } from "./modules/task/task.service";

/**
 * SERVIDOR PRINCIPAL
 *
 * Aquí registramos:
 * - Documentación OpenAPI / Swagger UI.
 * - Rutas generales.
 * - Módulos del backend.
 */

export const app = new Elysia({
  prefix: "/api",
})

  // Documentación interactiva de nuestra API.
  .use(
    openapi({
      path: "/docs",
      provider: "swagger-ui",
      documentation: {
        info: {
          title: "Tasks API",
          version: "1.0.0",
          description:
            "API para administrar tareas, clientes, indicadores y puntos.",
        },
        tags: [
          // {
          //   name: "Health",
          //   description: "Verificación del estado del backend.",
          // },
          {
            name: "Tasks",
            description: "Operaciones CRUD para administrar tareas.",
          },
        ],
      },
    })
  )

  // Verificar que el backend funciona.
  // .get(
  //   "/health",
  //   () => ({
  //     success: true,
  //     message: "Backend funcionando correctamente",
  //     timestamp: new Date().toISOString(),
  //   }),
  //   {
  //     detail: {
  //       tags: ["Health"],
  //       summary: "Comprobar estado del backend",
  //       description: "Verifica que la API esté respondiendo.",
  //     },
  //   }
  // )

  // Registrar el módulo de tareas.
  .use(taskController)

  // Manejo centralizado de errores.
  .onError(({ error, code, set }) => {
    if (error instanceof TaskNotFoundError) {
      set.status = 404;

      return {
        success: false,
        message: error.message,
      };
    }

    if (code === "VALIDATION") {
      set.status = 422;

      return {
        success: false,
        message: "Los datos enviados no son válidos",
      };
    }

    console.error("Error en el backend:", error);

    set.status = 500;

    return {
      success: false,
      message: "Ha ocurrido un error interno",
    };
  });
