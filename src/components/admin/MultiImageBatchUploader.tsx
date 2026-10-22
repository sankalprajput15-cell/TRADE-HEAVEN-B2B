import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Package,
  Layers,
  Check,
  RefreshCw,
  Search,
  ArrowRight,
  Wand2,
  ListOrdered,
  AlertCircle,
  X,
  FileCheck2,
  Eye,
  Grid,
  List,
  Copy,
  ShieldCheck,
  CheckSquare,
  Square,
  RotateCw,
  RotateCcw,
  Crop,
  Sliders,
  Sun
} from 'lucide-react';
import { Product } from '../../types';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { api } from '../../services/apiService';
import {
  productImageManagerService,
  OutputImageFormat,
  ImageEditFilters,
  DEFAULT_IMAGE_EDIT_FILTERS,
  buildCssFilterString,
  hasActiveImageFilters
} from '../../services/productImageManagerService';
import { SafeImage } from '../common/SafeImage';
import { ImageEditingOverlay } from './ImageEditingOverlay';

export interface MultiImageBatchUploaderProps {
  products?: Product[];
  defaultOutputFormat?: OutputImageFormat;
  defaultAutoWebpLossless?: boolean;
  onToggleAutoWebpLossless?: (enabled: boolean) => void;
  embedded?: boolean;
  onAssignImages?: (assignments: { productId: string; imageUrl: string }[]) => void;
}

export interface QueuedBulkImageItem {
  id: string;
  file: File;
  previewUrl: string;
  rotationDegrees: number;
  filters: ImageEditFilters;
  assignedProductId: string;
  matchType: 'exact-id' | 'partial-id' | 'title-match' | 'manual' | 'sequential' | 'unmapped' | 'none';
  placementMode: 'primary' | 'gallery';
  status: 'ready' | 'unmapped' | 'uploading' | 'saved' | 'error';
  savedUrl?: string;
  compressedSizeBytes?: number;
  losslessApplied?: boolean;
  errorMessage?: string;
}

