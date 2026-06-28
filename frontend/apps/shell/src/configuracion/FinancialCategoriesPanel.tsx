import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FinancialCategory,
  FinancialCategoryColorToken,
  FinancialCategoryType,
} from '@finance-ready/shared-types';
import { Card } from '@finance-ready/ui-kit';
import { useAuth } from '../auth/useAuth';
import type { CategoriesApiError } from '../transactions/categoriesApi';
import {
  createFinancialCategory,
  deleteFinancialCategory,
  listFinancialCategories,
  restoreFinancialCategory,
  updateFinancialCategory,
} from '../transactions/categoriesApi';

// ── Color token map (static — no dynamic interpolation) ──────────────────────

const CATEGORY_COLOR_CLASSES: Record<FinancialCategoryColorToken, string> = {
  slate: 'bg-slate-400',
  sky: 'bg-sky-400',
  teal: 'bg-teal-400',
  violet: 'bg-violet-400',
  fuchsia: 'bg-fuchsia-400',
  cyan: 'bg-cyan-400',
  orange: 'bg-orange-400',
  pink: 'bg-pink-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  indigo: 'bg-indigo-400',
  rose: 'bg-rose-400',
};

const COLOR_TOKENS = Object.keys(CATEGORY_COLOR_CLASSES) as FinancialCategoryColorToken[];

// ── Types ────────────────────────────────────────────────────────────────────

type LoadPhase = 'loading' | 'loaded' | 'empty' | 'load_error';
type FormMode = 'none' | 'create' | 'edit';

type FormState = {
  mode: FormMode;
  editingId: number | null;
  editingType: FinancialCategoryType | null;
  name: string;
  type: FinancialCategoryType;
  color: FinancialCategoryColorToken;
  nameError: string | null;
  submitting: boolean;
  mutationError: string | null;
};

type ConfirmDelete = { id: number; name: string } | null;

