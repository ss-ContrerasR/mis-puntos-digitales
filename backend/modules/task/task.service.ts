
import * as taskRepository from "./task.repository";
import type {
  Task,
  CreateTaskDTO,
  UpdateTaskDTO,
} from "./task.types";

/**
 * TASK SERVICE
 *
 * Responsabilidad:
 * Ejecutar la lógica de negocio del módulo de tareas.
 *
 * No conoce HTTP ni construye consultas SQL.
 * 
 * El Service funciona como intermediario entre el Controller y el Repository.

Por ejemplo, cuando alguien solicita eliminar una tarea, el Service puede comprobar que exista antes de continuar.
 */

export class TaskNotFoundError extends Error {
  constructor() {
    super("La tarea solicitada no existe");
    this.name = "TaskNotFoundError";
  }
}

/**
 * Obtener todas las tareas.
 */
export async function getAll(): Promise<Task[]> {
  return taskRepository.findAll();
}

/**
 * Obtener una tarea por ID.
 *
 * Si no existe, lanzamos un error específico.
 */
export async function getById(id: string): Promise<Task> {
  const task = await taskRepository.findById(id);

  if (!task) {
    throw new TaskNotFoundError();
  }

  return task;
}

/**
 * Crear una tarea.
 */
export async function create(
  data: CreateTaskDTO
): Promise<Task> {
  return taskRepository.create(data);
}

/**
 * Actualizar una tarea.
 *
 * Primero comprobamos que exista.
 */
export async function update(
  id: string,
  data: UpdateTaskDTO
): Promise<Task> {
  const existingTask = await taskRepository.findById(id);

  if (!existingTask) {
    throw new TaskNotFoundError();
  }

  const updatedTask = await taskRepository.update(id, data);

  if (!updatedTask) {
    throw new TaskNotFoundError();
  }

  return updatedTask;
}

/**
 * Eliminar una tarea.
 */
export async function remove(id: string): Promise<void> {
  const deleted = await taskRepository.remove(id);

  if (!deleted) {
    throw new TaskNotFoundError();
  }
}
