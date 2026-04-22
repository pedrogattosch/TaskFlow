import type { DragEvent } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { statusOptions } from '../constants';
import type { TaskListContentProps } from '../types';
import { canMoveTaskToStatus, getStatusClassName, sortTasksForFilters } from '../utils';
import { TaskCard } from './TaskCard';

export function TaskListContent({
  actionErrorMessage,
  categories,
  categoryErrorMessage,
  dragOverStatus,
  draggingTask,
  editErrors,
  editingTaskId,
  editValues,
  errorMessage,
  filters,
  hasActiveFilters,
  isCreatingCategory,
  isLoadingCategories,
  isLoading,
  newCategoryColor,
  newCategoryName,
  onCancelEdit,
  onChangeEditValue,
  onCreateCategory,
  onChangeTaskStatus,
  onDeleteTask,
  onKanbanColumnDragOver,
  onKanbanColumnDrop,
  onNewCategoryColorChange,
  onNewCategoryNameChange,
  onStartEdit,
  onTaskDragEnd,
  onTaskDragStart,
  onUpdateTask,
  pendingTaskAction,
  tasks,
  viewMode,
}: TaskListContentProps) {
  const kanbanColumns = useMemo(
    () =>
      statusOptions.map((option) => ({
        ...option,
        tasks: sortTasksForFilters(
          tasks.filter((task) => task.status === option.value),
          filters,
        ),
      })),
    [filters, tasks],
  );

  function handleKanbanBoardDragOver(event: DragEvent<HTMLDivElement>) {
    if (!draggingTask) {
      return;
    }

    const board = event.currentTarget;
    const bounds = board.getBoundingClientRect();
    const scrollEdgeThreshold = 120;
    const scrollStep = 28;

    if (event.clientX >= bounds.right - scrollEdgeThreshold) {
      board.scrollBy({ left: scrollStep, behavior: 'auto' });
    } else if (event.clientX <= bounds.left + scrollEdgeThreshold) {
      board.scrollBy({ left: -scrollStep, behavior: 'auto' });
    }
  }

  if (isLoading && tasks.length === 0) {
    return (
      <div className="tasks-page__state" role="status">
        Carregando tarefas...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="tasks-page__state tasks-page__state--error" role="alert">
        {errorMessage}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="tasks-page__state">
        <p>
          {hasActiveFilters
            ? 'Nenhuma tarefa encontrada para os filtros selecionados.'
            : 'Nenhuma tarefa encontrada para sua conta.'}
        </p>
        {!hasActiveFilters && (
          <Link className="tasks-page__state-action" to="/tasks/new">
            Criar primeira tarefa
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="tasks-page__state" role="status">
          Atualizando tarefas...
        </div>
      )}

      {actionErrorMessage && (
        <div className="tasks-page__state tasks-page__state--error" role="alert">
          {actionErrorMessage}
        </div>
      )}

      {viewMode === 'kanban' ? (
        <div
          className="tasks-page__kanban"
          aria-label="Kanban de tarefas"
          onDragOver={handleKanbanBoardDragOver}
        >
          {kanbanColumns.map((column) => {
            const isActiveDropTarget = dragOverStatus === column.value;
            const isDroppable = Boolean(
              draggingTask && canMoveTaskToStatus(draggingTask.fromStatus, column.value),
            );

            return (
              <section
                className={
                  isActiveDropTarget && isDroppable
                    ? 'kanban-column kanban-column--drag-over'
                    : isDroppable
                      ? 'kanban-column kanban-column--droppable'
                      : 'kanban-column'
                }
                key={column.value}
                onDragOver={(event) => onKanbanColumnDragOver(event, column.value)}
                onDrop={(event) => onKanbanColumnDrop(event, column.value)}
              >
                <header className="kanban-column__header">
                  <div>
                    <h3>{column.label}</h3>
                    <p>{column.tasks.length} tarefa(s)</p>
                  </div>
                  <span className={`task-card__status ${getStatusClassName(column.value)}`}>
                    {column.tasks.length}
                  </span>
                </header>

                <div className="kanban-column__body">
                  {column.tasks.length === 0 ? (
                    <div className="kanban-column__empty">
                      {draggingTask && isDroppable
                        ? 'Solte aqui para atualizar o status.'
                        : 'Nenhuma tarefa nesta coluna.'}
                    </div>
                  ) : (
                    column.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        categories={categories}
                        categoryErrorMessage={categoryErrorMessage}
                        editErrors={editErrors}
                        editValues={editValues}
                        editingTaskId={editingTaskId}
                        isCreatingCategory={isCreatingCategory}
                        isLoadingCategories={isLoadingCategories}
                        newCategoryColor={newCategoryColor}
                        newCategoryName={newCategoryName}
                        onCancelEdit={onCancelEdit}
                        onChangeEditValue={onChangeEditValue}
                        onCreateCategory={onCreateCategory}
                        onChangeTaskStatus={onChangeTaskStatus}
                        onDeleteTask={onDeleteTask}
                        onNewCategoryColorChange={onNewCategoryColorChange}
                        onNewCategoryNameChange={onNewCategoryNameChange}
                        onStartEdit={onStartEdit}
                        onTaskDragEnd={onTaskDragEnd}
                        onTaskDragStart={onTaskDragStart}
                        onUpdateTask={onUpdateTask}
                        pendingTaskAction={pendingTaskAction}
                        task={task}
                        viewMode={viewMode}
                        draggingTask={draggingTask}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div
          className={
            viewMode === 'blocks'
              ? 'tasks-page__list tasks-page__list--blocks'
              : 'tasks-page__list'
          }
          aria-label={viewMode === 'blocks' ? 'Tarefas em blocos' : 'Lista de tarefas'}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              categories={categories}
              categoryErrorMessage={categoryErrorMessage}
              editErrors={editErrors}
              editValues={editValues}
              editingTaskId={editingTaskId}
              isCreatingCategory={isCreatingCategory}
              isLoadingCategories={isLoadingCategories}
              newCategoryColor={newCategoryColor}
              newCategoryName={newCategoryName}
              onCancelEdit={onCancelEdit}
              onChangeEditValue={onChangeEditValue}
              onCreateCategory={onCreateCategory}
              onChangeTaskStatus={onChangeTaskStatus}
              onDeleteTask={onDeleteTask}
              onNewCategoryColorChange={onNewCategoryColorChange}
              onNewCategoryNameChange={onNewCategoryNameChange}
              onStartEdit={onStartEdit}
              onTaskDragEnd={onTaskDragEnd}
              onTaskDragStart={onTaskDragStart}
              onUpdateTask={onUpdateTask}
              pendingTaskAction={pendingTaskAction}
              task={task}
              viewMode={viewMode}
              draggingTask={draggingTask}
            />
          ))}
        </div>
      )}
    </>
  );
}
