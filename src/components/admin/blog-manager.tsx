import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/types";
import BlogEditor from "./blog-editor";
import {
  useGetAdminBlogPostsQuery,
  useAddBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Eye,
  Loader2,
  Plus,
  MoreHorizontal,
  FileText,
  Calendar,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn, getErrorMessage } from "@/lib/utils";
import { useConfirm } from "../providers/ConfirmDialogProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader, EmptyState, ManagerWrapper } from "./shared";

interface BlogManagerProps {
  startInCreateMode?: boolean;
  onActionHandled?: () => void;
}

export default function BlogManager({
  startInCreateMode,
  onActionHandled,
}: BlogManagerProps) {
  const confirm = useConfirm();
  const isMobile = useIsMobile();

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");

  const { data: posts = [], isLoading, error } = useGetAdminBlogPostsQuery();
  const [addBlogPost] = useAddBlogPostMutation();
  const [updateBlogPost] = useUpdateBlogPostMutation();
  const [deleteBlogPost] = useDeleteBlogPostMutation();

  useEffect(() => {
    if (startInCreateMode) {
      handleCreatePost();
      onActionHandled?.();
    }
  }, [startInCreateMode, onActionHandled]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        if (filterStatus === "published") return post.published;
        if (filterStatus === "draft") return !post.published;
        return true;
      })
      .filter((post) =>
        (post.title || "").toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [posts, searchTerm, filterStatus]);

  const handleCreatePost = () => {
    setIsCreating(true);
    setEditingPost(null);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPost(null);
  };

  const handleDeletePost = async (post: BlogPost) => {
    const ok = await confirm({
      title: `Delete "${post.title}"?`,
      description: "This action cannot be undone.",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deleteBlogPost(post).unwrap();
      toast.success("Post deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete post", { description: getErrorMessage(err) });
    }
  };

  const handleSavePost = async (postData: Partial<BlogPost>) => {
    try {
      if (isCreating || !editingPost?.id) {
        await addBlogPost(postData).unwrap();
        toast.success("Post created successfully.");
      } else {
        await updateBlogPost({ ...postData, id: editingPost.id }).unwrap();
        toast.success("Post updated successfully.");
      }
      handleCancel();
    } catch (err) {
      toast.error("Failed to save post", { description: getErrorMessage(err) });
    }
  };

  const togglePostStatus = async (post: BlogPost) => {
    try {
      await updateBlogPost({
        id: post.id,
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null,
      }).unwrap();
      toast.success(`Post ${!post.published ? "published" : "unpublished"}.`);
    } catch (err) {
      toast.error("Failed to update status", { description: getErrorMessage(err) });
    }
  };

  if (isCreating || editingPost) {
    return (
      <BlogEditor
        post={editingPost}
        onSave={handleSavePost}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <ManagerWrapper className="h-full flex flex-col">
      <PageHeader
        title="Blog Manager"
        description="Manage, create, and publish your content."
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search posts..."
        actions={
          <Button onClick={handleCreatePost} size="sm" className="h-9 w-full sm:w-auto">
            <Plus className="mr-2 size-4" /> Create Post
          </Button>
        }
        filters={
          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as "all" | "published" | "draft")}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Card className="flex-1 flex flex-col overflow-hidden border-none sm:border shadow-none sm:shadow-sm bg-transparent sm:bg-card">

        <CardContent className="p-0 flex-1 overflow-auto bg-transparent sm:bg-background/50">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No posts found"
              description={searchTerm ? "Try adjusting your search or filters." : "Create your first blog post to get started."}
              action={!searchTerm ? { label: "Create Post", onClick: handleCreatePost, icon: Plus } : undefined}
              className="h-64 border-2 border-dashed rounded-lg bg-muted/10 mx-0 sm:mx-4 my-4"
            />
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredPosts.map((post) => (
                        <motion.tr
                          key={post.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="group hover:bg-secondary/40"
                        >
                          <TableCell>
                            <div className="h-10 w-10 rounded-md border bg-secondary/50 overflow-hidden flex items-center justify-center">
                              {post.cover_image_url ? (
                                <img
                                  src={post.cover_image_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-muted-foreground opacity-50" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="truncate max-w-[200px] lg:max-w-[300px]">
                                {post.title}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                /{post.slug}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={post.published ? "default" : "secondary"}
                              className={
                                post.published
                                  ? "bg-primary/15 text-primary hover:bg-primary/25 border-primary/20"
                                  : ""
                              }
                            >
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {post.views?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {format(
                                new Date(post.updated_at || new Date()),
                                "MMM dd, yyyy",
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleEditPost(post)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleEditPost(post)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => togglePostStatus(post)}
                                  >
                                    {post.published ? (
                                      <>
                                        <FileText className="mr-2 h-4 w-4" />{" "}
                                        Unpublish
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="mr-2 h-4 w-4" /> Publish
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  {post.published && (
                                    <DropdownMenuItem asChild>
                                      <a
                                        href={`/blog/view?slug=${post.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <ExternalLink className="mr-2 h-4 w-4" />{" "}
                                        View Live
                                      </a>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeletePost(post)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="md:hidden space-y-3">
                <AnimatePresence>
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Render Thumbnail Only If Exists */}
                            {post.cover_image_url && (
                              <div className="h-16 w-16 shrink-0 rounded-md border bg-secondary/50 overflow-hidden flex items-center justify-center">
                                <img
                                  src={post.cover_image_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-sm truncate pr-2">
                                  {post.title}
                                </h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 -mr-2 -mt-1"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditPost(post)}
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => togglePostStatus(post)}
                                    >
                                      {post.published ? "Unpublish" : "Publish"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeletePost(post)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    post.published ? "default" : "secondary"
                                  }
                                  className={cn(
                                    "text-[10px] h-5 px-1.5",
                                    post.published
                                      ? "bg-primary/15 text-primary border-primary/20"
                                      : "",
                                  )}
                                >
                                  {post.published ? "Published" : "Draft"}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono">
                                  /{post.slug}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 border-t pt-2">
                                <div className="flex items-center gap-1">
                                  <Eye className="size-3" />{" "}
                                  {post.views?.toLocaleString() || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="size-3" />{" "}
                                  {format(
                                    new Date(post.updated_at || new Date()),
                                    "MMM dd",
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ManagerWrapper>
  );
}
