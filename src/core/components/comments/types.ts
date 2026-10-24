export interface Comment {
  id: string;
  toolId: string;
  parentId: string | null;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: number;
}