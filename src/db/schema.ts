import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  toolId: text('tool_id').notNull(),
  parentId: text('parent_id'),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => {
  return {
    toolIdIdx: index('idx_comments_tool_id').on(table.toolId),
    parentIdIdx: index('idx_comments_parent_id').on(table.parentId),
  };
});