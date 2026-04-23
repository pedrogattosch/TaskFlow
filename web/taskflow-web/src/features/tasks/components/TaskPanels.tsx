import { Button } from '../../../components/Button';
import { defaultCategoryColor, sortOptions, priorityOptions, statusOptions } from '../constants';
import type {
  CategorySummaryProps,
  TaskFiltersPanelProps,
  TaskSummaryPanelProps,
  TaskViewSelectorProps,
} from '../types';
import { TaskIcon } from './TaskIcon';
import { categoryColorStyle } from '../utils';

export function CategorySummary({
  categories,
  errorMessage,
  isEditing,
  isLoading,
  onToggleEditing,
  onUpdateCategoryColor,
  updatingCategoryId,
}: CategorySummaryProps) {
  if (isLoading) {
    return (
      <section className="categories-panel" aria-labelledby="categories-title">
        <div className="categories-panel__header">
          <h2 id="categories-title">Categorias</h2>
        </div>
        <p role="status">Carregando categorias...</p>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="categories-panel" aria-labelledby="categories-title">
        <div className="categories-panel__header">
          <h2 id="categories-title">Categorias</h2>
        </div>
        {errorMessage && <p className="categories-panel__error" role="alert">{errorMessage}</p>}
        <p>Nenhuma categoria cadastrada.</p>
      </section>
    );
  }

  return (
    <section className="categories-panel" aria-labelledby="categories-title">
      <div className="categories-panel__header">
        <div>
          <h2 id="categories-title">Categorias</h2>
        </div>

        <Button
          className="categories-panel__edit-button"
          type="button"
          variant="secondary"
          icon={isEditing ? undefined : <TaskIcon name="pencil" />}
          onClick={onToggleEditing}
        >
          {isEditing ? 'Concluir edição' : 'Editar categorias'}
        </Button>
      </div>

      {errorMessage && <p className="categories-panel__error" role="alert">{errorMessage}</p>}

      <ul className="categories-panel__list">
        {categories.map((category) => (
          <li key={category.id} style={categoryColorStyle(category.color)}>
            {isEditing ? (
              <label className="categories-panel__swatch-control">
                <span className="categories-panel__swatch" aria-hidden="true" />
                <input
                  className="categories-panel__swatch-input"
                  type="color"
                  value={category.color ?? defaultCategoryColor}
                  aria-label={`Cor da categoria ${category.name}`}
                  disabled={updatingCategoryId === category.id}
                  onChange={(event) => onUpdateCategoryColor(category, event.target.value)}
                />
              </label>
            ) : (
              <span className="categories-panel__swatch" aria-hidden="true" />
            )}
            <span>{category.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TaskSummaryPanel({ errorMessage, isLoading, summary }: TaskSummaryPanelProps) {
  if (errorMessage && !summary) {
    return (
      <section
        className="task-summary-panel task-summary-panel--error"
        aria-labelledby="task-summary-title"
      >
        <div>
          <h2 id="task-summary-title">Resumo das tarefas</h2>
          <p role="alert">{errorMessage}</p>
        </div>
      </section>
    );
  }

  const items = [
    { label: 'Pendentes', value: summary?.pending ?? 0 },
    { label: 'Em andamento', value: summary?.inProgress ?? 0 },
    { label: 'Concluídas', value: summary?.completed ?? 0 },
    { label: 'Canceladas', value: summary?.cancelled ?? 0 },
  ];

  return (
    <section className="task-summary-panel" aria-labelledby="task-summary-title">
      <div className="task-summary-panel__header">
        <div>
          <h2 id="task-summary-title">Resumo das tarefas</h2>
        </div>

        {isLoading && (
          <span className="task-summary-panel__status" role="status">
            {summary ? 'Atualizando...' : 'Carregando...'}
          </span>
        )}
      </div>

      {errorMessage && (
        <p className="task-summary-panel__error" role="alert">
          {errorMessage}
        </p>
      )}

      <dl className="task-summary-panel__grid">
        {items.map((item) => (
          <div className="task-summary-panel__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function TaskFiltersPanel({
  categories,
  filters,
  isLoading,
  onChange,
  onClear,
  onSortChange,
}: TaskFiltersPanelProps) {
  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.categoryId);
  const sortValue = `${filters.sortBy}:${filters.sortDirection}`;

  return (
    <section className="tasks-filter-panel" aria-labelledby="tasks-filter-title">
      <div className="tasks-filter-panel__header">
        <div>
          <h2 id="tasks-filter-title">Filtros e ordenação</h2>
        </div>

        <Button
          className="task-card__action"
          type="button"
          variant="secondary"
          icon={<TaskIcon name="x" />}
          onClick={onClear}
          disabled={isLoading || !hasActiveFilters}
        >
          Limpar filtros
        </Button>
      </div>

      <div className="tasks-filter-panel__grid">
        <label className="tasks-filter-panel__field">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            disabled={isLoading}
          >
            <option value="">Todos</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="tasks-filter-panel__field">
          <span>Prioridade</span>
          <select
            value={filters.priority}
            onChange={(event) => onChange('priority', event.target.value)}
            disabled={isLoading}
          >
            <option value="">Todas</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="tasks-filter-panel__field">
          <span>Categoria</span>
          <select
            value={filters.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            disabled={isLoading || categories.length === 0}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="tasks-filter-panel__field">
          <span>Ordenar por</span>
          <select
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value)}
            disabled={isLoading}
          >
            {sortOptions.map((option) => (
              <option
                key={`${option.sortBy}:${option.sortDirection}`}
                value={`${option.sortBy}:${option.sortDirection}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export function TaskViewSelector({ taskCount, viewMode, onChange }: TaskViewSelectorProps) {
  return (
    <section className="task-view-selector" aria-labelledby="task-view-title">
      <div>
        <h2 id="task-view-title">Visualização</h2>
        <p>{taskCount} tarefa(s) carregada(s)</p>
      </div>

      <div className="task-view-selector__controls" aria-label="Modo de visualização">
        <button
          className={viewMode === 'list' ? 'task-view-selector__button task-view-selector__button--active' : 'task-view-selector__button'}
          type="button"
          onClick={() => onChange('list')}
          aria-pressed={viewMode === 'list'}
        >
          <TaskIcon name="list" />
          Lista
        </button>

        <button
          className={viewMode === 'blocks' ? 'task-view-selector__button task-view-selector__button--active' : 'task-view-selector__button'}
          type="button"
          onClick={() => onChange('blocks')}
          aria-pressed={viewMode === 'blocks'}
        >
          <TaskIcon name="grid" />
          Blocos
        </button>

        <button
          className={viewMode === 'kanban' ? 'task-view-selector__button task-view-selector__button--active' : 'task-view-selector__button'}
          type="button"
          onClick={() => onChange('kanban')}
          aria-pressed={viewMode === 'kanban'}
        >
          <TaskIcon name="kanban" />
          Kanban
        </button>
      </div>
    </section>
  );
}