export const MultiImageBatchUploader: React.FC<MultiImageBatchUploaderProps> = ({
  products: externalProducts,
  defaultOutputFormat = 'webp',
  defaultAutoWebpLossless = true,
  onToggleAutoWebpLossless,
  embedded = false,
  onAssignImages
}) => {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() =>
    productImageManagerService.applyOverridesToProductList(
      externalProducts && externalProducts.length > 0 ? externalProducts : MOCK_PRODUCTS
    )
  );
  const [items, setItems] = useState<QueuedBulkImageItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [dragOverCardProductId, setDragOverCardProductId] = useState<string | null>(null);
  const [autoWebpLossless, setAutoWebpLossless] = useState<boolean>(defaultAutoWebpLossless);
  const [outputFormat, setOutputFormat] = useState<OutputImageFormat>(
    defaultAutoWebpLossless ? 'webp' : defaultOutputFormat
  );
  const [productSearchFilter, setProductSearchFilter] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [previewGridFilterMode, setPreviewGridFilterMode] = useState<'ALL' | 'STAGED_ONLY' | 'UNSTAGED_ONLY'>('ALL');
  const [previewGridPage, setPreviewGridPage] = useState<number>(1);
  const previewGridPageSize = 12;

  const [queueViewMode, setQueueViewMode] = useState<'CONFIRMATION_GRID' | 'MAPPING_LIST'>('CONFIRMATION_GRID');
  const [bulkTargetProductId, setBulkTargetProductId] = useState<string>('');
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [selectedQueueIds, setSelectedQueueIds] = useState<Set<string>>(new Set());
  const [selectedPreviewProductIds, setSelectedPreviewProductIds] = useState<Set<string>>(new Set());
  const [editingQueueItemId, setEditingQueueItemId] = useState<string | null>(null);
  const [expandedFilterItemId, setExpandedFilterItemId] = useState<string | null>(null);
  const [bulkFilterState, setBulkFilterState] = useState<ImageEditFilters>({
    ...DEFAULT_IMAGE_EDIT_FILTERS
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0
  });
  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  useEffect(() => {
    if (externalProducts && externalProducts.length > 0) {
      setCatalogProducts(productImageManagerService.applyOverridesToProductList(externalProducts));
    } else {
      api
        .getProducts()
        .then(fetched => {
          if (fetched && fetched.length > 0) {
            setCatalogProducts(productImageManagerService.applyOverridesToProductList(fetched));
          }
        })
        .catch(() => {});
    }
  }, [externalProducts]);

  useEffect(() => {
    const handleUpdate = () => {
      setCatalogProducts(prev => productImageManagerService.applyOverridesToProductList(prev));
    };
    window.addEventListener('tradeheaven_product_images_updated', handleUpdate);
    return () => window.removeEventListener('tradeheaven_product_images_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!autoWebpLossless) {
      setOutputFormat(defaultOutputFormat);
    }
  }, [defaultOutputFormat, autoWebpLossless]);

  useEffect(() => {
    setAutoWebpLossless(defaultAutoWebpLossless);
    if (defaultAutoWebpLossless) {
      setOutputFormat('webp');
    }
  }, [defaultAutoWebpLossless]);

  const handleToggleAutoWebpLossless = (checked: boolean) => {
    setAutoWebpLossless(checked);
    if (checked) {
      setOutputFormat('webp');
    }
    if (onToggleAutoWebpLossless) {
      onToggleAutoWebpLossless(checked);
    }
  };

  useEffect(() => {
    if (!bulkTargetProductId && catalogProducts.length > 0) {
      setBulkTargetProductId(catalogProducts[0].id);
    }
  }, [catalogProducts, bulkTargetProductId]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalogProducts) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set).sort();
  }, [catalogProducts]);

  // Map of Product ID -> queued items targeting that Product ID
  const stagedItemsByProductId = useMemo(() => {
    const map = new Map<string, QueuedBulkImageItem[]>();
    for (const item of items) {
      if (!item.assignedProductId) continue;
      const existing = map.get(item.assignedProductId) || [];
      existing.push(item);
      map.set(item.assignedProductId, existing);
    }
    return map;
  }, [items]);

  const filteredProductsForMapping = useMemo(() => {
    const q = productSearchFilter.trim().toLowerCase();
    return catalogProducts.filter(p => {
      if (selectedCategoryFilter !== 'ALL' && p.category !== selectedCategoryFilter) return false;
      const hasStaged = stagedItemsByProductId.has(p.id) || stagedItemsByProductId.has('__ALL_PRODUCTS__');
      if (previewGridFilterMode === 'STAGED_ONLY' && !hasStaged) return false;
      if (previewGridFilterMode === 'UNSTAGED_ONLY' && hasStaged) return false;

      if (!q) return true;
      return (
        p.id?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.supplierName?.toLowerCase().includes(q)
      );
    });
  }, [catalogProducts, productSearchFilter, selectedCategoryFilter, previewGridFilterMode, stagedItemsByProductId]);

  useEffect(() => {
    setPreviewGridPage(1);
  }, [productSearchFilter, selectedCategoryFilter, previewGridFilterMode]);

  const totalPreviewPages = Math.max(1, Math.ceil(filteredProductsForMapping.length / previewGridPageSize));
  const paginatedPreviewProducts = useMemo(() => {
    const start = (previewGridPage - 1) * previewGridPageSize;
    return filteredProductsForMapping.slice(start, start + previewGridPageSize);
  }, [filteredProductsForMapping, previewGridPage, previewGridPageSize]);

  const productMapById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of catalogProducts) {
      map.set(p.id, p);
    }
    return map;
  }, [catalogProducts]);

  // Process incoming FileList or File[] from drag-and-drop or file picker
  // Optional forcedProductId allows dropping files directly onto a specific Product ID card in the preview grid!
  const ingestFiles = (fileList: FileList | File[], forcedProductId?: string) => {
    const rawFiles = Array.from(fileList).filter(
      f =>
        f.type.startsWith('image/') ||
        /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp|ico|tiff)$/i.test(f.name)
    );

    if (rawFiles.length === 0) {
      setBannerMessage({
        type: 'error',
        text: 'No valid image files detected. Please drop JPG, PNG, WEBP, AVIF, SVG, GIF, or BMP files.'
      });
      return;
    }

    let autoMatchedCount = 0;

    const newQueuedItems: QueuedBulkImageItem[] = rawFiles.map((file, idx) => {
      if (forcedProductId) {
        return {
          id: `bulk-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          rotationDegrees: 0,
          filters: { ...DEFAULT_IMAGE_EDIT_FILTERS },
          assignedProductId: forcedProductId,
          matchType: 'manual',
          placementMode: idx > 0 ? 'gallery' : 'primary',
          status: 'ready'
        };
      }

      const match = productImageManagerService.matchFileToProduct(file.name, catalogProducts);
      const hasMatch = Boolean(match.productId);
      if (hasMatch) autoMatchedCount++;

      const fallbackProd =
        filteredProductsForMapping[(items.length + idx) % Math.max(1, filteredProductsForMapping.length)];
      const assignedId = hasMatch ? match.productId : fallbackProd?.id || '';

      return {
        id: `bulk-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        rotationDegrees: 0,
        filters: { ...DEFAULT_IMAGE_EDIT_FILTERS },
        assignedProductId: assignedId,
        matchType: hasMatch ? match.confidence : assignedId ? 'sequential' : 'unmapped',
        placementMode: 'primary',
        status: assignedId ? 'ready' : 'unmapped'
      };
    });

    setItems(prev => [...prev, ...newQueuedItems]);

    if (forcedProductId) {
      const targetProd = productMapById.get(forcedProductId);
      setBannerMessage({
        type: 'info',
        text: `Staged ${rawFiles.length} image(s) for Product ID "${forcedProductId}" (${targetProd?.title || 'Product'}). Visually confirm the Before → After preview below and click "Confirm & Apply Bulk Update".`
      });
    } else {
      setBannerMessage({
        type: 'info',
        text:
          autoMatchedCount > 0
            ? `Staged ${rawFiles.length} image(s): ${autoMatchedCount} auto-matched to Product IDs by filename, ${rawFiles.length - autoMatchedCount} pre-mapped sequentially. Visually confirm existing vs. new product images in the Preview Grid below before applying.`
            : `Staged ${rawFiles.length} image(s) and pre-mapped them to existing Product IDs. Review the Visual Confirmation Preview Grid below before applying.`
      });
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      ingestFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      ingestFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Update a single item's mapped Product ID
  const handleUpdateItemProductId = (itemId: string, newProductId: string) => {
    const cleanId = newProductId.trim();
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              assignedProductId: cleanId,
              matchType: cleanId ? 'manual' : 'unmapped',
              status: cleanId ? 'ready' : 'unmapped'
            }
          : item
      )
    );
  };

  // Update a single item's placement mode (primary vs gallery)
  const handleUpdatePlacementMode = (itemId: string, mode: 'primary' | 'gallery') => {
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, placementMode: mode } : item))
    );
  };

  // Rotate a single staged image by 90-degree increments (-90, +90, 180) before bulk updating
  const handleRotateItem = (itemId: string, deltaDegrees: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        const nextDeg = (((item.rotationDegrees + deltaDegrees) % 360) + 360) % 360;
        return {
          ...item,
          rotationDegrees: nextDeg,
          status: item.assignedProductId ? 'ready' : 'unmapped'
        };
      })
    );
  };

  // Reset a single staged image rotation to 0°
  const handleResetItemRotation = (itemId: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              rotationDegrees: 0,
              status: item.assignedProductId ? 'ready' : 'unmapped'
            }
          : item
      )
    );
  };

  // Rotate selected (or all) staged images by 90-degree increments in bulk
  const handleBulkRotateQueueItems = (deltaDegrees: number) => {
    const hasSelection = selectedQueueIds.size > 0;
    const count = hasSelection ? selectedQueueIds.size : items.length;
    if (count === 0) return;

    setItems(prev =>
      prev.map(item => {
        if (hasSelection && !selectedQueueIds.has(item.id)) return item;
        const nextDeg = (((item.rotationDegrees + deltaDegrees) % 360) + 360) % 360;
        return {
          ...item,
          rotationDegrees: nextDeg,
          status: item.assignedProductId ? 'ready' : 'unmapped'
        };
      })
    );

    const dirLabel = deltaDegrees > 0 ? `+${deltaDegrees}° clockwise` : `${deltaDegrees}° counter-clockwise`;
    setBannerMessage({
      type: 'info',
      text: `Rotated ${count} ${hasSelection ? 'selected ' : ''}staged image(s) by ${dirLabel} before bulk update.`
    });
  };

  // Update filters (grayscale, sepia, brightness, contrast) for a single staged item
  const handleUpdateItemFilters = (itemId: string, partial: Partial<ImageEditFilters>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              filters: { ...item.filters, ...partial },
              status: item.assignedProductId ? 'ready' : 'unmapped'
            }
          : item
      )
    );
  };

  // Reset filters for a single staged item
  const handleResetItemFilters = (itemId: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              filters: { ...DEFAULT_IMAGE_EDIT_FILTERS },
              status: item.assignedProductId ? 'ready' : 'unmapped'
            }
          : item
      )
    );
  };

  // Apply filter updates to selected (or all) staged images in bulk
  const handleBulkUpdateQueueFilters = (
    partial: Partial<ImageEditFilters>,
    replaceAll: boolean = false
  ) => {
    const hasSelection = selectedQueueIds.size > 0;
    if (items.length === 0) return;

    const nextBulkFilters: ImageEditFilters = replaceAll
      ? { ...DEFAULT_IMAGE_EDIT_FILTERS, ...partial }
      : { ...bulkFilterState, ...partial };
    setBulkFilterState(nextBulkFilters);

    setItems(prev =>
      prev.map(item => {
        if (hasSelection && !selectedQueueIds.has(item.id)) return item;
        return {
          ...item,
          filters: replaceAll
            ? { ...DEFAULT_IMAGE_EDIT_FILTERS, ...partial }
            : { ...item.filters, ...partial },
          status: item.assignedProductId ? 'ready' : 'unmapped'
        };
      })
    );
  };

  // Re-run filename auto-matching across all queued items
  const handleAutoMatchByFilename = () => {
    let matchedCount = 0;
    setItems(prev =>
      prev.map(item => {
        const match = productImageManagerService.matchFileToProduct(item.file.name, catalogProducts);
        if (match.productId) {
          matchedCount++;
          return {
            ...item,
            assignedProductId: match.productId,
            matchType: match.confidence,
            status: 'ready'
          };
        }
        return item;
      })
    );
    setBannerMessage({
      type: matchedCount > 0 ? 'success' : 'info',
      text:
        matchedCount > 0
          ? `Auto-matched ${matchedCount} of ${items.length} image(s) to existing Product IDs based on filenames!`
          : `No exact Product ID or keyword matches found in filenames. Use "Sequential 1-to-1 Map" or select Product IDs manually.`
    });
  };

  // Map queued images sequentially 1-to-1 to filtered products
  const handleSequentialMapToProducts = () => {
    if (filteredProductsForMapping.length === 0) return;
    setItems(prev =>
      prev.map((item, index) => {
        const targetProd = filteredProductsForMapping[index % filteredProductsForMapping.length];
        return {
          ...item,
          assignedProductId: targetProd.id,
          matchType: 'sequential',
          status: 'ready'
        };
      })
    );
    setBannerMessage({
      type: 'success',
      text: `Mapped ${items.length} image(s) sequentially 1-to-1 across ${filteredProductsForMapping.length} listed product IDs!`
    });
  };

  // Assign all queued images to a single target Product ID (or ALL products)
  const handleAssignAllToTarget = () => {
    if (!bulkTargetProductId) return;
    setItems(prev =>
      prev.map((item, idx) => ({
        ...item,
        assignedProductId: bulkTargetProductId,
        matchType: 'manual',
        placementMode:
          bulkTargetProductId !== '__ALL_PRODUCTS__' && idx > 0 ? 'gallery' : 'primary',
        status: 'ready'
      }))
    );
    const prod = productMapById.get(bulkTargetProductId);
    setBannerMessage({
      type: 'info',
      text:
        bulkTargetProductId === '__ALL_PRODUCTS__'
          ? `Mapped all ${items.length} image(s) to apply across ALL listed products.`
          : `Mapped all ${items.length} image(s) to Product ID "${bulkTargetProductId}" (${prod?.title || 'Selected Product'}). First image is set as Primary and additional images append to Gallery.`
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => {
      const target = prev.find(i => i.id === itemId);
      if (target && target.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(i => i.id !== itemId);
    });
    setSelectedQueueIds(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  // Toggle selection for a queued item in Section 1 Preview Grid
  const toggleSelectQueueItem = (itemId: string) => {
    setSelectedQueueIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const toggleSelectAllQueueItems = () => {
    if (selectedQueueIds.size === items.length && items.length > 0) {
      setSelectedQueueIds(new Set());
    } else {
      setSelectedQueueIds(new Set(items.map(i => i.id)));
    }
  };

  // Delete Selected queued image associations in bulk
  const handleDeleteSelectedQueueItems = () => {
    if (selectedQueueIds.size === 0) return;
    const removedCount = selectedQueueIds.size;
    setItems(prev => {
      prev.forEach(item => {
        if (selectedQueueIds.has(item.id) && item.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return prev.filter(item => !selectedQueueIds.has(item.id));
    });
    setSelectedQueueIds(new Set());
    setBannerMessage({
      type: 'info',
      text: `Deleted ${removedCount} selected product image association(s) from the bulk queue.`
    });
  };

  // Toggle selection for a Product ID card in Section 2 Preview Grid
  const toggleSelectPreviewProduct = (productId: string) => {
    setSelectedPreviewProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAllPreviewProducts = () => {
    if (
      selectedPreviewProductIds.size === filteredProductsForMapping.length &&
      filteredProductsForMapping.length > 0
    ) {
      setSelectedPreviewProductIds(new Set());
    } else {
      setSelectedPreviewProductIds(new Set(filteredProductsForMapping.map(p => p.id)));
    }
  };

  // Bulk-remove incorrect product image associations (staged + saved overrides) for selected Product IDs in Preview Grid
  const handleDeleteSelectedPreviewProductAssociations = async () => {
    const idsToDelete = Array.from(selectedPreviewProductIds);
    if (idsToDelete.length === 0) return;

    setIsSaving(true);
    try {
      const idSet = new Set(idsToDelete);
      const titlesToDelete = catalogProducts
        .filter(p => idSet.has(p.id))
        .map(p => p.title)
        .filter(Boolean);

      // 1. Remove any staged items mapped to these Product IDs
      setItems(prev => {
        prev.forEach(item => {
          if (idSet.has(item.assignedProductId) && item.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
          }
        });
        return prev.filter(item => !idSet.has(item.assignedProductId));
      });

      // 2. Delete saved custom product image overrides for these Product IDs on client & server
      await productImageManagerService.deleteBulkProductImageAssociations(
        idsToDelete,
        titlesToDelete
      );

      setCatalogProducts(
        productImageManagerService.applyOverridesToProductList(
          externalProducts && externalProducts.length > 0 ? externalProducts : MOCK_PRODUCTS
        )
      );
      setSelectedPreviewProductIds(new Set());

      setBannerMessage({
        type: 'success',
        text: `Deleted product image associations for ${idsToDelete.length} selected Product ID(s) and restored their default catalog images.`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearQueue = () => {
    items.forEach(item => {
      if (item.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setItems([]);
    setSelectedQueueIds(new Set());
    setBannerMessage(null);
  };

  // Execute batch upload & Product ID assignment
  const handleUploadAndMapAll = async () => {
    const readyItems = items.filter(i => i.assignedProductId && i.status !== 'saved');
    if (readyItems.length === 0 || isSaving) {
      if (items.length > 0 && readyItems.length === 0) {
        setBannerMessage({
          type: 'error',
          text: 'All queued images are either already saved or missing a mapped Product ID.'
        });
      }
      return;
    }

    setIsSaving(true);
    setUploadProgress({ current: 0, total: readyItems.length });
    setBannerMessage(null);

    const completedAssignments: { productId: string; imageUrl: string }[] = [];
    const seenPrimaryForProduct = new Set<string>();

    try {
      let processedCount = 0;

      for (const item of readyItems) {
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, status: 'uploading', errorMessage: undefined } : i))
        );

        try {
          const effectiveFormat: OutputImageFormat = autoWebpLossless ? 'webp' : outputFormat;
          const effectiveQuality = autoWebpLossless ? 1.0 : 0.92;

          if (item.assignedProductId === '__ALL_PRODUCTS__') {
            const allIds = catalogProducts.map(p => p.id);
            const res = await productImageManagerService.uploadAndAssignImageFile(item.file, {
              targetFormat: effectiveFormat,
              quality: effectiveQuality,
              autoWebpLossless,
              rotationDegrees: item.rotationDegrees,
              filters: item.filters,
              applyToAll: true,
              productIds: allIds
            });
            completedAssignments.push({ productId: '__ALL_PRODUCTS__', imageUrl: res.url });
            setItems(prev =>
              prev.map(i =>
                i.id === item.id
                  ? {
                      ...i,
                      status: 'saved',
                      savedUrl: res.url,
                      compressedSizeBytes: res.sizeBytes,
                      losslessApplied: res.losslessCompression
                    }
                  : i
              )
            );
          } else {
            const shouldAppendToGallery =
              item.placementMode === 'gallery' || seenPrimaryForProduct.has(item.assignedProductId);

            const res = await productImageManagerService.uploadAndAssignImageFile(item.file, {
              targetFormat: effectiveFormat,
              quality: effectiveQuality,
              autoWebpLossless,
              rotationDegrees: item.rotationDegrees,
              filters: item.filters,
              productId: item.assignedProductId,
              appendToGallery: shouldAppendToGallery
            });

            seenPrimaryForProduct.add(item.assignedProductId);
            completedAssignments.push({ productId: item.assignedProductId, imageUrl: res.url });

            setItems(prev =>
              prev.map(i =>
                i.id === item.id
                  ? {
                      ...i,
                      status: 'saved',
                      savedUrl: res.url,
                      compressedSizeBytes: res.sizeBytes,
                      losslessApplied: res.losslessCompression
                    }
                  : i
              )
            );
          }
        } catch (itemErr: any) {
          setItems(prev =>
            prev.map(i =>
              i.id === item.id
                ? {
                    ...i,
                    status: 'error',
                    errorMessage: itemErr?.message || 'Upload failed'
                  }
                : i
            )
          );
        }

        processedCount += 1;
        setUploadProgress({ current: processedCount, total: readyItems.length });
      }

      // Refresh local catalog preview with updated overrides
      setCatalogProducts(prev => productImageManagerService.applyOverridesToProductList(prev));

      if (onAssignImages && completedAssignments.length > 0) {
        onAssignImages(completedAssignments);
      }

      const uniqueProductsUpdated = new Set(completedAssignments.map(a => a.productId)).size;
      const formatLabel = autoWebpLossless
        ? '.WEBP (Lossless Compression)'
        : `.${outputFormat === 'original' ? 'original' : outputFormat.toUpperCase()}`;
      setBannerMessage({
        type: 'success',
        text: `Confirmed & applied ${completedAssignments.length} bulk image update(s) across ${uniqueProductsUpdated} Product ID(s) in ${formatLabel} format before saving to the server!`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const mappedCount = items.filter(i => Boolean(i.assignedProductId)).length;
  const savedCount = items.filter(i => i.status === 'saved').length;
  const pendingUploadCount = items.filter(i => Boolean(i.assignedProductId) && i.status !== 'saved').length;
  const stagedProductIdsCount = stagedItemsByProductId.size;

  return (
    <div
      className={`${
        embedded
          ? 'space-y-6'
          : 'bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 md:p-8 space-y-6'
      }`}
    >
      {/* HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs tracking-wider uppercase">
            <Layers className="w-4 h-4" />
            <span>Bulk Drag &amp; Drop Image-to-Product-ID Mapper &amp; Visual Confirmation Grid</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Drag &amp; Drop Multiple Product Images &amp; Visually Confirm by Product ID
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-3xl">
            Drop multiple product photos at once (`JPG`, `PNG`, `WEBP`, `AVIF`, `SVG`, `GIF`, `BMP`), map them to existing Product IDs, and inspect the <strong className="text-slate-800">Existing Product Image vs. New Staged Image Preview Grid</strong> for visual confirmation before executing bulk updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Checkbox to automatically enable WebP conversion and lossless compression */}
          <label
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all ${
              autoWebpLossless
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/15'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
            title="Automatically convert all bulk-uploaded images to WebP with lossless compression (Quality 100%) before saving them to the server"
          >
            <input
              type="checkbox"
              checked={autoWebpLossless}
              onChange={e => handleToggleAutoWebpLossless(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold flex items-center gap-1.5">
                <span>Auto WebP + Lossless Compression</span>
                {autoWebpLossless && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">
                    Active
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Convert all images to lossless .WEBP before saving to server
              </span>
            </div>
          </label>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Format:</span>
            <select
              value={autoWebpLossless ? 'webp' : outputFormat}
              disabled={autoWebpLossless}
              onChange={e => setOutputFormat(e.target.value as OutputImageFormat)}
              className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer disabled:opacity-75"
            >
              <option value="webp">Auto-Convert to .WEBP {autoWebpLossless ? '(Lossless 100%)' : ''}</option>
              <option value="jpg">Auto-Convert to .JPG</option>
              <option value="png">Auto-Convert to .PNG</option>
              <option value="original">Keep Original Format</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Select Multiple Images</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </div>

      {/* INTERACTIVE DRAG-AND-DROP ZONE */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none ${
          isDraggingOver
            ? 'border-blue-600 bg-blue-50/90 ring-4 ring-blue-500/20 scale-[1.005]'
            : items.length > 0
              ? 'border-blue-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30 p-6'
              : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 p-8 sm:p-10'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div
            className={`rounded-2xl flex items-center justify-center transition-all mb-3 ${
              isDraggingOver
                ? 'w-16 h-16 bg-blue-600 text-white shadow-lg scale-110'
                : items.length > 0
                  ? 'w-11 h-11 bg-blue-100 text-blue-600'
                  : 'w-14 h-14 bg-blue-50 text-blue-600 border border-blue-200'
            }`}
          >
            <Upload className={items.length > 0 && !isDraggingOver ? 'w-5 h-5' : 'w-7 h-7'} />
          </div>

          <div className="text-sm sm:text-base font-black text-slate-900">
            {isDraggingOver
              ? 'Drop Product Images Here to Stage & Auto-Map to Product IDs!'
              : items.length > 0
                ? 'Drag & Drop More Product Images Here (or Click to Browse)'
                : 'Drag & Drop Multiple Product Images Here at Once'}
          </div>

          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Supports <strong className="text-slate-700">JPG, JPEG, PNG, WEBP, AVIF, SVG, GIF, BMP</strong>. Name files after Product IDs (e.g.,{' '}
            <span className="font-mono text-slate-700">{catalogProducts[0]?.id || 'prod-1'}.jpg</span>) for automatic ID matching, or drag files directly onto any card in the <strong className="text-slate-700">Existing Product Images &amp; IDs Preview Grid</strong> below.
          </p>
        </div>
      </div>

      {/* STATUS / FEEDBACK BANNER */}
      {bannerMessage && (
        <div
          className={`rounded-xl p-4 border flex items-center justify-between gap-3 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : bannerMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : bannerMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Wand2 className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UPLOAD PROGRESS BAR */}
      {isSaving && uploadProgress.total > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>
                Uploading, Converting &amp; Mapping Images to Product IDs ({uploadProgress.current} of{' '}
                {uploadProgress.total})...
              </span>
            </span>
            <span className="font-mono text-blue-400">
              {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* DATALIST FOR DIRECT PRODUCT ID TYPING / AUTOCOMPLETE */}
      <datalist id="existing-product-ids-datalist">
        <option value="__ALL_PRODUCTS__">Apply to ALL Listed Products</option>
        {catalogProducts.map(p => (
          <option key={p.id} value={p.id}>
            {p.title} ({p.category})
          </option>
        ))}
      </datalist>

      {/* =====================================================================
          SECTION 1: STAGED BULK UPDATE VISUAL CONFIRMATION PREVIEW GRID & MAPPING QUEUE
      ===================================================================== */}
      {items.length > 0 && (
        <div className="space-y-4">
          {/* BULK MAPPING & CONFIRMATION CONTROL BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Visual Confirmation Queue: {items.length} Image{items.length === 1 ? '' : 's'}</span>
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                  {mappedCount} Mapped to Product IDs
                </span>
                {savedCount > 0 && (
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    {savedCount} Confirmed &amp; Applied
                  </span>
                )}

                {/* View Mode Toggle: Visual Confirmation Grid vs Detailed List */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 ml-1">
                  <button
                    type="button"
                    onClick={() => setQueueViewMode('CONFIRMATION_GRID')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      queueViewMode === 'CONFIRMATION_GRID'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Before / After Preview Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueViewMode('MAPPING_LIST')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      queueViewMode === 'MAPPING_LIST'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Detailed Mapping Rows</span>
                  </button>
                </div>
              </div>

              {/* Primary Batch Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAllQueueItems}
                  disabled={isSaving}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {selectedQueueIds.size === items.length && items.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>
                    {selectedQueueIds.size > 0
                      ? `Selected (${selectedQueueIds.size})`
                      : 'Select All'}
                  </span>
                </button>

                {selectedQueueIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelectedQueueItems}
                    disabled={isSaving}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedQueueIds.size})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleBulkRotateQueueItems(-90)}
                  disabled={isSaving}
                  className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Rotate selected (or all) staged images 90° Counter-Clockwise before bulk update"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Rotate {selectedQueueIds.size > 0 ? `Selected (${selectedQueueIds.size})` : 'All'} -90°
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkRotateQueueItems(90)}
                  disabled={isSaving}
                  className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Rotate selected (or all) staged images 90° Clockwise before bulk update"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Rotate {selectedQueueIds.size > 0 ? `Selected (${selectedQueueIds.size})` : 'All'} +90°
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoMatchByFilename}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Match image filenames to existing Product IDs or product titles"
                >
                  <Wand2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Auto-Map by Filename</span>
                </button>

                <button
                  type="button"
                  onClick={handleSequentialMapToProducts}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Map dropped images 1-to-1 in sequential order to the filtered product IDs"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sequential 1-to-1 Map</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearQueue}
                  disabled={isSaving}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Queue</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving || pendingUploadCount === 0}
                  onClick={handleUploadAndMapAll}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileCheck2 className="w-4 h-4" />
                  )}
                  <span>
                    {isSaving
                      ? 'Uploading & Mapping...'
                      : pendingUploadCount > 0
                        ? `Confirm & Apply ${pendingUploadCount} Bulk Image Update${pendingUploadCount === 1 ? '' : 's'}`
                        : 'All Mapped Images Applied'}
                  </span>
                </button>
              </div>
            </div>

            {/* Bulk Target Assignment Row & WebP Lossless Checkbox */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 text-xs font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoWebpLossless}
                    onChange={e => handleToggleAutoWebpLossless(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>
                    Enable WebP Conversion &amp; Lossless Compression Before Saving to Server
                  </span>
                </label>
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-900">Visual Confirmation Check:</strong> Verify each target{' '}
                  <span className="font-mono font-bold text-slate-800">Product ID</span> and compare its{' '}
                  <span className="font-bold text-slate-700">Existing Image</span> against the{' '}
                  <span className="font-bold text-blue-600">New Staged Image</span> below before confirming.
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={bulkTargetProductId}
                  onChange={e => setBulkTargetProductId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 max-w-xs truncate"
                >
                  <option value="__ALL_PRODUCTS__">
                    🌐 Map All to ALL Listed Products ({catalogProducts.length})
                  </option>
                  {catalogProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.id}] {p.title.length > 36 ? p.title.slice(0, 36) + '...' : p.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignAllToTarget}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  Map All to Target
                </button>
              </div>
            </div>

            {/* Bulk Image Filter & Adjustment Bar (Grayscale, Sepia, Brightness, Contrast) */}
            <div className="mt-2 pt-3 border-t border-slate-100 bg-slate-50/80 rounded-xl p-3 space-y-2.5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-black text-slate-900">
                    Pre-Bulk Filter &amp; Color Adjustments ({selectedQueueIds.size > 0 ? `Applying to ${selectedQueueIds.size} Selected` : `Applying to All ${items.length} Staged Images`}):
                  </span>
                </div>

                {/* Quick Filter Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleBulkUpdateQueueFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS }, true)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      !hasActiveImageFilters(bulkFilterState)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Original (None)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleBulkUpdateQueueFilters(
                        {
                          grayscale: bulkFilterState.grayscale === 100 ? 0 : 100,
                          sepia: 0
                        },
                        false
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      bulkFilterState.grayscale === 100
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    Grayscale (B&amp;W)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleBulkUpdateQueueFilters(
                        {
                          sepia: bulkFilterState.sepia === 100 ? 0 : 100,
                          grayscale: 0
                        },
                        false
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      bulkFilterState.sepia === 100
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    Sepia Tone
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleBulkUpdateQueueFilters(
                        { grayscale: 0, sepia: 0, brightness: 115, contrast: 110 },
                        true
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      bulkFilterState.brightness === 115 && bulkFilterState.contrast === 110
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    Studio Bright (+15%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleBulkUpdateQueueFilters(
                        { grayscale: 0, sepia: 0, brightness: 105, contrast: 125 },
                        true
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      bulkFilterState.contrast === 125
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    High Contrast (+25%)
                  </button>
                </div>
              </div>

              {/* 4 Live Adjustment Sliders: Grayscale, Sepia, Brightness, Contrast */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>Grayscale</span>
                    <span className="font-mono text-blue-600">{bulkFilterState.grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={bulkFilterState.grayscale}
                    onChange={e =>
                      handleBulkUpdateQueueFilters({ grayscale: Number(e.target.value) })
                    }
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>Sepia</span>
                    <span className="font-mono text-amber-600">{bulkFilterState.sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={bulkFilterState.sepia}
                    onChange={e =>
                      handleBulkUpdateQueueFilters({ sepia: Number(e.target.value) })
                    }
                    className="w-full accent-amber-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono text-emerald-600">{bulkFilterState.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={2}
                    value={bulkFilterState.brightness}
                    onChange={e =>
                      handleBulkUpdateQueueFilters({ brightness: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span>Contrast</span>
                    <span className="font-mono text-indigo-600">{bulkFilterState.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={2}
                    value={bulkFilterState.contrast}
                    onChange={e =>
                      handleBulkUpdateQueueFilters({ contrast: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* VIEW 1A: BEFORE / AFTER VISUAL CONFIRMATION PREVIEW GRID */}
          {queueViewMode === 'CONFIRMATION_GRID' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((item, index) => {
                const mappedProduct = productMapById.get(item.assignedProductId);
                const isAllProducts = item.assignedProductId === '__ALL_PRODUCTS__';
                const isQueueSelected = selectedQueueIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between transition-all ${
                      isQueueSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : item.status === 'saved'
                          ? 'border-emerald-400 ring-2 ring-emerald-500/15'
                          : item.assignedProductId
                            ? 'border-slate-200 hover:border-blue-400'
                            : 'border-amber-300 bg-amber-50/20'
                    }`}
                  >
                    <div>
                      {/* Card Header: Checkbox + Product ID Badge + Match Badge + Remove Button */}
                      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isQueueSelected}
                            onChange={() => toggleSelectQueueItem(item.id)}
                            className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                            title="Select image association for bulk deletion"
                          />
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[11px] font-black shrink-0">
                            {isAllProducts
                              ? 'ALL IDs'
                              : item.assignedProductId
                                ? `ID: ${item.assignedProductId}`
                                : 'UNMAPPED ID'}
                          </span>
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {isAllProducts
                              ? `All ${catalogProducts.length} Products`
                              : mappedProduct
                                ? mappedProduct.title
                                : item.assignedProductId
                                  ? `Custom ID (${item.assignedProductId})`
                                  : 'Select Product ID below'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isSaving}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                          title="Delete this image association"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Side-by-Side Visual Comparison: EXISTING PRODUCT IMAGE vs NEW STAGED IMAGE */}
                      <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-50 border-b border-slate-200">
                        {/* Left: Existing Product Image */}
                        <div className="p-3 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            <span>Existing Image</span>
                            {mappedProduct && (
                              <span className="font-mono text-slate-700">{mappedProduct.id}</span>
                            )}
                          </div>
                          <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                            {isAllProducts ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-2 text-center">
                                <Layers className="w-6 h-6 text-blue-400 mb-1" />
                                <span className="text-[11px] font-bold">
                                  All {catalogProducts.length} Catalog Images
                                </span>
                              </div>
                            ) : mappedProduct ? (
                              <SafeImage
                                src={mappedProduct.images?.[0]}
                                alt={mappedProduct.title}
                                productId={mappedProduct.id}
                                productTitle={mappedProduct.title}
                                category={mappedProduct.category}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-[11px] font-semibold">
                                No Product ID Selected
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: New Staged Bulk Image */}
                        <div className="p-3 space-y-1.5 bg-blue-50/30">
                          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                            <span>New Bulk Image</span>
                            <span className="font-mono flex items-center gap-1">
                              {autoWebpLossless ? (
                                <span className="text-emerald-700 font-black">.WEBP (Lossless)</span>
                              ) : (
                                `.${outputFormat === 'original' ? item.file.name.split('.').pop() : outputFormat}`
                              )}
                            </span>
                          </div>
                          <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-900 border-2 border-blue-500 shadow-2xs flex items-center justify-center">
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="w-full h-full object-cover transition-all duration-200"
                              style={{
                                transform: `rotate(${item.rotationDegrees}deg)`,
                                filter: buildCssFilterString(item.filters)
                              }}
                            />
                            <span className="absolute top-1.5 left-1.5 bg-slate-900/85 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span>#{index + 1}</span>
                              {item.rotationDegrees !== 0 && (
                                <span className="text-amber-300 font-black">· {item.rotationDegrees}°</span>
                              )}
                              {hasActiveImageFilters(item.filters) && (
                                <span className="text-emerald-300 font-black">· Filtered</span>
                              )}
                            </span>
                            <span className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                              {item.placementMode === 'primary' ? 'Primary' : '+ Gallery'}
                            </span>
                            {item.status === 'saved' && (
                              <div className="absolute inset-0 bg-emerald-950/65 flex flex-col items-center justify-center text-white">
                                <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-1" />
                                <span className="text-[10px] font-black uppercase">Applied</span>
                              </div>
                            )}
                          </div>

                          {/* 90-Degree Increment Rotation & Basic Filter Toolbar */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleRotateItem(item.id, -90)}
                                  disabled={isSaving}
                                  className="px-2 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                  title="Rotate 90° Counter-Clockwise (-90°)"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>-90°</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRotateItem(item.id, 90)}
                                  disabled={isSaving}
                                  className="px-2 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-800 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                                  title="Rotate 90° Clockwise (+90°)"
                                >
                                  <RotateCw className="w-3 h-3" />
                                  <span>+90°</span>
                                </button>
                                {item.rotationDegrees !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetItemRotation(item.id)}
                                    disabled={isSaving}
                                    className="px-1.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-colors cursor-pointer"
                                    title="Reset rotation to 0°"
                                  >
                                    0°
                                  </button>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => setEditingQueueItemId(item.id)}
                                disabled={isSaving}
                                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Open Image Studio (90° Rotation, Grayscale, Sepia, Brightness/Contrast)"
                              >
                                <Sliders className="w-3 h-3 text-blue-400" />
                                <span>Edit &amp; Filters</span>
                              </button>
                            </div>

                            {/* Quick Per-Card Filter Toggles (Grayscale, Sepia, Brightness/Contrast Sliders) */}
                            <div className="flex flex-wrap items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateItemFilters(item.id, {
                                    grayscale: item.filters.grayscale === 100 ? 0 : 100,
                                    sepia: 0
                                  })
                                }
                                disabled={isSaving}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                                  item.filters.grayscale > 0
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                                }`}
                                title="Toggle Grayscale Filter"
                              >
                                B&amp;W {item.filters.grayscale > 0 ? `${item.filters.grayscale}%` : ''}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateItemFilters(item.id, {
                                    sepia: item.filters.sepia === 100 ? 0 : 100,
                                    grayscale: 0
                                  })
                                }
                                disabled={isSaving}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                                  item.filters.sepia > 0
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400'
                                }`}
                                title="Toggle Sepia Filter"
                              >
                                Sepia {item.filters.sepia > 0 ? `${item.filters.sepia}%` : ''}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedFilterItemId(prev =>
                                    prev === item.id ? null : item.id
                                  )
                                }
                                disabled={isSaving}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-0.5 transition-colors cursor-pointer ${
                                  expandedFilterItemId === item.id ||
                                  item.filters.brightness !== 100 ||
                                  item.filters.contrast !== 100
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                                }`}
                                title="Adjust Brightness & Contrast"
                              >
                                <Sun className="w-2.5 h-2.5" />
                                <span>B/C</span>
                              </button>
                              {hasActiveImageFilters(item.filters) && (
                                <button
                                  type="button"
                                  onClick={() => handleResetItemFilters(item.id)}
                                  disabled={isSaving}
                                  className="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-[9px] font-bold transition-colors cursor-pointer"
                                  title="Reset image filters"
                                >
                                  Reset
                                </button>
                              )}
                            </div>

                            {/* Inline Expandable Brightness / Contrast / Grayscale / Sepia Sliders */}
                            {expandedFilterItemId === item.id && (
                              <div className="bg-white border border-blue-200 rounded-xl p-2 space-y-1.5 shadow-2xs text-[10px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-600 w-16">Brightness</span>
                                  <input
                                    type="range"
                                    min={50}
                                    max={150}
                                    value={item.filters.brightness}
                                    onChange={e =>
                                      handleUpdateItemFilters(item.id, {
                                        brightness: Number(e.target.value)
                                      })
                                    }
                                    className="flex-1 accent-blue-600 cursor-pointer h-1"
                                  />
                                  <span className="font-mono font-bold text-slate-800 w-8 text-right">
                                    {item.filters.brightness}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-600 w-16">Contrast</span>
                                  <input
                                    type="range"
                                    min={50}
                                    max={150}
                                    value={item.filters.contrast}
                                    onChange={e =>
                                      handleUpdateItemFilters(item.id, {
                                        contrast: Number(e.target.value)
                                      })
                                    }
                                    className="flex-1 accent-indigo-600 cursor-pointer h-1"
                                  />
                                  <span className="font-mono font-bold text-slate-800 w-8 text-right">
                                    {item.filters.contrast}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-600 w-16">Grayscale</span>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={item.filters.grayscale}
                                    onChange={e =>
                                      handleUpdateItemFilters(item.id, {
                                        grayscale: Number(e.target.value)
                                      })
                                    }
                                    className="flex-1 accent-slate-700 cursor-pointer h-1"
                                  />
                                  <span className="font-mono font-bold text-slate-800 w-8 text-right">
                                    {item.filters.grayscale}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-600 w-16">Sepia</span>
                                  <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={item.filters.sepia}
                                    onChange={e =>
                                      handleUpdateItemFilters(item.id, {
                                        sepia: Number(e.target.value)
                                      })
                                    }
                                    className="flex-1 accent-amber-600 cursor-pointer h-1"
                                  />
                                  <span className="font-mono font-bold text-slate-800 w-8 text-right">
                                    {item.filters.sepia}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: File name & Product ID Mapping Selector */}
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-slate-700 truncate" title={item.file.name}>
                          File: {item.file.name}
                        </span>
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdatePlacementMode(item.id, 'primary')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              item.placementMode === 'primary'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500'
                            }`}
                          >
                            Primary
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdatePlacementMode(item.id, 'gallery')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              item.placementMode === 'gallery'
                                ? 'bg-white text-slate-900 shadow-2xs'
                                : 'text-slate-500'
                            }`}
                          >
                            + Gallery
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Confirm or Change Target Product ID:
                        </label>
                        <select
                          value={item.assignedProductId}
                          onChange={e => handleUpdateItemProductId(item.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                        >
                          <option value="">-- Select Product ID --</option>
                          <option value="__ALL_PRODUCTS__">
                            🌐 Apply to ALL Listed Products ({catalogProducts.length})
                          </option>
                          {catalogProducts.map(p => (
                            <option key={p.id} value={p.id}>
                              ID: {p.id} — {p.title.length > 38 ? p.title.slice(0, 38) + '...' : p.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 1B: DETAILED MAPPING LIST ROWS */
            <div className="space-y-3">
              {items.map((item, index) => {
                const mappedProduct = productMapById.get(item.assignedProductId);
                const isAllProducts = item.assignedProductId === '__ALL_PRODUCTS__';
                const isQueueSelected = selectedQueueIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-4 transition-all shadow-2xs ${
                      isQueueSelected
                        ? 'border-blue-600 ring-2 ring-blue-500/20'
                        : item.status === 'saved'
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : item.status === 'error'
                            ? 'border-rose-300 bg-rose-50/20'
                            : item.assignedProductId
                              ? 'border-slate-200 hover:border-blue-300'
                              : 'border-amber-300 bg-amber-50/20'
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* LEFT 4 COLS: CHECKBOX + DROPPED IMAGE PREVIEW & FILE INFO */}
                      <div className="lg:col-span-4 flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isQueueSelected}
                          onChange={() => toggleSelectQueueItem(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                          title="Select image association"
                        />
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0">
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="w-full h-full object-cover transition-all duration-200"
                            style={{
                              transform: `rotate(${item.rotationDegrees}deg)`,
                              filter: buildCssFilterString(item.filters)
                            }}
                          />
                          <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                            #{index + 1}
                          </span>
                          {item.rotationDegrees !== 0 && (
                            <span className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 text-[9px] font-mono font-black px-1 py-0.5 rounded">
                              {item.rotationDegrees}°
                            </span>
                          )}
                          {item.status === 'saved' && (
                            <div className="absolute inset-0 bg-emerald-950/60 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div
                            className="text-xs font-black text-slate-900 truncate"
                            title={item.file.name}
                          >
                            {item.file.name}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                            <span>{(item.file.size / 1024).toFixed(1)} KB</span>
                            <span>·</span>
                            <span className="text-blue-600 font-bold uppercase">
                              → .{outputFormat === 'original' ? item.file.name.split('.').pop() : outputFormat}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleRotateItem(item.id, -90)}
                              disabled={isSaving}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Rotate -90° Counter-Clockwise"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>-90°</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRotateItem(item.id, 90)}
                              disabled={isSaving}
                              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Rotate +90° Clockwise"
                            >
                              <RotateCw className="w-2.5 h-2.5" />
                              <span>+90°</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemFilters(item.id, {
                                  grayscale: item.filters.grayscale === 100 ? 0 : 100,
                                  sepia: 0
                                })
                              }
                              disabled={isSaving}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                item.filters.grayscale > 0
                                  ? 'bg-slate-800 text-white border-slate-800'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              B&amp;W
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateItemFilters(item.id, {
                                  sepia: item.filters.sepia === 100 ? 0 : 100,
                                  grayscale: 0
                                })
                              }
                              disabled={isSaving}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                item.filters.sepia > 0
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              Sepia
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQueueItemId(item.id)}
                              disabled={isSaving}
                              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Open Image Rotation & Filter Studio"
                            >
                              <Sliders className="w-2.5 h-2.5 text-blue-400" />
                              <span>Edit &amp; Filters</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* CENTER 4 COLS: PRODUCT ID MAPPING CONTROLS */}
                      <div className="lg:col-span-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                            <Package className="w-3 h-3 text-blue-600" />
                            <span>Map to Existing Product ID:</span>
                          </label>
                          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleUpdatePlacementMode(item.id, 'primary')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                                item.placementMode === 'primary'
                                  ? 'bg-white text-slate-900 shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Primary Image
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePlacementMode(item.id, 'gallery')}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                                item.placementMode === 'gallery'
                                  ? 'bg-white text-slate-900 shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              + Gallery
                            </button>
                          </div>
                        </div>

                        <select
                          value={item.assignedProductId}
                          onChange={e => handleUpdateItemProductId(item.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                        >
                          <option value="">-- Select Product ID --</option>
                          <option value="__ALL_PRODUCTS__">
                            🌐 Apply to ALL Listed Products ({catalogProducts.length})
                          </option>
                          {catalogProducts.map(p => (
                            <option key={p.id} value={p.id}>
                              ID: {p.id} — {p.title.length > 44 ? p.title.slice(0, 44) + '...' : p.title}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                            Or Type ID:
                          </span>
                          <input
                            type="text"
                            list="existing-product-ids-datalist"
                            value={item.assignedProductId}
                            onChange={e => handleUpdateItemProductId(item.id, e.target.value)}
                            placeholder="e.g. prod-1, bamboo-1..."
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      {/* RIGHT 4 COLS: MAPPED TARGET PRODUCT LIVE PREVIEW & ACTIONS */}
                      <div className="lg:col-span-4 flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                        {isAllProducts ? (
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
                              ALL
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-slate-900">
                                All {catalogProducts.length.toLocaleString()} Listed Products
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Global catalog image override
                              </div>
                            </div>
                          </div>
                        ) : mappedProduct ? (
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                              <SafeImage
                                src={mappedProduct.images?.[0]}
                                alt={mappedProduct.title}
                                productId={mappedProduct.id}
                                productTitle={mappedProduct.title}
                                category={mappedProduct.category}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold">
                                  ID: {mappedProduct.id}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate">
                                  {mappedProduct.category}
                                </span>
                              </div>
                              <div
                                className="text-xs font-bold text-slate-900 truncate mt-0.5"
                                title={mappedProduct.title}
                              >
                                {mappedProduct.title}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-amber-700 font-semibold py-2 px-1">
                            No Product ID mapped yet
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isSaving}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          title="Remove from upload queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SECTION 2: EXISTING PRODUCT IMAGES & PRODUCT IDs VISUAL PREVIEW GRID
          (Displays existing product images alongside their Product ID for visual confirmation before bulk updates)
      ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Eye className="w-4 h-4" />
              <span>Visual Confirmation Reference Grid</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Existing Product Images &amp; Product IDs Preview Grid ({filteredProductsForMapping.length})
            </h3>
            <p className="text-xs text-slate-500">
              Visually verify existing product images alongside their exact <strong className="text-slate-800">Product ID</strong> before executing bulk updates. You can also drag and drop images directly onto any Product ID card below to stage a replacement.
            </p>
          </div>

          {/* Search, Category & Staged Status Filters for the Preview Grid */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearchFilter}
                onChange={e => setProductSearchFilter(e.target.value)}
                placeholder="Search Product ID or Title..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Categories ({catalogProducts.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={previewGridFilterMode}
              onChange={e => setPreviewGridFilterMode(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Product IDs ({catalogProducts.length})</option>
              <option value="STAGED_ONLY">Staged for Bulk Update ({stagedProductIdsCount})</option>
              <option value="UNSTAGED_ONLY">Unstaged Only</option>
            </select>
          </div>
        </div>

        {/* BULK SELECTION & 'DELETE SELECTED' ACTION BAR FOR PREVIEW GRID */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={toggleSelectAllPreviewProducts}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {selectedPreviewProductIds.size === filteredProductsForMapping.length &&
              filteredProductsForMapping.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedPreviewProductIds.size > 0
                  ? `Selected ${selectedPreviewProductIds.size} Product ID(s)`
                  : `Select All in Preview Grid (${filteredProductsForMapping.length})`}
              </span>
            </button>

            {selectedPreviewProductIds.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPreviewProductIds(new Set())}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={selectedPreviewProductIds.size === 0 || isSaving}
              onClick={handleDeleteSelectedPreviewProductAssociations}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Bulk-remove custom/staged product image associations for all selected Product IDs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                Delete Selected ({selectedPreviewProductIds.size})
              </span>
            </button>
          </div>
        </div>

        {/* PREVIEW GRID OF EXISTING PRODUCT IMAGES ALONGSIDE PRODUCT ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedPreviewProducts.map(product => {
            const stagedForThisProduct =
              stagedItemsByProductId.get(product.id) ||
              stagedItemsByProductId.get('__ALL_PRODUCTS__') ||
              [];
            const hasStagedUpdate = stagedForThisProduct.length > 0;
            const latestStagedItem = stagedForThisProduct[0];
            const isCardDragOver = dragOverCardProductId === product.id;
            const isPreviewCardSelected = selectedPreviewProductIds.has(product.id);
            const hasSavedOverride = Boolean(
              productImageManagerService.getState().overrides[product.id]
            );
            const currentPrimary = product.images?.[0] || '';

            return (
              <div
                key={product.id}
                onDragOver={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragOverCardProductId !== product.id) setDragOverCardProductId(product.id);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (dragOverCardProductId === product.id) setDragOverCardProductId(null);
                }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCardProductId(null);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    ingestFiles(e.dataTransfer.files, product.id);
                  }
                }}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all shadow-2xs ${
                  isCardDragOver
                    ? 'border-blue-600 ring-4 ring-blue-500/25 bg-blue-50/40'
                    : isPreviewCardSelected
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/5'
                      : hasStagedUpdate
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  {/* Top Bar: Checkbox + Prominent Product ID + Copy ID Button */}
                  <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPreviewCardSelected}
                        onChange={() => toggleSelectPreviewProduct(product.id)}
                        className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        ID:
                      </span>
                      <span
                        className="font-mono text-xs font-black text-amber-300 truncate"
                        title={product.id}
                      >
                        {product.id}
                      </span>
                    </label>

                    <div className="flex items-center gap-1 shrink-0">
                      {(hasStagedUpdate || hasSavedOverride) && (
                        <button
                          type="button"
                          onClick={async () => {
                            // Remove staged items or saved override for this single Product ID
                            setItems(prev => prev.filter(i => i.assignedProductId !== product.id));
                            await productImageManagerService.deleteBulkProductImageAssociations(
                              [product.id],
                              [product.title]
                            );
                            setCatalogProducts(
                              productImageManagerService.applyOverridesToProductList(
                                externalProducts && externalProducts.length > 0
                                  ? externalProducts
                                  : MOCK_PRODUCTS
                              )
                            );
                            setBannerMessage({
                              type: 'info',
                              text: `Removed image association for Product ID "${product.id}".`
                            });
                          }}
                          className="p-1 rounded bg-rose-950/80 hover:bg-rose-800 text-rose-300 cursor-pointer"
                          title="Delete image association for this Product ID"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(product.id);
                          setCopiedProductId(product.id);
                          setTimeout(() => setCopiedProductId(null), 1800);
                        }}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        title="Copy Product ID"
                      >
                        {copiedProductId === product.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Image Visual Display: Existing Image (and Staged New Image split comparison if staged!) */}
                  {hasStagedUpdate && latestStagedItem ? (
                    <div className="grid grid-cols-2 divide-x divide-slate-200 bg-slate-100 h-36">
                      <div className="relative h-full overflow-hidden">
                        <SafeImage
                          src={currentPrimary}
                          alt={product.title}
                          productId={product.id}
                          productTitle={product.title}
                          category={product.category}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 bg-slate-900/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Existing
                        </span>
                      </div>
                      <div className="relative h-full overflow-hidden bg-slate-900 group/staged">
                        <img
                          src={latestStagedItem.previewUrl}
                          alt={latestStagedItem.file.name}
                          className="w-full h-full object-cover transition-all duration-200"
                          style={{
                            transform: `rotate(${latestStagedItem.rotationDegrees}deg)`,
                            filter: buildCssFilterString(latestStagedItem.filters)
                          }}
                        />
                        {/* Inline 90° Rotation & Filter Studio Buttons on Staged Preview Card */}
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleRotateItem(latestStagedItem.id, -90);
                            }}
                            className="p-1 rounded bg-slate-900/85 hover:bg-blue-600 text-white shadow-xs cursor-pointer"
                            title="Rotate Staged Image -90°"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleRotateItem(latestStagedItem.id, 90);
                            }}
                            className="p-1 rounded bg-slate-900/85 hover:bg-blue-600 text-white shadow-xs cursor-pointer"
                            title="Rotate Staged Image +90°"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setEditingQueueItemId(latestStagedItem.id);
                            }}
                            className="p-1 rounded bg-slate-900/85 hover:bg-emerald-600 text-white shadow-xs cursor-pointer"
                            title="Open Filter & Rotation Studio (Grayscale, Sepia, Brightness/Contrast)"
                          >
                            <Sliders className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Staged {latestStagedItem.rotationDegrees !== 0 ? `(${latestStagedItem.rotationDegrees}°)` : hasActiveImageFilters(latestStagedItem.filters) ? '(Filtered)' : 'New'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-36 w-full bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={currentPrimary}
                        alt={product.title}
                        productId={product.id}
                        productTitle={product.title}
                        category={product.category}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Existing Image
                      </span>
                      <span className="absolute top-2 right-2 bg-white/90 text-slate-900 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {productImageManagerService.detectFormatFromUrl(currentPrimary)}
                      </span>
                    </div>
                  )}

                  {/* Product Title & Category Info */}
                  <div className="p-3 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                      {product.category}
                    </div>
                    <h4
                      className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug"
                      title={product.title}
                    >
                      {product.title}
                    </h4>
                  </div>
                </div>

                {/* Card Footer: Stage Image for this Product ID */}
                <div className="p-3 pt-0">
                  <label
                    className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      hasStagedUpdate
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {hasStagedUpdate
                        ? `Staged (${stagedForThisProduct.length}) · Add/Change`
                        : `Stage Image for ${product.id}`}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files.length > 0) {
                          ingestFiles(e.target.files, product.id);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION FOR EXISTING PRODUCT PREVIEW GRID */}
        {totalPreviewPages > 1 && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Showing{' '}
              <strong className="text-slate-800">
                {(previewGridPage - 1) * previewGridPageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(previewGridPage * previewGridPageSize, filteredProductsForMapping.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{filteredProductsForMapping.length}</strong>{' '}
              Product IDs
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={previewGridPage <= 1}
                onClick={() => setPreviewGridPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2.5 py-1.5 text-xs font-bold text-slate-800">
                Page {previewGridPage} of {totalPreviewPages}
              </span>
              <button
                type="button"
                disabled={previewGridPage >= totalPreviewPages}
                onClick={() => setPreviewGridPage(p => Math.min(totalPreviewPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* IMAGE ROTATION & FILTER EDITING OVERLAY MODAL FOR STAGED QUEUE ITEMS */}
      {editingQueueItemId && (() => {
        const targetItem = items.find(i => i.id === editingQueueItemId);
        if (!targetItem) return null;
        return (
          <ImageEditingOverlay
            imageSrc={targetItem.previewUrl}
            imageName={targetItem.file.name}
            initialRotation={targetItem.rotationDegrees}
            initialFilters={targetItem.filters}
            onClose={() => setEditingQueueItemId(null)}
            onSave={(editedDataUrl, finalRotationDegrees, appliedFilters) => {
              const updatedFile = productImageManagerService.dataUrlToFile(
                editedDataUrl,
                targetItem.file.name
              );
              setItems(prev =>
                prev.map(i => {
                  if (i.id !== targetItem.id) return i;
                  if (i.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(i.previewUrl);
                  }
                  return {
                    ...i,
                    file: updatedFile,
                    previewUrl: editedDataUrl,
                    rotationDegrees: 0,
                    filters: { ...DEFAULT_IMAGE_EDIT_FILTERS },
                    status: i.assignedProductId ? 'ready' : 'unmapped'
                  };
                })
              );
              setEditingQueueItemId(null);
              const filterSummary =
                appliedFilters && hasActiveImageFilters(appliedFilters)
                  ? ` + filters (Grayscale ${appliedFilters.grayscale}%, Sepia ${appliedFilters.sepia}%, Brightness ${appliedFilters.brightness}%, Contrast ${appliedFilters.contrast}%)`
                  : '';
              setBannerMessage({
                type: 'info',
                text: `Applied ${finalRotationDegrees}° rotation${filterSummary} to "${targetItem.file.name}". Ready for bulk update!`
              });
            }}
          />
        );
      })()}
    </div>
  );
};
