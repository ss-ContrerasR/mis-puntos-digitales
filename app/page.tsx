"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// =====================================================
// TYPES
// =====================================================

interface Task {
  id: string;
  cliente: string;
  indicadores: string;
  descripcion: string;
  puntos: number;
  fecha_creacion: string;
}

interface TaskForm {
  cliente: string;
  indicadores: string;
  descripcion: string;
  puntos: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const initialForm: TaskForm = {
  cliente: "",
  indicadores: "",
  descripcion: "",
  puntos: "",
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskForm>(initialForm);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // GET TASKS
  // ===================================================

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tasks");

      if (!response.ok) {
        throw new Error("No fue posible obtener las tareas");
      }

      const result: ApiResponse<Task[]> = await response.json();

      setTasks(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al cargar las tareas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      try {
        setError("");

        const response = await fetch("/api/tasks", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No fue posible obtener las tareas");
        }

        const result: ApiResponse<Task[]> = await response.json();

        setTasks(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar las tareas",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      controller.abort();
    };
  }, []);

  // ===================================================
  // STATISTICS
  // ===================================================

  const totalPoints = useMemo(
    () => tasks.reduce((total, task) => total + Number(task.puntos), 0),
    [tasks],
  );

  const totalClients = useMemo(
    () => new Set(tasks.map((task) => task.cliente.trim().toLowerCase())).size,
    [tasks],
  );

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredTasks = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return tasks;

    return tasks.filter((task) =>
      [task.cliente, task.indicadores, task.descripcion].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [tasks, search]);

  // ===================================================
  // FORM HANDLERS
  // ===================================================

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openCreateForm() {
    setEditingTask(null);
    setForm(initialForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);

    setForm({
      cliente: task.cliente,
      indicadores: task.indicadores,
      descripcion: task.descripcion,
      puntos: String(task.puntos),
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTask(null);
    setForm(initialForm);
    setError("");
  }

  // ===================================================
  // CREATE / UPDATE TASK
  // ===================================================

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingTask);

      const url = isEditing ? `/api/tasks/${editingTask!.id}` : "/api/tasks";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente: form.cliente.trim(),
          indicadores: form.indicadores.trim(),
          descripcion: form.descripcion.trim(),
          puntos: Number(form.puntos),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo guardar la tarea");
      }

      closeForm();
      await fetchTasks();

      setSuccess(
        isEditing
          ? "Tarea actualizada correctamente"
          : "Tarea creada correctamente",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error al guardar",
      );
    } finally {
      setSaving(false);
    }
  }

  // ===================================================
  // DELETE TASK
  // ===================================================

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tarea?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo eliminar la tarea");
      }

      await fetchTasks();
      setSuccess("Tarea eliminada correctamente");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error al eliminar",
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ===================================================
  // FORMATTERS
  // ===================================================

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }

  function formatPoints(points: number) {
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(points);
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white shadow-lg shadow-indigo-200">
              T
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">TaskManager</h1>
              <p className="text-xs text-slate-500">Administración de tareas</p>
            </div>
          </div>

          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <span className="text-lg">+</span>
            Nueva tarea
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* WELCOME */}
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-indigo-600">
            PANEL DE CONTROL
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Gestión de tareas
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Administra tus tareas, clientes e indicadores desde un solo lugar.
          </p>
        </div>

        {/* ALERTS */}
        {success && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess("")}>✕</button>
          </div>
        )}

        {error && !showForm && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* STATISTICS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total de tareas"
            value={tasks.length.toString()}
            description="Tareas registradas"
            icon="▤"
            color="indigo"
          />

          <StatCard
            title="Clientes"
            value={totalClients.toString()}
            description="Clientes registrados"
            icon="♙"
            color="blue"
          />

          <StatCard
            title="Puntos acumulados"
            value={formatPoints(totalPoints)}
            description="Suma de todos los puntos"
            icon="✦"
            color="emerald"
          />
        </section>

        {/* TASKS SECTION */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* TABLE HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold">Todas las tareas</h3>

              <p className="mt-1 text-sm text-slate-500">
                Consulta y administra tus registros.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar tareas..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5 text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Indicadores</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Puntos</th>
                  <th className="px-6 py-4">Fecha de creación</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                      <p className="text-sm text-slate-500">
                        Cargando tareas...
                      </p>
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="mb-3 text-4xl text-slate-300">▤</div>

                      <p className="font-semibold text-slate-700">
                        {search
                          ? "No encontramos resultados"
                          : "Todavía no hay tareas"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {search
                          ? "Intenta con otro término de búsqueda."
                          : "Crea tu primera tarea para comenzar."}
                      </p>

                      {!search && (
                        <button
                          onClick={openCreateForm}
                          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Crear primera tarea
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {task.cliente}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {task.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {task.indicadores}
                        </span>
                      </td>

                      <td className="max-w-xs px-6 py-4">
                        <p className="truncate text-sm text-slate-600">
                          {task.descripcion}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">
                          {formatPoints(task.puntos)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(task.fecha_creacion)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(task)}
                            title="Editar tarea"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDelete(task.id)}
                            disabled={deletingId === task.id}
                            title="Eliminar tarea"
                            className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === task.id ? "..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          {!loading && (
            <div className="flex flex-col gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Mostrando {filteredTasks.length} de {tasks.length} tareas
              </span>

              <button
                onClick={fetchTasks}
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                ↻ Actualizar listado
              </button>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
          <p>TaskManager · Panel de administración</p>
          {/* <p>Desarrollado por Sergio contreras</p> */}
        </footer>
      </div>

      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold">
                  {editingTask ? "Editar tarea" : "Nueva tarea"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingTask
                    ? "Modifica la información del registro."
                    : "Completa los datos para registrar una tarea."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Cliente <span className="text-red-500">*</span>
                </label>

                <input
                  name="cliente"
                  value={form.cliente}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Empresa ABC"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Indicadores <span className="text-red-500">*</span>
                </label>

                <input
                  name="indicadores"
                  value={form.indicadores}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Cumplimiento"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Descripción <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Describe la tarea..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Puntos <span className="text-red-500">*</span>
                </label>

                <input
                  name="puntos"
                  type="number"
                  value={form.puntos}
                  onChange={handleChange}
                  required
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  placeholder="Ej. 12.22"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : editingTask
                      ? "Guardar cambios"
                      : "Crear tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// =====================================================
// STATISTICS CARD
// =====================================================

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: "indigo" | "blue" | "emerald";
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  const colors = {
    indigo: {
      icon: "bg-indigo-50 text-indigo-600",
      value: "text-indigo-700",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      value: "text-blue-700",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      value: "text-emerald-700",
    },
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3
            className={`mt-3 text-3xl font-bold tracking-tight ${colors[color].value}`}
          >
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${colors[color].icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
