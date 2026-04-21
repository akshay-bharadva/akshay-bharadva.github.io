import { StarterKit } from "@tiptap/starter-kit";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Underline } from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Typography } from "@tiptap/extension-typography";
import { CharacterCount } from "@tiptap/extension-character-count";
import { TextAlign } from "@tiptap/extension-text-align";

export const getExtensions = (placeholder: string = "Start writing...") => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    codeBlock: {
      HTMLAttributes: {
        class: "rounded-lg bg-muted p-4 font-mono text-sm",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-primary pl-4 italic text-muted-foreground",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc list-outside ml-4",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal list-outside ml-4",
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "my-4 border-border",
      },
    },
  }),
  Placeholder.configure({
    placeholder,
    emptyEditorClass: "is-editor-empty",
  }),
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: "bg-yellow-200 dark:bg-yellow-800/50 px-1 rounded",
    },
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: "not-prose",
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: "flex items-start gap-2",
    },
  }),
  Underline,
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: "border-collapse table-auto w-full",
    },
  }),
  TableRow,
  TableCell.configure({
    HTMLAttributes: {
      class: "border border-border p-2",
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: "border border-border bg-muted p-2 font-semibold",
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-primary underline cursor-pointer",
    },
  }),
  Image.configure({
    allowBase64: false,
    HTMLAttributes: {
      class: "rounded-lg border max-w-full h-auto",
    },
  }),
  Typography,
  CharacterCount,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
];
