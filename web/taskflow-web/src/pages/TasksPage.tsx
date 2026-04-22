import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CategorySummary, TaskFiltersPanel, TaskSummaryPanel, TaskViewSelector } from '../features/tasks/components/TaskPanels';
import { TaskListContent } from '../features/tasks/components/TaskListContent';
import { TasksPageHeader } from '../features/tasks/components/TasksPageHeader';
import { useTasksPageState } from '../features/tasks/hooks/useTasksPageState';

export function TasksPage() {
  const { logout, session } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    actionErrorMessage,
    categories,
    categoryActionErrorMessage,
    categoryErrorMessage,
    dragOverStatus,
    draggingTask,
    editErrors,
    editingTaskId,
    editValues,
    errorMessage,
    filters,
    isCreatingCategory,
    isEditingCategories,
    isLoading,
    isLoadingCategories,
    isLoadingSummary,
    newCategoryColor,
    newCategoryName,
    pendingTaskAction,
    summaryErrorMessage,
    taskSummary,
    tasks,
    updatingCategoryId,
    viewMode,
    setIsEditingCategories,
    setNewCategoryColor,
    setNewCategoryName,
    setViewMode,
    handleCancelEdit,
    handleChangeEditValue,
    handleChangeTaskStatus,
    handleClearFilters,
    handleCreateCategory,
    handleDeleteTask,
    handleFilterChange,
    handleKanbanColumnDragOver,
    handleKanbanColumnDrop,
    handleSortChange,
    handleStartEdit,
    handleTaskDragEnd,
    handleTaskDragStart,
    handleUpdateCategoryColor,
    handleUpdateTask,
  } = useTasksPageState({
    accessToken: session?.accessToken,
    location,
    logout,
    searchParams,
    setSearchParams,
  });

  return (
    <main className="tasks-page">
      <section className="tasks-page__content" aria-labelledby="tasks-title">
        <TasksPageHeader email={session?.email} onLogout={logout} />

        <CategorySummary
          categories={categories}
          errorMessage={categoryErrorMessage ?? categoryActionErrorMessage}
          isEditing={isEditingCategories}
          isLoading={isLoadingCategories}
          onToggleEditing={() => setIsEditingCategories((current) => !current)}
          onUpdateCategoryColor={handleUpdateCategoryColor}
          updatingCategoryId={updatingCategoryId}
        />

        <TaskSummaryPanel
          errorMessage={summaryErrorMessage}
          isLoading={isLoadingSummary}
          summary={taskSummary}
        />

        <TaskFiltersPanel
          categories={categories}
          filters={filters}
          isLoading={isLoading || isLoadingCategories}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          onSortChange={handleSortChange}
        />

        <TaskViewSelector
          taskCount={tasks.length}
          viewMode={viewMode}
          onChange={setViewMode}
        />

        <TaskListContent
          actionErrorMessage={actionErrorMessage}
          categories={categories}
          categoryErrorMessage={categoryErrorMessage}
          dragOverStatus={dragOverStatus}
          draggingTask={draggingTask}
          editErrors={editErrors}
          editingTaskId={editingTaskId}
          editValues={editValues}
          errorMessage={errorMessage}
          filters={filters}
          hasActiveFilters={Boolean(filters.status || filters.priority || filters.categoryId)}
          isCreatingCategory={isCreatingCategory}
          isLoadingCategories={isLoadingCategories}
          isLoading={isLoading}
          newCategoryColor={newCategoryColor}
          newCategoryName={newCategoryName}
          onCancelEdit={handleCancelEdit}
          onChangeEditValue={handleChangeEditValue}
          onCreateCategory={handleCreateCategory}
          onChangeTaskStatus={handleChangeTaskStatus}
          onDeleteTask={handleDeleteTask}
          onKanbanColumnDragOver={handleKanbanColumnDragOver}
          onKanbanColumnDrop={handleKanbanColumnDrop}
          onNewCategoryColorChange={setNewCategoryColor}
          onNewCategoryNameChange={setNewCategoryName}
          onStartEdit={handleStartEdit}
          onTaskDragEnd={handleTaskDragEnd}
          onTaskDragStart={handleTaskDragStart}
          onUpdateTask={handleUpdateTask}
          pendingTaskAction={pendingTaskAction}
          tasks={tasks}
          viewMode={viewMode}
        />
      </section>
    </main>
  );
}
