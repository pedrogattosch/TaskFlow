import { priorityLabels, statusLabels } from '../constants';
import type { TaskCardProps } from '../types';
import {
  categoryColorStyle,
  formatDate,
  getPriorityClassName,
  getStatusClassName,
  getTaskStatusActions,
  isTaskActionPending,
} from '../utils';
import { TaskEditForm } from './TaskEditForm';
import { TaskIcon } from './TaskIcon';

export function TaskCard({
  categories,
  categoryErrorMessage,
  editErrors,
  editValues,
  editingTaskId,
  isCreatingCategory,
  isLoadingCategories,
  newCategoryColor,
  newCategoryName,
  onCancelEdit,
  onChangeEditValue,
  onCreateCategory,
  onChangeTaskStatus,
  onDeleteTask,
  onNewCategoryColorChange,
  onNewCategoryNameChange,
  onStartEdit,
  onTaskDragEnd,
  onTaskDragStart,
  onUpdateTask,
  pendingTaskAction,
  task,
  viewMode,
  draggingTask,
}: TaskCardProps) {
  const isEditing = task.id === editingTaskId && editValues;
  const isUpdating = isTaskActionPending(pendingTaskAction, task.id, 'update');
  const statusActions = getTaskStatusActions(task.status);
  const category = categories.find((current) => current.id === task.categoryId);
  const isDragging = draggingTask?.taskId === task.id;

  return (
    <article
      className={isEditing ? 'task-card task-card--editing' : 'task-card'}
      style={categoryColorStyle(category?.color)}
      draggable={viewMode === 'kanban' && !isEditing && !pendingTaskAction}
      onDragStart={() => onTaskDragStart(task)}
      onDragEnd={onTaskDragEnd}
      data-dragging={isDragging ? 'true' : undefined}
    >
      {isEditing && editValues ? (
        <TaskEditForm
          categories={categories}
          categoryErrorMessage={categoryErrorMessage}
          errors={editErrors}
          isCreatingCategory={isCreatingCategory}
          isLoadingCategories={isLoadingCategories}
          isLoading={isUpdating}
          newCategoryColor={newCategoryColor}
          newCategoryName={newCategoryName}
          onCancel={onCancelEdit}
          onChange={onChangeEditValue}
          onCreateCategory={onCreateCategory}
          onNewCategoryColorChange={onNewCategoryColorChange}
          onNewCategoryNameChange={onNewCategoryNameChange}
          onSubmit={(event) => onUpdateTask(event, task.id)}
          taskId={task.id}
          taskTitle={task.title}
          values={editValues}
        />
      ) : (
        <>
          <div className="task-card__main">
            <div>
              <h2>{task.title}</h2>
              {task.description && <p>{task.description}</p>}
            </div>

            <span className={`task-card__status ${getStatusClassName(task.status)}`}>
              {statusLabels[task.status]}
            </span>
          </div>

          <dl className="task-card__meta">
            <div>
              <dt>Prioridade</dt>
              <dd>
                <span className={`task-card__priority ${getPriorityClassName(task.priority)}`}>
                  {priorityLabels[task.priority]}
                </span>
              </dd>
            </div>
            <div>
              <dt>Vencimento</dt>
              <dd>{formatDate(task.dueDate)}</dd>
            </div>
            <div>
              <dt>Categoria</dt>
              <dd>
                <span className="task-card__category-chip">
                  <span className="task-card__category-dot" aria-hidden="true" />
                  {task.categoryName ?? 'Sem categoria'}
                </span>
              </dd>
            </div>
          </dl>

          <div className="task-card__actions" aria-label={`Ações da tarefa ${task.title}`}>
            <div className="task-card__status-actions">
              {statusActions.map((statusAction) => (
                <button
                  className={
                    statusAction.variant === 'danger'
                      ? 'task-card__action task-card__action--danger'
                      : 'task-card__action'
                  }
                  type="button"
                  key={statusAction.action}
                  onClick={() =>
                    onChangeTaskStatus(task.id, statusAction.status, statusAction.action)
                  }
                  disabled={Boolean(pendingTaskAction)}
                >
                  {isTaskActionPending(pendingTaskAction, task.id, statusAction.action)
                    ? statusAction.loadingLabel
                    : statusAction.label}
                </button>
              ))}
            </div>

            <div className="task-card__management-actions">
              <button
                className="task-card__icon-action"
                type="button"
                onClick={() => onStartEdit(task)}
                disabled={Boolean(pendingTaskAction)}
                aria-label={`Editar tarefa ${task.title}`}
                title="Editar tarefa"
              >
                <TaskIcon name="pencil" />
                <span>Editar</span>
              </button>

              <button
                className="task-card__icon-action task-card__icon-action--danger"
                type="button"
                onClick={() => onDeleteTask(task.id)}
                disabled={Boolean(pendingTaskAction)}
                aria-label={`Excluir tarefa ${task.title}`}
                title="Excluir tarefa"
              >
                <TaskIcon name="x" />
                <span>
                  {isTaskActionPending(pendingTaskAction, task.id, 'delete')
                    ? 'Excluindo...'
                    : 'Excluir'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