const DEFAULT_FORM: FormState = {
  mode: 'none',
  editingId: null,
  editingType: null,
  name: '',
  type: 'expense',
  color: 'sky',
  nameError: null,
  submitting: false,
  mutationError: null,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchFirstPage(token: string) {
  return listFinancialCategories(token, { include_deleted: true, limit: 50 });
}

async function fetchPage(token: string, cursor: string) {
  return listFinancialCategories(token, { include_deleted: true, limit: 50, cursor });
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function FinancialCategoriesPanel() {
  const { token, logout } = useAuth();

  const [items, setItems] = useState<FinancialCategory[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [phase, setPhase] = useState<LoadPhase>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const activeItems = items.filter((c) => c.deleted_at === null);
  const deletedItems = items.filter((c) => c.deleted_at !== null);
  const incomeItems = activeItems.filter((c) => c.type === 'income');
  const expenseItems = activeItems.filter((c) => c.type === 'expense');

  // ── Initial load (runs once on mount; parent resets via key) ──

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchFirstPage(token)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setNextCursor(data.next_cursor);
        setHasMore(data.has_more);
        setPhase(data.items.length === 0 ? 'empty' : 'loaded');
      })
      .catch((err: CategoriesApiError) => {
        if (cancelled) return;
        if (err.status === 401) { logout(); return; }
        setPhase('load_error');
        setLoadError('No se pudieron cargar las categorías.');
      });

    return () => { cancelled = true; };
  }, [token, logout]);

  // ── Focus form on open ──

  useEffect(() => {
    if (form.mode !== 'none') {
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [form.mode]);

  // ── Reload from first page (after mutations or invalid cursor) ──

  const reloadAll = useCallback(async () => {
    if (!token) return;
    setPhase('loading');
    try {
      const data = await fetchFirstPage(token);
      setItems(data.items);
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);
      setPhase(data.items.length === 0 ? 'empty' : 'loaded');
      setLoadError(null);
    } catch (err) {
      const e = err as CategoriesApiError;
      if (e.status === 401) { logout(); return; }
      setPhase('load_error');
      setLoadError('No se pudieron cargar las categorías.');
    }
  }, [token, logout]);

  // ── Load more (cursor-based next page) ──

  const loadMore = useCallback(async (cursor: string) => {
    if (!token) return;
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const data = await fetchPage(token, cursor);
      setItems((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        return [...prev, ...data.items.filter((c) => !existingIds.has(c.id))];
      });
      setNextCursor(data.next_cursor);
      setHasMore(data.has_more);
      setPhase('loaded');
    } catch (err) {
      const e = err as CategoriesApiError;
      if (e.status === 401) { logout(); return; }
      if (e.code === 'invalid_cursor') {
        setNextCursor(null);
        setHasMore(false);
        void reloadAll();
        return;
      }
      setLoadMoreError(e.message);
    } finally {
      setLoadingMore(false);
    }
  }, [token, logout, reloadAll]);

  // ── Form helpers ──

  function openCreate(preType: FinancialCategoryType) {
    setSuccessMessage(null);
    setConfirmDelete(null);
    setForm({ ...DEFAULT_FORM, mode: 'create', type: preType });
  }

  function openEdit(cat: FinancialCategory) {
    setSuccessMessage(null);
    setConfirmDelete(null);
    setForm({
      mode: 'edit',
      editingId: cat.id,
      editingType: cat.type,
      name: cat.name,
      type: cat.type,
      color: cat.color_token,
      nameError: null,
      submitting: false,
      mutationError: null,
    });
  }

  function cancelForm() {
    setForm(DEFAULT_FORM);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      nameError: key === 'name' ? null : prev.nameError,
    }));
  }

  // ── Submit ──

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setForm((prev) => ({ ...prev, submitting: true, nameError: null, mutationError: null }));

    try {
      if (form.mode === 'create') {
        await createFinancialCategory(token, {
          name: form.name,
          type: form.type,
          color_token: form.color,
        });
        setSuccessMessage('Categoría creada correctamente.');
      } else if (form.mode === 'edit' && form.editingId != null) {
        await updateFinancialCategory(token, form.editingId, {
          name: form.name,
          color_token: form.color,
        });
        setSuccessMessage('Categoría actualizada correctamente.');
      }
      setForm(DEFAULT_FORM);
      await reloadAll();
    } catch (err) {
      const e = err as CategoriesApiError;
      if (e.status === 401) { logout(); return; }
      if (e.code === 'category_name_conflict') {
        setForm((prev) => ({
          ...prev,
          submitting: false,
          nameError: 'Ya existe una categoría con ese nombre y tipo.',
        }));
        return;
      }
      setForm((prev) => ({ ...prev, submitting: false, mutationError: e.message }));
    }
  }

  // ── Delete ──

  function requestDelete(cat: FinancialCategory) {
    setSuccessMessage(null);
    setForm(DEFAULT_FORM);
    setConfirmDelete({ id: cat.id, name: cat.name });
  }

  async function handleDelete() {
    if (!token || !confirmDelete) return;
    setForm((prev) => ({ ...prev, submitting: true }));
    try {
      await deleteFinancialCategory(token, confirmDelete.id);
      setConfirmDelete(null);
      setSuccessMessage('Categoría eliminada.');
      await reloadAll();
    } catch (err) {
      const e = err as CategoriesApiError;
      if (e.status === 401) { logout(); return; }
      if (e.status === 404) {
        setConfirmDelete(null);
        setSuccessMessage('La categoría ya no estaba disponible y fue eliminada de la lista.');
        await reloadAll();
        return;
      }
      setForm((prev) => ({ ...prev, submitting: false, mutationError: e.message }));
    } finally {
      setForm((prev) => ({ ...prev, submitting: false }));
    }
  }

  // ── Restore ──

  async function handleRestore(cat: FinancialCategory) {
    if (!token) return;
    setSuccessMessage(null);
    setForm((prev) => ({ ...prev, submitting: true, mutationError: null }));
    try {
      await restoreFinancialCategory(token, cat.id);
      setSuccessMessage('Categoría restaurada.');
      await reloadAll();
    } catch (err) {
      const e = err as CategoriesApiError;
      if (e.status === 401) { logout(); return; }
      if (e.status === 404) {
        setSuccessMessage('La categoría ya no está disponible.');
        await reloadAll();
        return;
      }
      setForm((prev) => ({ ...prev, submitting: false, mutationError: e.message }));
    } finally {
      setForm((prev) => ({ ...prev, submitting: false }));
    }
  }

  const isMutating = form.submitting;

  // ── Render ────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border bg-card">
        <p className="text-sm text-muted-foreground" aria-live="polite" aria-busy="true">
          Cargando categorías…
        </p>
      </div>
    );
  }

  if (phase === 'load_error') {
    return (
      <Card className="p-4 lg:p-5">
        <p role="alert" className="text-sm font-semibold text-destructive">
          {loadError}
        </p>
        <button
          type="button"
          className="mt-3 h-9 rounded-lg border px-3 text-sm font-semibold text-foreground hover:bg-muted"
          onClick={() => void reloadAll()}
        >
          Reintentar
        </button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status announcements */}
      {successMessage && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/25 dark:text-emerald-400"
        >
          {successMessage}
        </p>
      )}
      {form.mutationError && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive"
        >
          {form.mutationError}
        </p>
      )}

      {/* Form */}
      {form.mode !== 'none' && (
        <CategoryForm
          form={form}
          nameInputRef={nameInputRef}
          onSubmit={handleSubmit}
          onCancel={cancelForm}
          onNameChange={(v) => setField('name', v)}
          onTypeChange={(v) => setField('type', v)}
          onColorChange={(v) => setField('color', v)}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <DeleteConfirmation
          name={confirmDelete.name}
          submitting={isMutating}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Income */}
      <CategorySection
        title="Categorías de ingresos"
        description="Entradas de dinero."
        type="income"
        categories={incomeItems}
        formMode={form.mode}
        isMutating={isMutating}
        onNew={() => openCreate('income')}
        onEdit={openEdit}
        onDelete={requestDelete}
      />

      {/* Expenses */}
      <CategorySection
        title="Categorías de gastos"
        description="Salidas de dinero."
        type="expense"
        categories={expenseItems}
        formMode={form.mode}
        isMutating={isMutating}
        onNew={() => openCreate('expense')}
        onEdit={openEdit}
        onDelete={requestDelete}
      />

      {/* Load more */}
      {loadMoreError ? (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2"
        >
          <p className="text-xs font-semibold text-destructive">{loadMoreError}</p>
          {nextCursor && (
            <button
              type="button"
              disabled={isMutating}
              className="h-8 w-fit rounded-lg border px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              onClick={() => void loadMore(nextCursor)}
            >
              Reintentar
            </button>
          )}
        </div>
      ) : hasMore && nextCursor ? (
        <button
          type="button"
          disabled={loadingMore || isMutating}
          className="h-9 rounded-lg border px-4 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void loadMore(nextCursor)}
        >
          {loadingMore ? 'Cargando…' : 'Cargar más'}
        </button>
      ) : null}

      {/* Deleted */}
      {deletedItems.length > 0 && (
        <DeletedSection
          categories={deletedItems}
          isMutating={isMutating}
          onRestore={handleRestore}
        />
      )}

      {/* Info note */}
      <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/25 dark:text-sky-300">
        Los colores de categoría son identificadores visuales y no representan estados
        financieros. Las categorías eliminadas se pueden restaurar conservando su identidad.
      </p>
    </div>
  );
}

