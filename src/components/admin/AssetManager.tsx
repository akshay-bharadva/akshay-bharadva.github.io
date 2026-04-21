
import React, { useState, useRef, DragEvent, useMemo } from "react";
import { supabase } from "@/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  Loader2,
  Trash2,
  Link as LinkIcon,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  CheckSquare,
  Download,
  Folder,
  FolderPlus,
  ChevronRight,
  Move,
} from "lucide-react";
import { cn, getStorageUrl, getErrorMessage } from "@/lib/utils";
import { useConfirm } from "../providers/ConfirmDialogProvider";
import {
  useGetAssetsQuery,
  useAddAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  useRescanAssetUsageMutation,
  useMoveAssetMutation,
} from "@/store/api/adminApi";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageHeader, ManagerWrapper } from "./shared";

// Extracted components
import {
  BUCKET_NAME,
  PLACEHOLDER_FILENAME,
  getFileIcon,
  getAllFolderPaths,
  getAssetsForPath,
  AssetThumbnail,
  AssetDetailsSheet,
  CreateFolderDialog,
  MoveAssetsDialog,
  AssetBreadcrumbs,
  type StorageAsset,
} from "./assets";

export default function AssetManager() {
  const isMobile = useIsMobile();
  const confirm = useConfirm();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StorageAsset | null>(null);

  // Folder Logic
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Selection & Move
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>("root");

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  const { data: assets = [], isLoading } = useGetAssetsQuery();
  const [addAsset] = useAddAssetMutation();
  const [updateAsset] = useUpdateAssetMutation();
  const [deleteAsset] = useDeleteAssetMutation();
  const [moveAsset] = useMoveAssetMutation();
  const [rescanUsage] = useRescanAssetUsageMutation();

  // --- DERIVED DATA ---
  const allAvailableFolders = useMemo(
    () => getAllFolderPaths(assets),
    [assets]
  );

  const { currentFolderAssets, subFolders } = useMemo(
    () => getAssetsForPath(assets, currentPath),
    [assets, currentPath]
  );

  // --- NAVIGATION ---
  const navigateToFolder = (folderName: string) => {
    setCurrentPath((prev) => [...prev, folderName]);
    setBulkSelectedIds(new Set());
  };

  const navigateUp = () => {
    setCurrentPath((prev) => prev.slice(0, -1));
    setBulkSelectedIds(new Set());
  };

  const navigateToBreadcrumb = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
    setBulkSelectedIds(new Set());
  };

  const navigateRoot = () => {
    setCurrentPath([]);
    setBulkSelectedIds(new Set());
  };

  // --- ACTIONS ---
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    if (!supabase) return;

    const pathPrefix =
      currentPath.length > 0 ? currentPath.join("/") + "/" : "";
    const safeName = newFolderName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fullPath = `${pathPrefix}${safeName}/${PLACEHOLDER_FILENAME}`;

    try {
      const dummyFile = new File([""], PLACEHOLDER_FILENAME, {
        type: "text/plain",
      });
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fullPath, dummyFile);

      if (uploadError) throw uploadError;

      await addAsset({
        file_name: PLACEHOLDER_FILENAME,
        file_path: fullPath,
        mime_type: "application/x-directory",
        size_kb: 0,
      }).unwrap();

      toast.success("Folder created");
      setIsCreateFolderOpen(false);
      setNewFolderName("");
    } catch (err) {
      toast.error("Failed to create folder", { description: getErrorMessage(err) });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) handleUpload(files);
  };

  const handleUpload = async (files: FileList) => {
    if (!supabase) {
      toast.error("Database not configured. Cannot upload assets.");
      return;
    }

    setIsUploading(true);
    const pathPrefix =
      currentPath.length > 0 ? currentPath.join("/") + "/" : "";

    const uploadPromises = Array.from(files).map(async (file) => {
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/__+/g, "_");

      const filePath = `${pathPrefix}${Date.now()}_${sanitizedName}`;

      const { error: uploadError } = await supabase!.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError)
        throw new Error(
          `Upload failed for ${file.name}: ${uploadError.message}`
        );

      try {
        await addAsset({
          file_name: file.name,
          file_path: filePath,
          mime_type: file.type,
          size_kb: file.size / 1024,
        }).unwrap();
      } catch (dbInsertError) {
        await supabase!.storage.from(BUCKET_NAME).remove([filePath]);
        throw new Error(
          `DB insert failed for ${file.name}: ${dbInsertError instanceof Error ? dbInsertError.message : "Unknown error"}`
        );
      }
    });

    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} asset(s) uploaded!`);
      await handleRescanUsage(true);
    } catch (error) {
      toast.error("An upload failed", { description: getErrorMessage(error) });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleMoveAssets = async () => {
    const assetsToMove = currentFolderAssets.filter((a) =>
      bulkSelectedIds.has(a.id)
    );
    if (assetsToMove.length === 0) return;

    try {
      const movePromises = assetsToMove.map((asset) => {
        const fileName = asset.file_name;
        const newPath =
          targetMoveFolder === "root"
            ? fileName
            : `${targetMoveFolder}/${fileName}`;

        if (newPath === asset.file_path) return Promise.resolve();

        return moveAsset({
          assetId: asset.id,
          oldPath: asset.file_path,
          newPath: newPath,
        }).unwrap();
      });

      await Promise.all(movePromises);
      toast.success(`Moved ${assetsToMove.length} items`);
      setBulkSelectedIds(new Set());
      setIsMoveDialogOpen(false);
      setIsBulkSelectMode(false);
    } catch (err) {
      toast.error("Failed to move assets", { description: getErrorMessage(err) });
    }
  };

  const handleDeleteAssets = async (assets: StorageAsset[]) => {
    if (assets.length === 0) return;

    const ok = await confirm({
      title: "Are you absolutely sure?",
      description: `This action cannot be undone. This will permanently delete ${assets.length} asset(s).`,
      variant: "destructive",
      confirmText: "Confirm Delete",
    });
    if (!ok) return;

    try {
      await Promise.all(assets.map((asset) => deleteAsset(asset).unwrap()));
      toast.success(`${assets.length} asset(s) deleted.`);
      if (isBulkSelectMode) {
        setIsBulkSelectMode(false);
        setBulkSelectedIds(new Set());
      }
    } catch (err) {
      toast.error("Failed to delete one or more assets", {
        description: getErrorMessage(err),
      });
    }
  };

  const handleBulkDelete = () => {
    const toDelete = currentFolderAssets.filter((asset) =>
      bulkSelectedIds.has(asset.id)
    );
    if (toDelete.length > 0) {
      handleDeleteAssets(toDelete);
    }
  };

  const handleUpdateAltText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const formData = new FormData(e.currentTarget);
    const alt_text = (formData.get("alt_text") as string) || "";

    try {
      const updated = await updateAsset({
        id: selectedAsset.id,
        alt_text,
      }).unwrap();
      toast.success("Alt text updated.");
      setSelectedAsset(updated);
    } catch (err) {
      toast.error("Failed to update alt text", { description: getErrorMessage(err) });
    }
  };

  const handleRescanUsage = async (isSilent = false) => {
    try {
      await rescanUsage().unwrap();
      if (!isSilent) toast.success("Asset usage successfully updated.");
    } catch (err) {
      if (!isSilent)
        toast.error("Failed to rescan asset usage", {
          description: getErrorMessage(err),
        });
    }
  };

  const downloadAsset = async (asset: StorageAsset) => {
    try {
      const url = getStorageUrl(asset.file_path);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = asset.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDragEvents = (
    e: DragEvent<HTMLDivElement>,
    isEntering: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleUpload(files);
  };

  const toggleBulkSelect = (id: string) => {
    const newSet = new Set(bulkSelectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setBulkSelectedIds(newSet);
  };

  const effectiveViewMode = isMobile ? "grid" : viewMode;

  return (
    <ManagerWrapper className="h-full flex flex-col">
      <PageHeader
        title="Asset Manager"
        description={
          <AssetBreadcrumbs
            currentPath={currentPath}
            onNavigateRoot={navigateRoot}
            onNavigateToBreadcrumb={navigateToBreadcrumb}
          />
        }
        actions={
          <div className="flex flex-wrap gap-2">
          {isBulkSelectMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMoveDialogOpen(true)}
                disabled={bulkSelectedIds.size === 0}
                className="flex-1 sm:flex-none"
              >
                <Move className="mr-2 size-4" /> Move ({bulkSelectedIds.size})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkSelectedIds.size === 0}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="mr-2 size-4" /> Delete ({bulkSelectedIds.size}
                )
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsBulkSelectMode(false);
                  setBulkSelectedIds(new Set());
                }}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 size-4" /> Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateFolderOpen(true)}
                className="hidden sm:flex"
              >
                <FolderPlus className="mr-2 size-4" /> New Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRescanUsage()}
                disabled={isLoading}
                className="hidden sm:flex"
              >
                <RefreshCw className="mr-2 size-4" /> Rescan
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {isUploading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}{" "}
                Upload
              </Button>
            </>
          )}
          </div>
        }
      />

      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <Card
        className="flex-1 flex flex-col min-h-[500px]"
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDrop={handleDrop}
      >
        <CardHeader className="border-b p-4 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {currentPath.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateUp}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="size-4 rotate-180" />
                </Button>
              )}
              <Button
                variant={isBulkSelectMode ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsBulkSelectMode(!isBulkSelectMode)}
                className="h-8 text-xs"
              >
                <CheckSquare className="mr-2 size-3.5" />
                {isMobile ? "Select" : "Select Files"}
              </Button>
            </div>

            {!isMobile && (
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as "grid" | "list");
                }}
                size="sm"
              >
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1 relative overflow-y-auto">
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-b-lg flex flex-col items-center justify-center backdrop-blur-sm">
              <Upload className="size-10 text-primary mb-2" />
              <p className="font-semibold text-primary">
                Drop files to upload to current folder
              </p>
            </div>
          )}

          {isLoading && !assets.length ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : subFolders.length === 0 && currentFolderAssets.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center h-full justify-center">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <LayoutGrid className="size-8 opacity-20" />
              </div>
              <h3 className="text-lg font-semibold">Empty Folder</h3>
              <p className="text-sm mt-1">Upload files or create a subfolder.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsCreateFolderOpen(true)}
              >
                <FolderPlus className="mr-2 size-4" /> Create Folder
              </Button>
            </div>
          ) : (
            <>
              {/* Folders */}
              {subFolders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Folders
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {subFolders.map((folder) => (
                      <div
                        key={folder}
                        onClick={() => navigateToFolder(folder)}
                        className="group flex flex-col items-center gap-2 cursor-pointer p-4 rounded-xl border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all"
                      >
                        <Folder className="size-10 text-blue-400 fill-blue-400/20 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium truncate w-full text-center">
                          {folder}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {currentFolderAssets.length > 0 && (
                <div>
                  {subFolders.length > 0 && (
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      Files
                    </h3>
                  )}

                  {effectiveViewMode === "grid" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {currentFolderAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className={cn(
                            "group relative aspect-square overflow-hidden rounded-md border bg-card cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
                            isBulkSelectMode &&
                              bulkSelectedIds.has(asset.id) &&
                              "ring-2 ring-primary bg-primary/10"
                          )}
                          onClick={() => {
                            if (isBulkSelectMode) toggleBulkSelect(asset.id);
                            else setSelectedAsset(asset);
                          }}
                        >
                          {isBulkSelectMode && (
                            <div className="absolute top-2 left-2 z-10">
                              <Checkbox
                                checked={bulkSelectedIds.has(asset.id)}
                                className="bg-background/80 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              />
                            </div>
                          )}

                          <AssetThumbnail asset={asset} />

                          <div
                            className={cn(
                              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white opacity-0 transition-opacity flex flex-col justify-end",
                              !isBulkSelectMode && "group-hover:opacity-100"
                            )}
                          >
                            <p className="text-[10px] font-medium truncate">
                              {asset.file_name}
                            </p>
                            <p className="text-[9px] opacity-80 uppercase">
                              {asset.mime_type?.split("/")[1] || "File"}
                            </p>
                          </div>

                          {!isBulkSelectMode && (
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadAsset(asset);
                              }}
                              title="Download"
                            >
                              <Download className="size-3.5" />
                            </Button>
                          )}

                          {asset.used_in && asset.used_in.length > 0 && (
                            <div className="absolute top-1.5 left-1.5 rounded-full bg-primary/90 p-1 shadow-sm z-10">
                              <LinkIcon className="size-2.5 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">Preview</TableHead>
                            <TableHead>Filename</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Type
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Size
                            </TableHead>
                            <TableHead className="w-[50px]">Used</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentFolderAssets.map((asset) => (
                            <TableRow
                              key={asset.id}
                              className="group hover:bg-muted/30 cursor-pointer"
                              onClick={() => {
                                if (isBulkSelectMode) toggleBulkSelect(asset.id);
                                else setSelectedAsset(asset);
                              }}
                            >
                              <TableCell className="py-2">
                                {isBulkSelectMode ? (
                                  <Checkbox
                                    checked={bulkSelectedIds.has(asset.id)}
                                    onCheckedChange={() =>
                                      toggleBulkSelect(asset.id)
                                    }
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-md overflow-hidden bg-secondary flex items-center justify-center">
                                    {asset.mime_type?.startsWith("image/") ? (
                                      <img
                                        src={getStorageUrl(asset.file_path)}
                                        alt={asset.alt_text || asset.file_name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      getFileIcon(
                                        asset.mime_type,
                                        "size-4 opacity-50"
                                      )
                                    )}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium max-w-[150px] truncate text-xs">
                                {asset.file_name}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground text-xs uppercase">
                                {asset.mime_type?.split("/")[1] || "File"}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-xs">
                                {asset.size_kb
                                  ? `${asset.size_kb.toFixed(0)} KB`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {asset.used_in && asset.used_in.length > 0 && (
                                  <LinkIcon className="size-3.5 text-primary" />
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadAsset(asset);
                                    }}
                                    title="Download"
                                  >
                                    <Download className="size-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAssets([asset]);
                                    }}
                                    title="Delete"
                                  >
                                    <Trash2 className="size-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* --- DIALOGS --- */}
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        currentPath={currentPath}
        folderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        onSubmit={handleCreateFolder}
      />

      <MoveAssetsDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        selectedCount={bulkSelectedIds.size}
        availableFolders={allAvailableFolders}
        targetFolder={targetMoveFolder}
        onTargetFolderChange={setTargetMoveFolder}
        onSubmit={handleMoveAssets}
      />

      <AssetDetailsSheet
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onUpdateAltText={handleUpdateAltText}
        onDownload={downloadAsset}
      />
    </ManagerWrapper>
  );
}
