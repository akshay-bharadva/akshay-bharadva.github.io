import { useEffect, useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { getExtensions } from "./extensions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  ImageIcon,
  Table2,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Expand,
  Shrink,
  Undo,
  Redo,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";

interface NovelEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeight?: string;
  editable?: boolean;
  isRounded?: boolean;
  className?: string;
}

// Slash command items
const SLASH_COMMANDS = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Create a bullet list",
    icon: List,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: ListOrdered,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Create a checklist",
    icon: CheckSquare,
    command: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: "Quote",
    description: "Add a blockquote",
    icon: Quote,
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Add a code block",
    icon: Code,
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "Add a horizontal divider",
    icon: Minus,
    command: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: Table2,
    command: (editor: Editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
];

export default function NovelEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = "Press '/' for commands, or start writing...",
  minHeight = "500px",
  editable = true,
  isRounded = true,
  className,
}: NovelEditorProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashFilter, setSlashFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);

  const extensions = [
    ...getExtensions(placeholder),
    Markdown.configure({
      html: true,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ];

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value,
    editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-6",
      },
      handleKeyDown: (view, event) => {
        // Handle slash command
        if (event.key === "/" && !showSlashMenu) {
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);
          setSlashMenuPosition({
            x: coords.left,
            y: coords.bottom + 8,
          });
          setShowSlashMenu(true);
          setSlashFilter("");
          setSelectedIndex(0);
          return false;
        }

        // Handle slash menu navigation
        if (showSlashMenu) {
          const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
            cmd.title.toLowerCase().includes(slashFilter.toLowerCase()),
          );

          if (event.key === "Escape") {
            setShowSlashMenu(false);
            return true;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredCommands.length - 1 ? prev + 1 : 0,
            );
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredCommands.length - 1,
            );
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (filteredCommands[selectedIndex]) {
              // Delete the slash and filter text
              const { from, to } = view.state.selection;
              const tr = view.state.tr.delete(
                from - slashFilter.length - 1,
                to,
              );
              view.dispatch(tr);
              if (editor) filteredCommands[selectedIndex].command(editor);
              setShowSlashMenu(false);
            }
            return true;
          }
          if (event.key === "Backspace" && slashFilter === "") {
            setShowSlashMenu(false);
            return false;
          }
          if (event.key.length === 1) {
            setSlashFilter((prev) => prev + event.key);
            setSelectedIndex(0);
          } else if (event.key === "Backspace") {
            setSlashFilter((prev) => prev.slice(0, -1));
            setSelectedIndex(0);
          }
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const markdownStorage = (
        editor.storage as unknown as Record<string, MarkdownStorage>
      ).markdown;
      const markdown = markdownStorage.getMarkdown();
      onChange(markdown);
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    const markdownStorage = (
      editor?.storage as unknown as Record<string, MarkdownStorage> | undefined
    )?.markdown;
    if (editor && value !== markdownStorage?.getMarkdown()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Handle fullscreen escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  // Close slash menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        slashMenuRef.current &&
        !slashMenuRef.current.contains(event.target as Node)
      ) {
        setShowSlashMenu(false);
      }
    };

    if (showSlashMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSlashMenu]);

  // Handle image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!onImageUpload) return;

      setIsUploading(true);
      try {
        const url = await onImageUpload(file);
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [editor, onImageUpload],
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleImageUpload(file);
      }
      event.target.value = "";
    },
    [handleImageUpload],
  );

  // Handle paste for images
  useEffect(() => {
    if (!editor || !onImageUpload) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const itemsArray = Array.from(items);
      for (let i = 0; i < itemsArray.length; i++) {
        const item = itemsArray[i];
        if (item.type.startsWith("image/")) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleImageUpload(file);
          }
          break;
        }
      }
    };

    const editorElement = editorRef.current;
    editorElement?.addEventListener("paste", handlePaste);

    return () => {
      editorElement?.removeEventListener("paste", handlePaste);
    };
  }, [editor, onImageUpload, handleImageUpload]);

  // Handle drag and drop for images
  useEffect(() => {
    if (!editor || !onImageUpload) return;

    const handleDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files?.length) return;

      const filesArray = Array.from(files);
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        if (file.type.startsWith("image/")) {
          event.preventDefault();
          handleImageUpload(file);
          break;
        }
      }
    };

    const editorElement = editorRef.current;
    editorElement?.addEventListener("drop", handleDrop);

    return () => {
      editorElement?.removeEventListener("drop", handleDrop);
    };
  }, [editor, onImageUpload, handleImageUpload]);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setIsLinkPopoverOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.title.toLowerCase().includes(slashFilter.toLowerCase()),
  );

  if (!editor) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-card"
        style={{ minHeight }}
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      ref={editorRef}
      className={cn(
        "novel-editor relative flex flex-col overflow-hidden bg-card transition-all duration-200",
        isFullScreen &&
          "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-0",
        isRounded && "rounded-lg border",
        className,
      )}
      style={{ minHeight: isFullScreen ? "100vh" : minHeight }}
    >
      {/* Toolbar */}
      <div className="shrink-0 sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
        {/* Undo/Redo */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="size-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Headings */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("heading", { level: 1 }) && "bg-muted",
            )}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("heading", { level: 2 }) && "bg-muted",
            )}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("heading", { level: 3 }) && "bg-muted",
            )}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="size-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Text formatting */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", editor.isActive("bold") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", editor.isActive("italic") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("underline") && "bg-muted",
            )}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", editor.isActive("strike") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("highlight") && "bg-muted",
            )}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", editor.isActive("code") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="size-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Lists */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("bulletList") && "bg-muted",
            )}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("orderedList") && "bg-muted",
            )}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", editor.isActive("taskList") && "bg-muted")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <CheckSquare className="size-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Blocks */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive("blockquote") && "bg-muted",
            )}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <Table2 className="size-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Link */}
        <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", editor.isActive("link") && "bg-muted")}
            >
              <LinkIcon className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <div className="flex gap-2">
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setLink();
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={setLink}>
                  Set
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Image */}
        {onImageUpload && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </Button>
        )}

        <div className="flex-1" />

        {/* Alignment */}
        <div className="hidden sm:flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive({ textAlign: "left" }) && "bg-muted",
            )}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive({ textAlign: "center" }) && "bg-muted",
            )}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              editor.isActive({ textAlign: "right" }) && "bg-muted",
            )}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="size-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Fullscreen */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsFullScreen(!isFullScreen)}
        >
          {isFullScreen ? (
            <Shrink className="size-4" />
          ) : (
            <Expand className="size-4" />
          )}
        </Button>
      </div>

      {/* Editor Content */}
      <div
        className="flex-1 overflow-y-auto bg-background"
        onClick={() => editor?.chain().focus().run()} // Focus editor when clicking whitespace
      >
        <EditorContent editor={editor} />
      </div>

      {/* Slash Command Menu */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div
          ref={slashMenuRef}
          className="fixed z-50 w-64 rounded-lg border bg-popover p-1 shadow-lg"
          style={{
            left: Math.min(slashMenuPosition.x, window.innerWidth - 280),
            top: Math.min(slashMenuPosition.y, window.innerHeight - 400),
          }}
        >
          <div className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
            {slashFilter ? `Filtering: "${slashFilter}"` : "Basic blocks"}
          </div>
          {filteredCommands.map((item, index) => (
            <button
              type="button"
              key={item.title}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
              )}
              onClick={() => {
                // Delete the slash and filter text
                if (editor) {
                  const { from, to } = editor.state.selection;
                  editor
                    .chain()
                    .focus()
                    .deleteRange({ from: from - slashFilter.length - 1, to })
                    .run();
                  item.command(editor);
                }
                setShowSlashMenu(false);
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                <item.icon className="size-4" />
              </div>
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground">
                  {item.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload indicator */}
      {isUploading && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur">
          <Loader2 className="size-3 animate-spin" />
          Uploading image...
        </div>
      )}
    </div>
  );
}