// ── Category form ─────────────────────────────────────────────────────────────

function CategoryForm({
  form,
  nameInputRef,
  onSubmit,
  onCancel,
  onNameChange,
  onTypeChange,
  onColorChange,
}: {
  form: FormState;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onNameChange: (v: string) => void;
  onTypeChange: (v: FinancialCategoryType) => void;
  onColorChange: (v: FinancialCategoryColorToken) => void;
}) {
  const isCreate = form.mode === 'create';
  const title = isCreate ? 'Nueva categoría' : 'Editar categoría';

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onCancel();
  }

  return (
    <Card className="p-4 lg:p-5" onKeyDown={handleKeyDown}>
      <h4 className="mb-4 border-b border-border pb-3 text-sm font-bold text-foreground">
        {title}
      </h4>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cat-name" className="text-xs font-bold text-foreground">
            Nombre <span aria-hidden="true">*</span>
          </label>
          <input
            id="cat-name"
            ref={nameInputRef}
            type="text"
            value={form.name}
            maxLength={80}
            required
            disabled={form.submitting}
            aria-invalid={form.nameError != null}
            aria-describedby={form.nameError ? 'cat-name-error' : undefined}
            onChange={(e) => onNameChange(e.target.value)}
            className={`h-10 rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 ${
              form.nameError ? 'border-destructive' : 'border-input'
            }`}
            placeholder="Ej: Alimentación"
          />
          {form.nameError && (
            <p id="cat-name-error" role="alert" className="text-xs font-semibold text-destructive">
              {form.nameError}
            </p>
          )}
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-bold text-foreground">Tipo</p>
          {isCreate ? (
            <div className="flex gap-4">
              {(['income', 'expense'] as FinancialCategoryType[]).map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="radio"
                    name="cat-type"
                    value={t}
                    checked={form.type === t}
                    disabled={form.submitting}
                    onChange={() => onTypeChange(t)}
                    className="accent-primary"
                  />
                  {t === 'income' ? 'Ingreso' : 'Gasto'}
                </label>
              ))}
            </div>
          ) : (
            <p className="flex h-10 items-center text-sm text-muted-foreground">
              {form.editingType === 'income' ? 'Ingreso' : 'Gasto'}
              <span className="ml-2 text-xs">(no editable)</span>
            </p>
          )}
        </div>

        {/* Color */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-bold text-foreground">Color</p>
          <div role="radiogroup" aria-label="Token de color" className="flex flex-wrap gap-2">
            {COLOR_TOKENS.map((colorToken) => (
              <label key={colorToken} className="cursor-pointer" title={colorToken}>
                <input
                  type="radio"
                  name="cat-color"
                  value={colorToken}
                  checked={form.color === colorToken}
                  disabled={form.submitting}
                  onChange={() => onColorChange(colorToken)}
                  className="sr-only"
                />
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                    CATEGORY_COLOR_CLASSES[colorToken]
                  } ${
                    form.color === colorToken
                      ? 'scale-110 border-foreground'
                      : 'border-transparent hover:border-foreground/40'
                  }`}
                  aria-hidden="true"
                />
                <span className="sr-only">{colorToken}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Seleccionado: <span className="font-semibold">{form.color}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border pt-3">
          <button
            type="submit"
            disabled={form.submitting}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {form.submitting ? 'Guardando…' : isCreate ? 'Crear' : 'Guardar'}
          </button>
          <button
            type="button"
            disabled={form.submitting}
            onClick={onCancel}
            className="h-9 rounded-lg border px-4 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirmation({
  name,
  submitting,
  onConfirm,
  onCancel,
}: {
  name: string;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape' && !submitting) onCancel();
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-labelledby="delete-confirm-title"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 focus:outline-none"
    >
      <p id="delete-confirm-title" className="text-sm font-bold text-foreground">
        ¿Eliminar "{name}"?
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        La categoría se marcará como eliminada y podrás restaurarla más adelante.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={onConfirm}
          className="h-8 rounded-lg bg-destructive px-3 text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Eliminando…' : 'Confirmar eliminación'}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onCancel}
          className="h-8 rounded-lg border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────────

function CategorySection({
  title,
  description,
  type,
  categories,
  formMode,
  isMutating,
  onNew,
  onEdit,
  onDelete,
}: {
  title: string;
  description: string;
  type: FinancialCategoryType;
  categories: FinancialCategory[];
  formMode: FormMode;
  isMutating: boolean;
  onNew: () => void;
  onEdit: (cat: FinancialCategory) => void;
  onDelete: (cat: FinancialCategory) => void;
}) {
  const typeLabel = type === 'income' ? 'ingreso' : 'gasto';

  return (
    <Card className="p-4 lg:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-foreground">{title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <button
          type="button"
          disabled={formMode !== 'none' || isMutating}
          onClick={onNew}
          className="h-8 shrink-0 rounded-lg border px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Nueva categoría
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Sin categorías de {typeLabel}. Crea la primera.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              isMutating={isMutating}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Category row ──────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  isMutating,
  onEdit,
  onDelete,
}: {
  category: FinancialCategory;
  isMutating: boolean;
  onEdit: (cat: FinancialCategory) => void;
  onDelete: (cat: FinancialCategory) => void;
}) {
  const typeLabel = category.type === 'income' ? 'Ingreso' : 'Gasto';
  const colorClass = CATEGORY_COLOR_CLASSES[category.color_token];

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${colorClass}`}
        title={category.color_token}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{category.name}</p>
        <p className="text-xs text-muted-foreground">{typeLabel}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          disabled={isMutating}
          onClick={() => onEdit(category)}
          className="h-8 rounded-lg border px-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          Editar
        </button>
        <button
          type="button"
          disabled={isMutating}
          onClick={() => onDelete(category)}
          className="h-8 rounded-lg border border-destructive/40 px-2.5 text-xs font-semibold text-destructive hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ── Deleted section ───────────────────────────────────────────────────────────

function DeletedSection({
  categories,
  isMutating,
  onRestore,
}: {
  categories: FinancialCategory[];
  isMutating: boolean;
  onRestore: (cat: FinancialCategory) => void;
}) {
  return (
    <Card className="p-4 opacity-80 lg:p-5">
      <div className="mb-3 border-b border-border pb-3">
        <h4 className="text-sm font-bold text-muted-foreground">Categorías eliminadas</h4>
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          Inactivas. Se pueden restaurar conservando su identidad.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <DeletedCategoryRow
            key={cat.id}
            category={cat}
            isMutating={isMutating}
            onRestore={onRestore}
          />
        ))}
      </div>
    </Card>
  );
}

function DeletedCategoryRow({
  category,
  isMutating,
  onRestore,
}: {
  category: FinancialCategory;
  isMutating: boolean;
  onRestore: (cat: FinancialCategory) => void;
}) {
  const typeLabel = category.type === 'income' ? 'Ingreso' : 'Gasto';
  const colorClass = CATEGORY_COLOR_CLASSES[category.color_token];

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed p-3 opacity-60">
      <span
        className={`h-3 w-3 shrink-0 rounded-full grayscale ${colorClass}`}
        title={category.color_token}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-muted-foreground line-through">
          {category.name}
        </p>
        <p className="text-xs text-muted-foreground/70">{typeLabel} · Eliminada</p>
      </div>
      <button
        type="button"
        disabled={isMutating}
        onClick={() => onRestore(category)}
        className="h-8 shrink-0 rounded-lg border px-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        Restaurar
      </button>
    </div>
  );
}
