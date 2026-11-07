import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product } from '../../types';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { api } from '../../services/apiService';
import {
  productImageManagerService,
  OutputImageFormat,
  MediaLibraryItem,
  ProductImageSystemState,
  ImageEditFilters,
  DEFAULT_IMAGE_EDIT_FILTERS,
  buildCssFilterString,
  hasActiveImageFilters
} from '../../services/productImageManagerService';
import { SafeImage } from '../common/SafeImage';
import { ImageEditingOverlay } from './ImageEditingOverlay';
import { MultiImageBatchUploader } from './MultiImageBatchUploader';
import { autoSeoEngine, AutoSeoRecord } from '../../services/autoSeoEngine';
import {
  Image as ImageIcon,
  Upload,
  Search,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Crop,
  Layers,
  Globe,
  FolderOpen,
  CheckSquare,
  Square,
  Plus,
  X,
  ExternalLink,
  Copy,
  Check,
  SlidersHorizontal,
  Grid,
  List,
  RotateCcw,
  RotateCw,
  FileImage,
  ArrowRight,
  Sun,
  Edit,
  AlertTriangle
} from 'lucide-react';

export interface DeleteImageConfirmationState {
  mode: 'SINGLE_PRODUCT' | 'FORM_GALLERY_IMAGE' | 'BULK_SELECTED';
  product?: Product;
  imageUrl?: string;
  imageIndex?: number;
  targetIds?: string[];
}

interface DedicatedProductImageSystemProps {
  products?: Product[];
  onProductsUpdated?: () => void;
}

export const DedicatedProductImageSystem: React.FC<DedicatedProductImageSystemProps> = ({
  products: externalProducts,
  onProductsUpdated
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>(() =>
    productImageManagerService.applyOverridesToProductList(
      externalProducts && externalProducts.length > 0 ? externalProducts : MOCK_PRODUCTS
    )
  );
  const [systemState, setSystemState] = useState<ProductImageSystemState>(() =>
    productImageManagerService.getState()
  );
  const [activeSubTab, setActiveSubTab] = useState<'ALL_PRODUCTS' | 'BULK_DRAG_DROP_MAPPER' | 'BULK_GLOBAL' | 'BY_EXISTING_IMAGE' | 'MEDIA_LIBRARY' | 'AUTO_SEO_ENGINE'>('ALL_PRODUCTS');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [seoRecords, setSeoRecords] = useState<AutoSeoRecord[]>(() => autoSeoEngine.getAllSeoRecords());
  const [seoFilterType, setSeoFilterType] = useState<'ALL' | 'product' | 'image' | 'article'>('ALL');
  const [seoSearchTerm, setSeoSearchTerm] = useState('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CUSTOMIZED' | 'DEFAULT'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Format conversion settings
  const [autoWebpLossless, setAutoWebpLossless] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<OutputImageFormat>('webp');
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);

  const handleToggleAutoWebpLossless = (checked: boolean) => {
    setAutoWebpLossless(checked);
    if (checked) {
      setOutputFormat('webp');
    }
  };

  // Selection states for bulk operations
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Active modals / overlays
  const [activeProductForModal, setActiveProductForModal] = useState<Product | null>(null);
  const [croppingTarget, setCroppingTarget] = useState<{ product: Product; imageUrl: string } | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<DeleteImageConfirmationState | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
    onUndo?: () => Promise<void> | void;
  } | null>(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState<number>(5);
  const [isUndoing, setIsUndoing] = useState<boolean>(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isBulkPlaceholderModalOpen, setIsBulkPlaceholderModalOpen] = useState<boolean>(false);

  // Bulk / Global tab states
  const [bulkTargetScope, setBulkTargetScope] = useState<'ALL_PRODUCTS' | 'CATEGORY' | 'SELECTED'>('ALL_PRODUCTS');
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkCustomUrl, setBulkCustomUrl] = useState<string>('');
  const [stagedBulkFile, setStagedBulkFile] = useState<File | null>(null);
  const [stagedBulkPreviewUrl, setStagedBulkPreviewUrl] = useState<string>('');
  const [stagedBulkRotation, setStagedBulkRotation] = useState<number>(0);
  const [stagedBulkFilters, setStagedBulkFilters] = useState<ImageEditFilters>({
    ...DEFAULT_IMAGE_EDIT_FILTERS
  });
  const [isEditingStagedBulkImage, setIsEditingStagedBulkImage] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const mediaLibraryInputRef = useRef<HTMLInputElement>(null);

  const clearToastTimers = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    if (undoIntervalRef.current) {
      clearInterval(undoIntervalRef.current);
      undoIntervalRef.current = null;
    }
  };

  const showToast = (
    type: 'success' | 'error',
    message: string,
    options?: { onUndo?: () => Promise<void> | void; durationMs?: number }
  ) => {
    clearToastTimers();
    const duration = options?.onUndo ? (options.durationMs ?? 5000) : (options?.durationMs ?? 4500);
    setToast({ type, message, onUndo: options?.onUndo });

    if (options?.onUndo) {
      const totalSec = Math.ceil(duration / 1000);
      setUndoSecondsLeft(totalSec);
      const startedAt = Date.now();
      undoIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(1, Math.ceil((duration - elapsed) / 1000));
        setUndoSecondsLeft(remaining);
      }, 250);
    }

    toastTimerRef.current = setTimeout(() => {
      clearToastTimers();
      setToast(null);
    }, duration);
  };

  const handleTriggerUndo = async () => {
    if (!toast?.onUndo || isUndoing) return;
    const undoFn = toast.onUndo;
    clearToastTimers();
    setIsUndoing(true);
    try {
      await undoFn();
      showToast('success', 'Restored deleted product image!');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to undo image deletion');
    } finally {
      setIsUndoing(false);
    }
  };

  useEffect(() => {
    return () => clearToastTimers();
  }, []);

  // Sync products and image state
  const refreshState = async () => {
    const st = productImageManagerService.getState();
    setSystemState({ ...st });
    try {
      const fetched = await api.getProducts();
      const base = fetched && fetched.length > 0 ? fetched : MOCK_PRODUCTS;
      setAllProducts(productImageManagerService.applyOverridesToProductList(base));
    } catch {
      setAllProducts(productImageManagerService.applyOverridesToProductList(MOCK_PRODUCTS));
    }
    if (onProductsUpdated) onProductsUpdated();
  };

  // Full Product Edit / Create Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<{
    id: string;
    title: string;
    category: string;
    subCategory: string;
    priceUsd: number;
    priceUnit: string;
    moq: number;
    moqUnit: string;
    supplierName: string;
    supplierCountry: string;
    portOfDispatch: string;
    description: string;
    hsCode: string;
    specifications: Array<{ name: string; value: string }>;
    images: string[];
  }>({
    id: '',
    title: '',
    category: 'Vanilla Beans & Spices',
    subCategory: 'Gourmet Grade Bourbon Vanilla',
    priceUsd: 150,
    priceUnit: 'Kg',
    moq: 1,
    moqUnit: 'Kgs',
    supplierName: 'Trade Heaven Exporters Ltd',
    supplierCountry: 'Madagascar',
    portOfDispatch: 'Port of Toamasina',
    description: '',
    hsCode: '0905.10.00',
    specifications: [
      { name: 'Grade', value: 'Grade A Gourmet (16-18cm)' },
      { name: 'Moisture Content', value: '30-35%' }
    ],
    images: []
  });

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      id: `prod-${Date.now().toString().slice(-6)}`,
      title: '',
      category: categories[0] || 'Vanilla Beans & Spices',
      subCategory: 'Export Grade',
      priceUsd: 180,
      priceUnit: 'Kg',
      moq: 1,
      moqUnit: 'Kgs',
      supplierName: 'Trade Heaven Exporters Ltd',
      supplierCountry: 'Madagascar',
      portOfDispatch: 'Port of Toamasina',
      description: 'High grade wholesale product direct from verified exporters.',
      hsCode: '0905.10.00',
      specifications: [
        { name: 'Grade', value: 'Grade A Export Quality' },
        { name: 'Moisture Content', value: '30-35%' }
      ],
      images: [
        '/assets/aistudio/sidath-vimukthi-fIGw-jVGy5g-unsplash_c8b9928d.jpg'
      ]
    });
    setIsAddingNewProduct(true);
  };

  const handleOpenEditProductDetails = (product: Product) => {
    setIsAddingNewProduct(false);
    setEditingProduct(product);
    setProductForm({
      id: product.id,
      title: product.title || '',
      category: product.category || 'General',
      subCategory: product.subCategory || '',
      priceUsd: product.priceTiers?.[0]?.priceUsd || 100,
      priceUnit: product.moqUnit || 'Kg',
      moq: product.moq || 1,
      moqUnit: product.moqUnit || 'Kgs',
      supplierName: product.supplierName || 'Verified Exporter',
      supplierCountry: product.supplierCountry || 'Global',
      portOfDispatch: product.portOfDispatch || 'Port of Dispatch',
      description: product.description || '',
      hsCode: product.hsCode || '0905.10.00',
      specifications: Array.isArray(product.specifications)
        ? product.specifications.map((s: any) => ({ name: String(s.name || ''), value: String(s.value || '') }))
        : typeof product.specifications === 'object' && product.specifications !== null
        ? Object.entries(product.specifications).map(([name, value]) => ({ name, value: String(value) }))
        : [
            { name: 'Grade', value: 'Grade A' },
            { name: 'Packaging', value: 'Vacuum Sealed' }
          ],
      images: product.images && product.images.length > 0 ? [...product.images] : ['/assets/aistudio/sidath-vimukthi-fIGw-jVGy5g-unsplash_c8b9928d.jpg']
    });
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title.trim()) {
      showToast('error', 'Product title is required.');
      return;
    }

    const payload: Partial<Product> = {
      id: productForm.id,
      title: productForm.title.trim(),
      category: productForm.category.trim(),
      subCategory: productForm.subCategory.trim(),
      moq: Number(productForm.moq) || 1,
      moqUnit: productForm.moqUnit.trim(),
      priceTiers: [
        { minUnits: Number(productForm.moq) || 1, priceUsd: Number(productForm.priceUsd) || 100 }
      ],
      supplierName: productForm.supplierName.trim(),
      supplierCountry: productForm.supplierCountry.trim(),
      portOfDispatch: productForm.portOfDispatch.trim(),
      description: productForm.description.trim(),
      hsCode: productForm.hsCode.trim(),
      specifications: productForm.specifications.filter(s => s.name.trim() && s.value.trim()),
      images: productForm.images.filter(img => img.trim().length > 0)
    };

    setIsUploading(true);
    try {
      // Automatically run B2B & Export SEO Engine so this product & its images rank #1 in the search bar
      const seoRec = autoSeoEngine.autoOptimizeProduct({
        ...payload,
        imageUrl: payload.images?.[0],
        price: `$${productForm.priceUsd} / ${productForm.priceUnit}`,
        moq: `${productForm.moq} ${productForm.moqUnit}`
      }, true);
      setSeoRecords(autoSeoEngine.getAllSeoRecords());

      if (payload.images && payload.images.length > 0 && payload.images[0]) {
        await productImageManagerService.setProductImage(
          isAddingNewProduct ? productForm.id : (editingProduct?.id || productForm.id),
          payload.images[0],
          payload.images
        );
        await productImageManagerService.forceSyncToServer();
      }

      if (isAddingNewProduct) {
        const res = await api.createProduct(payload);
        if (res.success) {
          showToast(
            'success',
            `Added "${payload.title}" & Auto-SEO Ranked #1 for B2B Export (SEO Score: ${seoRec.seoScore}/100)!`
          );
          setIsAddingNewProduct(false);
          await refreshState();
        } else {
          showToast('error', res.message || 'Failed to create product');
        }
      } else if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast(
            'success',
            `Updated "${payload.title}" & refreshed B2B Export Auto-SEO (Ranked #1 in Search Bar)!`
          );
          setEditingProduct(null);
          await refreshState();
        } else {
          showToast('error', res.message || 'Failed to update product');
        }
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Error saving product');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    productImageManagerService.syncFromServer(true).then(() => {
      refreshState();
    });
    const handleImagesUpdated = () => {
      const st = productImageManagerService.getState();
      setSystemState({ ...st });
      setAllProducts(prev => productImageManagerService.applyOverridesToProductList(prev));
    };
    const handleProductsUpdated = () => {
      refreshState();
    };
    const handleSeoUpdated = () => {
      setSeoRecords(autoSeoEngine.getAllSeoRecords());
    };
    window.addEventListener('tradeheaven_product_images_updated', handleImagesUpdated);
    window.addEventListener('tradeheaven_products_updated', handleProductsUpdated);
    window.addEventListener('tradeheaven_auto_seo_updated', handleSeoUpdated);
    return () => {
      window.removeEventListener('tradeheaven_product_images_updated', handleImagesUpdated);
      window.removeEventListener('tradeheaven_products_updated', handleProductsUpdated);
      window.removeEventListener('tradeheaven_auto_seo_updated', handleSeoUpdated);
    };
  }, []);

  useEffect(() => {
    if (externalProducts && externalProducts.length > 0) {
      setAllProducts(productImageManagerService.applyOverridesToProductList(externalProducts));
    }
  }, [externalProducts]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set).sort();
  }, [allProducts]);

  useEffect(() => {
    if (!bulkCategory && categories.length > 0) {
      setBulkCategory(categories[0]);
    }
  }, [categories, bulkCategory]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allProducts.filter(p => {
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;

      const isCustom = Boolean(
        systemState.overrides[p.id] ||
        systemState.overrides[p.title] ||
        (p.category && systemState.categoryOverrides[p.category]) ||
        systemState.globalDefaultImage
      );
      if (statusFilter === 'CUSTOMIZED' && !isCustom) return false;
      if (statusFilter === 'DEFAULT' && isCustom) return false;

      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.supplierName?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q)
      );
    });
  }, [allProducts, searchQuery, selectedCategory, statusFilter, systemState]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Group products by current primary image for "By Existing Image" tab
  const imageGroups = useMemo(() => {
    const map = new Map<string, { imageUrl: string; products: Product[] }>();
    for (const prod of allProducts) {
      const primary = prod.images?.[0] || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80';
      const existing = map.get(primary);
      if (existing) {
        existing.products.push(prod);
      } else {
        map.set(primary, { imageUrl: primary, products: [prod] });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.products.length - a.products.length);
  }, [allProducts]);

  // Products targeted by current Bulk Scope (for Visual Confirmation Preview Grid before bulk updates)
  const bulkTargetProducts = useMemo(() => {
    if (bulkTargetScope === 'ALL_PRODUCTS') return allProducts;
    if (bulkTargetScope === 'CATEGORY') {
      return allProducts.filter(p => p.category === bulkCategory);
    }
    return allProducts.filter(p => selectedProductIds.has(p.id));
  }, [allProducts, bulkTargetScope, bulkCategory, selectedProductIds]);

  const selectedProductsList = useMemo(() => {
    return allProducts.filter(p => selectedProductIds.has(p.id));
  }, [allProducts, selectedProductIds]);

  // Selection helpers
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Bulk-remove incorrect product image associations for selected Product IDs
  const handleDeleteSelectedAssociations = async (targetIds?: string[]) => {
    const idsToDelete = targetIds || Array.from(selectedProductIds);
    if (idsToDelete.length === 0) {
      showToast('error', 'Please select at least one product in the preview grid to delete its image association.');
      return;
    }

    // Snapshot existing images & overrides for 5-second Undo restoration
    const idSet = new Set(idsToDelete);
    const previousSnapshots = allProducts
      .filter(p => idSet.has(p.id))
      .map(p => ({
        id: p.id,
        title: p.title,
        images: Array.isArray(p.images) ? [...p.images] : [],
        hadOverride: Boolean(systemState.overrides[p.id])
      }));

    setIsUploading(true);
    try {
      const titlesToDelete = previousSnapshots.map(p => p.title).filter(Boolean);

      await productImageManagerService.deleteBulkProductImageAssociations(
        idsToDelete,
        titlesToDelete
      );
      setSelectedProductIds(prev => {
        const next = new Set(prev);
        idsToDelete.forEach(id => next.delete(id));
        return next;
      });
      await refreshState();
      showToast(
        'success',
        `Deleted product image association(s) for ${idsToDelete.length} selected Product ID(s).`,
        {
          durationMs: 5000,
          onUndo: async () => {
            for (const snap of previousSnapshots) {
              if (snap.images.length > 0) {
                await productImageManagerService.setProductImage(snap.id, snap.images[0], snap.images);
              }
            }
            await refreshState();
          }
        }
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete selected product image associations');
    } finally {
      setIsUploading(false);
    }
  };

  // Execute confirmed image deletion from the confirmation modal
  const handleExecuteConfirmedDelete = async () => {
    if (!deleteConfirmTarget) return;
    const target = deleteConfirmTarget;
    setDeleteConfirmTarget(null);

    if (target.mode === 'FORM_GALLERY_IMAGE' && typeof target.imageIndex === 'number') {
      const previousGalleryImages = [...productForm.images];
      const removedIdx = target.imageIndex;
      setProductForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== removedIdx)
      }));
      showToast('success', `Removed gallery image #${removedIdx + 1} from product.`, {
        durationMs: 5000,
        onUndo: () => {
          setProductForm(prev => ({
            ...prev,
            images: previousGalleryImages
          }));
        }
      });
      return;
    }

    if (target.mode === 'BULK_SELECTED') {
      await handleDeleteSelectedAssociations(target.targetIds);
      return;
    }

    if (target.mode === 'SINGLE_PRODUCT' && target.product) {
      const prod = target.product;
      const previousImages = Array.isArray(prod.images) && prod.images.length > 0
        ? [...prod.images]
        : target.imageUrl
          ? [target.imageUrl]
          : [];
      const hadCustomOverride = Boolean(systemState.overrides[prod.id]);

      setIsUploading(true);
      try {
        await productImageManagerService.resetProductImage(prod.id);
        const remainingImages = (prod.images || []).filter(img => img && img !== target.imageUrl);
        if (remainingImages.length > 0) {
          await productImageManagerService.setProductImage(prod.id, remainingImages[0], remainingImages);
          await api.updateProduct(prod.id, { images: remainingImages });
        } else {
          await api.updateProduct(prod.id, { images: [] });
        }
        await refreshState();
        showToast(
          'success',
          `Removed image from "${prod.title.slice(0, 34)}..."`,
          {
            durationMs: 5000,
            onUndo: async () => {
              if (previousImages.length > 0) {
                await api.updateProduct(prod.id, { images: previousImages });
                if (hadCustomOverride) {
                  await productImageManagerService.setProductImage(prod.id, previousImages[0], previousImages);
                } else {
                  await productImageManagerService.setProductImage(prod.id, previousImages[0], previousImages);
                }
              }
              await refreshState();
            }
          }
        );
      } catch (err: any) {
        showToast('error', err?.message || 'Failed to remove product image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Single Product Direct File Upload (supports single or multiple dropped files for a product)
  const handleSingleProductFileUpload = async (product: Product, fileOrFiles: File | FileList | File[]) => {
    const files =
      fileOrFiles instanceof File
        ? [fileOrFiles]
        : Array.from(fileOrFiles).filter(
            f => f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|gif|svg|bmp)$/i.test(f.name)
          );
    if (files.length === 0) return;

    setUploadingProductId(product.id);
    setIsUploading(true);
    try {
      let firstFormat = '';
      let firstName = '';
      for (let i = 0; i < files.length; i++) {
        const result = await productImageManagerService.uploadAndAssignImageFile(files[i], {
          targetFormat: autoWebpLossless ? 'webp' : outputFormat,
          quality: autoWebpLossless ? 1.0 : jpegQuality,
          autoWebpLossless,
          productId: product.id,
          appendToGallery: i > 0
        });
        if (i === 0) {
          firstFormat = result.format;
          firstName = result.name;
          autoSeoEngine.autoOptimizeImageUpload({
            imageUrl: result.url,
            fileName: result.name,
            productId: product.id,
            productTitle: product.title,
            category: product.category,
            supplierName: product.supplierName,
            originCountry: product.supplierCountry
          });
        }
      }
      setSeoRecords(autoSeoEngine.getAllSeoRecords());
      showToast(
        'success',
        files.length > 1
          ? `Uploaded ${files.length} images to "${product.id}" & Auto-SEO Ranked #1 for B2B Export!`
          : `Uploaded ${autoWebpLossless ? 'Lossless .WEBP' : firstFormat} (${firstName}) & Auto-SEO Boosted "${product.title.slice(0, 28)}..." to #1 in Search Bar!`
      );
      await refreshState();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to upload product image');
    } finally {
      setUploadingProductId(null);
      setIsUploading(false);
    }
  };

  // Rotate a single product's existing primary image by 90-degree increment (-90 or +90)
  const handleQuickRotateProductImage = async (product: Product, deltaDegrees: number) => {
    const currentSrc = product.images?.[0];
    if (!currentSrc) return;
    setUploadingProductId(product.id);
    setIsUploading(true);
    try {
      const { file } = await productImageManagerService.rotateImageSource(
        currentSrc,
        deltaDegrees,
        `${product.id}-rot.png`
      );
      await productImageManagerService.uploadAndAssignImageFile(file, {
        targetFormat: autoWebpLossless ? 'webp' : outputFormat,
        quality: autoWebpLossless ? 1.0 : jpegQuality,
        autoWebpLossless,
        productId: product.id
      });
      await refreshState();
      showToast(
        'success',
        `Rotated image for Product ID "${product.id}" by ${deltaDegrees > 0 ? `+${deltaDegrees}°` : `${deltaDegrees}°`}!`
      );
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to rotate product image');
    } finally {
      setUploadingProductId(null);
      setIsUploading(false);
    }
  };

  // Bulk / Global File Upload (supports 90-degree increment rotation & grayscale/sepia/brightness/contrast filters before saving)
  const handleBulkScopeFileUpload = async (
    file: File,
    rotationDeg = stagedBulkRotation,
    filtersToApply: ImageEditFilters = stagedBulkFilters
  ) => {
    setIsUploading(true);
    try {
      const effectiveFormat: OutputImageFormat = autoWebpLossless ? 'webp' : outputFormat;
      const effectiveQuality = autoWebpLossless ? 1.0 : jpegQuality;
      const rotLabel = rotationDeg ? ` (Rotated ${rotationDeg}°)` : '';
      const filterLabel = hasActiveImageFilters(filtersToApply) ? ' + Filters' : '';
      if (bulkTargetScope === 'ALL_PRODUCTS') {
        const allIds = allProducts.map(p => p.id);
        const res = await productImageManagerService.uploadAndAssignImageFile(file, {
          targetFormat: effectiveFormat,
          quality: effectiveQuality,
          autoWebpLossless,
          rotationDegrees: rotationDeg,
          filters: filtersToApply,
          applyToAll: true,
          productIds: allIds
        });
        showToast(
          'success',
          `Uploaded ${autoWebpLossless ? 'Lossless .WEBP' : res.format} image${rotLabel}${filterLabel} & applied to ALL ${allIds.length} listed products!`
        );
      } else if (bulkTargetScope === 'CATEGORY' && bulkCategory) {
        const catIds = allProducts.filter(p => p.category === bulkCategory).map(p => p.id);
        const res = await productImageManagerService.uploadAndAssignImageFile(file, {
          targetFormat: effectiveFormat,
          quality: effectiveQuality,
          autoWebpLossless,
          rotationDegrees: rotationDeg,
          filters: filtersToApply,
          category: bulkCategory,
          productIds: catIds
        });
        showToast(
          'success',
          `Uploaded ${autoWebpLossless ? 'Lossless .WEBP' : res.format} image${rotLabel}${filterLabel} & applied to all ${catIds.length} products in "${bulkCategory}"!`
        );
      } else if (bulkTargetScope === 'SELECTED') {
        const selIds = Array.from(selectedProductIds);
        if (selIds.length === 0) {
          showToast('error', 'Please select at least one product first.');
          setIsUploading(false);
          return;
        }
        const res = await productImageManagerService.uploadAndAssignImageFile(file, {
          targetFormat: effectiveFormat,
          quality: effectiveQuality,
          autoWebpLossless,
          rotationDegrees: rotationDeg,
          filters: filtersToApply,
          productIds: selIds
        });
        showToast(
          'success',
          `Uploaded ${autoWebpLossless ? 'Lossless .WEBP' : res.format} image${rotLabel}${filterLabel} & applied to ${selIds.length} selected product(s)!`
        );
      }
      await refreshState();
    } catch (err: any) {
      showToast('error', err?.message || 'Bulk image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Apply URL to Bulk Scope (with optional 90-degree increment rotation & filters)
  const handleApplyBulkUrl = async (
    urlToApply: string,
    rotationDeg = 0,
    filtersToApply: ImageEditFilters = stagedBulkFilters
  ) => {
    const clean = urlToApply.trim();
    if (!clean) {
      showToast('error', 'Please provide or select a valid image URL.');
      return;
    }
    const normalizedRot = (((Math.round(rotationDeg / 90) * 90) % 360) + 360) % 360;
    const filtersActive = hasActiveImageFilters(filtersToApply);
    if (normalizedRot !== 0 || filtersActive) {
      try {
        const transformed = await productImageManagerService.rotateImageSource(
          clean,
          normalizedRot,
          'edited-bulk-image.png',
          filtersToApply
        );
        await handleBulkScopeFileUpload(transformed.file, 0, DEFAULT_IMAGE_EDIT_FILTERS);
        return;
      } catch {
        // Fallback to applying URL if cross-origin canvas transform is blocked
      }
    }
    setIsUploading(true);
    try {
      if (bulkTargetScope === 'ALL_PRODUCTS') {
        const allIds = allProducts.map(p => p.id);
        await productImageManagerService.setAllProductsImage(clean, allIds);
        showToast('success', `Applied new image to ALL ${allIds.length} listed products!`);
      } else if (bulkTargetScope === 'CATEGORY' && bulkCategory) {
        const catIds = allProducts.filter(p => p.category === bulkCategory).map(p => p.id);
        await productImageManagerService.setCategoryImage(bulkCategory, clean, catIds);
        showToast('success', `Applied new image to all ${catIds.length} products in "${bulkCategory}"!`);
      } else if (bulkTargetScope === 'SELECTED') {
        const selIds = Array.from(selectedProductIds);
        if (selIds.length === 0) {
          showToast('error', 'Please select at least one product first.');
          setIsUploading(false);
          return;
        }
        await productImageManagerService.setBulkProductImages(selIds, clean);
        showToast('success', `Applied new image to ${selIds.length} selected product(s)!`);
      }
      await refreshState();
    } finally {
      setIsUploading(false);
    }
  };

  // Replace an existing image group across all matching products
  const handleReplaceImageGroupWithFile = async (oldImageUrl: string, matchingProducts: Product[], file: File) => {
    setIsUploading(true);
    try {
      const ids = matchingProducts.map(p => p.id);
      const res = await productImageManagerService.uploadAndAssignImageFile(file, {
        targetFormat: autoWebpLossless ? 'webp' : outputFormat,
        quality: autoWebpLossless ? 1.0 : jpegQuality,
        autoWebpLossless,
        oldUrlToReplace: oldImageUrl,
        productIds: ids
      });
      showToast(
        'success',
        `Replaced image across all ${ids.length} product(s) with new ${autoWebpLossless ? 'Lossless .WEBP' : res.format} file (${res.name})!`
      );
      await refreshState();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to replace image group');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload multiple files directly to Media Library
  const handleMediaLibraryMultiUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    let count = 0;
    try {
      for (const file of Array.from(files)) {
        await productImageManagerService.uploadAndAssignImageFile(file, {
          targetFormat: autoWebpLossless ? 'webp' : outputFormat,
          quality: autoWebpLossless ? 1.0 : jpegQuality,
          autoWebpLossless
        });
        count++;
      }
      showToast(
        'success',
        `Uploaded ${count} image(s) to Server Media Library as ${
          autoWebpLossless
            ? 'Lossless .WEBP'
            : outputFormat === 'original'
              ? 'original format'
              : outputFormat.toUpperCase()
        }!`
      );
      await refreshState();
    } catch (err: any) {
      showToast('error', err?.message || 'Error uploading files to library');
    } finally {
      setIsUploading(false);
    }
  };

  const customizedCount = Object.keys(systemState.overrides).length;

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION WITH 5-SECOND UNDO ACTION */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3.5 animate-in fade-in slide-in-from-top-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-950 text-rose-100 border-rose-700'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 shrink-0 ${toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="text-xs font-bold">{toast.message}</span>

          {toast.onUndo && (
            <button
              type="button"
              disabled={isUndoing}
              onClick={handleTriggerUndo}
              className="ml-2 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              title="Restore the deleted image within 5 seconds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isUndoing ? 'Restoring...' : `Undo (${undoSecondsLeft}s)`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              clearToastTimers();
              setToast(null);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP SYSTEM HEADER & FORMAT CONTROLLER */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <ImageIcon className="w-4 h-4" />
              <span>Dedicated Admin Product Media &amp; Format Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Product Image Management &amp; Upload System
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Change or upload new images for any individual product, category, or all {allProducts.length.toLocaleString()} listed products. Supports uploading in <strong className="text-white">JPG, JPEG, PNG, WEBP, AVIF, SVG, GIF, or BMP</strong> with automatic format conversion and persistent server storage.
            </p>
          </div>

          {/* Format Converter & Quick Stats Box */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <label
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer select-none transition-all ${
                autoWebpLossless
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
              title="Automatically enable WebP conversion and lossless compression (Quality 100%) for all uploaded images before saving to the server"
            >
              <input
                type="checkbox"
                checked={autoWebpLossless}
                onChange={e => handleToggleAutoWebpLossless(e.target.checked)}
                className="w-4 h-4 rounded border-slate-500 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex flex-col leading-tight">
                <span className="font-extrabold text-white">Auto WebP + Lossless</span>
                <span className="text-[10px] text-emerald-300/90">Before saving to server</span>
              </div>
            </label>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Output Format</span>
              </label>
              <select
                value={autoWebpLossless ? 'webp' : outputFormat}
                disabled={autoWebpLossless}
                onChange={e => setOutputFormat(e.target.value as OutputImageFormat)}
                className="w-full sm:w-52 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500 disabled:opacity-75"
              >
                <option value="webp">Auto-Convert to .WEBP {autoWebpLossless ? '(Lossless)' : '(Optimized)'}</option>
                <option value="jpg">Auto-Convert to .JPG (Standard)</option>
                <option value="png">Auto-Convert to .PNG (Lossless)</option>
                <option value="original">Keep Original File Format</option>
              </select>
            </div>

            <div className="h-px sm:h-10 sm:w-px bg-slate-700" />

            <div className="flex items-center gap-4 text-xs">
              <div>
                <div className="text-slate-400 font-medium">Total Products</div>
                <div className="text-lg font-black text-white font-mono">{allProducts.length.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Custom Overrides</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {systemState.globalDefaultImage ? allProducts.length : customizedCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('ALL_PRODUCTS')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'ALL_PRODUCTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>1. All Listed Products ({allProducts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('BULK_DRAG_DROP_MAPPER')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'BULK_DRAG_DROP_MAPPER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>2. Bulk Drag &amp; Drop to Product IDs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('BULK_GLOBAL')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'BULK_GLOBAL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>3. Change All / Category Image</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('BY_EXISTING_IMAGE')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'BY_EXISTING_IMAGE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>4. Replace By Existing Image ({imageGroups.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('MEDIA_LIBRARY')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'MEDIA_LIBRARY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>5. Uploaded Media Library ({systemState.mediaLibrary.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('AUTO_SEO_ENGINE')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'AUTO_SEO_ENGINE'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>6. Auto-SEO &amp; Top Search Engine ({seoRecords.length})</span>
            </button>
          </div>

          {(customizedCount > 0 || systemState.globalDefaultImage) && (
            <button
              type="button"
              onClick={async () => {
                await productImageManagerService.resetAllProductImages();
                await refreshState();
                showToast('success', 'All product images restored to default catalog images.');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/70 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Overrides</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          TAB 1: ALL LISTED PRODUCTS VISUAL MANAGER
      ===================================================================== */}
      {activeSubTab === 'ALL_PRODUCTS' && (
        <div className="space-y-5">
          {/* Search, Category Filter & Bulk Action Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search Input */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by product title, SKU ID, supplier, or category..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Categories ({allProducts.length})</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CUSTOMIZED">Admin Customized</option>
                  <option value="DEFAULT">Default Image</option>
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="md:col-span-2 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewMode('GRID')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    viewMode === 'GRID'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('TABLE')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    viewMode === 'TABLE'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>

            {/* Selection & Quick Bulk Upload Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>
                    {selectedProductIds.size > 0
                      ? `Selected ${selectedProductIds.size} Product(s)`
                      : `Select All Filtered (${filteredProducts.length})`}
                  </span>
                </button>

                {selectedProductIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds(new Set())}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Add a new product with custom details, MOQ, specs, and images to marketplace catalog"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Product</span>
                </button>

                <button
                  type="button"
                  disabled={selectedProductIds.size === 0 || isUploading}
                  onClick={() =>
                    setDeleteConfirmTarget({
                      mode: 'BULK_SELECTED',
                      targetIds: Array.from(selectedProductIds)
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Bulk-remove custom/incorrect product image associations for all selected Product IDs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedProductIds.size})</span>
                </button>

                {selectedProductIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsBulkPlaceholderModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    title="Bulk assign a single verified placeholder image to all selected items at once"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-300" />
                    <span>Assign Verified Placeholder ({selectedProductIds.size})</span>
                  </button>
                )}

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoWebpLossless}
                    onChange={e => handleToggleAutoWebpLossless(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Auto WebP + Lossless Compression</span>
                </label>

                {selectedProductIds.size > 0 && (
                  <label className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Stage &amp; Rotate Image for {selectedProductIds.size} Selected</span>
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (stagedBulkPreviewUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(stagedBulkPreviewUrl);
                        }
                        setBulkTargetScope('SELECTED');
                        setStagedBulkFile(file);
                        setStagedBulkPreviewUrl(URL.createObjectURL(file));
                        setStagedBulkRotation(0);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => setActiveSubTab('BULK_DRAG_DROP_MAPPER')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bulk Drag &amp; Drop Multi-Images to IDs</span>
                </button>

                <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Stage &amp; Rotate Image for ALL {filteredProducts.length} Products</span>
                  <input
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (stagedBulkPreviewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(stagedBulkPreviewUrl);
                      }
                      setBulkTargetScope('ALL_PRODUCTS');
                      setStagedBulkFile(file);
                      setStagedBulkPreviewUrl(URL.createObjectURL(file));
                      setStagedBulkRotation(0);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* PRE-BULK-UPDATE STAGED IMAGE, 90° ROTATION & FILTER EDITOR BAR IN TAB 1 */}
            {(stagedBulkFile || stagedBulkPreviewUrl) && (
              <div className="mt-3 bg-blue-950 text-white rounded-2xl p-4 space-y-3 border border-blue-700 shadow-md">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border-2 border-blue-400 shrink-0 flex items-center justify-center relative">
                      <img
                        src={stagedBulkPreviewUrl}
                        alt="Staged Bulk Image"
                        className="w-full h-full object-cover transition-all duration-200"
                        style={{
                          transform: `rotate(${stagedBulkRotation}deg)`,
                          filter: buildCssFilterString(stagedBulkFilters)
                        }}
                      />
                      {stagedBulkRotation !== 0 && (
                        <span className="absolute bottom-0.5 right-0.5 bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1 rounded">
                          {stagedBulkRotation}°
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                        <RotateCw className="w-3 h-3" />
                        <span>Staged Bulk Image · 90° Rotation &amp; Filters Before Updating</span>
                      </div>
                      <div className="text-xs font-black truncate">
                        {stagedBulkFile ? stagedBulkFile.name : stagedBulkPreviewUrl}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Orientation: <strong className="text-amber-300 font-mono">{stagedBulkRotation}°</strong> ·
                        Filters:{' '}
                        <strong className="text-emerald-300">
                          {hasActiveImageFilters(stagedBulkFilters)
                            ? `G:${stagedBulkFilters.grayscale}% S:${stagedBulkFilters.sepia}% B:${stagedBulkFilters.brightness}% C:${stagedBulkFilters.contrast}%`
                            : 'Original'}
                        </strong>{' '}
                        · Target:{' '}
                        <strong className="text-white">
                          {bulkTargetScope === 'SELECTED' && selectedProductIds.size > 0
                            ? `${selectedProductIds.size} Selected Product(s)`
                            : `All ${allProducts.length} Listed Products`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 90-Degree Increment Rotation & Basic Image Editing Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStagedBulkRotation(r => (((r - 90) % 360) + 360) % 360)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Rotate 90° Counter-Clockwise (-90°)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rotate -90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStagedBulkRotation(r => (((r + 90) % 360) + 360) % 360)}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Rotate 90° Clockwise (+90°)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate +90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStagedBulkRotation(r => (((r + 180) % 360) + 360) % 360)}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Rotate 180°"
                    >
                      180°
                    </button>
                    {(stagedBulkRotation !== 0 || hasActiveImageFilters(stagedBulkFilters)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStagedBulkRotation(0);
                          setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
                        }}
                        className="px-2.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingStagedBulkImage(true)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                      <span>Edit &amp; Filters Studio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (stagedBulkPreviewUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(stagedBulkPreviewUrl);
                        }
                        setStagedBulkFile(null);
                        setStagedBulkPreviewUrl('');
                        setStagedBulkRotation(0);
                        setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={async () => {
                        if (stagedBulkFile) {
                          await handleBulkScopeFileUpload(
                            stagedBulkFile,
                            stagedBulkRotation,
                            stagedBulkFilters
                          );
                        } else if (stagedBulkPreviewUrl) {
                          await handleApplyBulkUrl(
                            stagedBulkPreviewUrl,
                            stagedBulkRotation,
                            stagedBulkFilters
                          );
                        }
                        setStagedBulkFile(null);
                        setStagedBulkPreviewUrl('');
                        setStagedBulkRotation(0);
                        setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Bulk Update</span>
                    </button>
                  </div>
                </div>

                {/* Inline Filter Presets & Brightness/Contrast/Grayscale/Sepia Sliders in Tab 1 */}
                <div className="pt-2.5 border-t border-blue-800/80 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                  <div className="lg:col-span-4 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-blue-200 mr-1">Filters:</span>
                    <button
                      type="button"
                      onClick={() => setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        !hasActiveImageFilters(stagedBulkFilters)
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStagedBulkFilters(f => ({
                          ...f,
                          grayscale: f.grayscale === 100 ? 0 : 100,
                          sepia: 0
                        }))
                      }
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        stagedBulkFilters.grayscale === 100
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Grayscale
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStagedBulkFilters(f => ({
                          ...f,
                          sepia: f.sepia === 100 ? 0 : 100,
                          grayscale: 0
                        }))
                      }
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        stagedBulkFilters.sepia === 100
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Sepia
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStagedBulkFilters({
                          grayscale: 0,
                          sepia: 0,
                          brightness: 115,
                          contrast: 110
                        })
                      }
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        stagedBulkFilters.brightness === 115 && stagedBulkFilters.contrast === 110
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Bright +15%
                    </button>
                  </div>

                  <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Grayscale</span>
                        <span className="font-mono text-blue-300">{stagedBulkFilters.grayscale}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stagedBulkFilters.grayscale}
                        onChange={e =>
                          setStagedBulkFilters(f => ({ ...f, grayscale: Number(e.target.value) }))
                        }
                        className="w-full accent-blue-400 cursor-pointer h-1"
                      />
                    </div>
                    <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Sepia</span>
                        <span className="font-mono text-amber-300">{stagedBulkFilters.sepia}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stagedBulkFilters.sepia}
                        onChange={e =>
                          setStagedBulkFilters(f => ({ ...f, sepia: Number(e.target.value) }))
                        }
                        className="w-full accent-amber-400 cursor-pointer h-1"
                      />
                    </div>
                    <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Brightness</span>
                        <span className="font-mono text-emerald-300">{stagedBulkFilters.brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={150}
                        value={stagedBulkFilters.brightness}
                        onChange={e =>
                          setStagedBulkFilters(f => ({ ...f, brightness: Number(e.target.value) }))
                        }
                        className="w-full accent-emerald-400 cursor-pointer h-1"
                      />
                    </div>
                    <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                      <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                        <span>Contrast</span>
                        <span className="font-mono text-indigo-300">{stagedBulkFilters.contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={150}
                        value={stagedBulkFilters.contrast}
                        onChange={e =>
                          setStagedBulkFilters(f => ({ ...f, contrast: Number(e.target.value) }))
                        }
                        className="w-full accent-indigo-400 cursor-pointer h-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL CONFIRMATION PREVIEW GRID FOR SELECTED PRODUCTS BEFORE BULK UPDATE */}
            {selectedProductsList.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider">
                      Bulk Update Visual Confirmation Preview Grid ({selectedProductsList.length})
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Verify existing product images alongside their Product IDs, or bulk-remove incorrect associations.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteConfirmTarget({
                        mode: 'BULK_SELECTED',
                        targetIds: Array.from(selectedProductIds)
                      })
                    }
                    disabled={isUploading}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedProductsList.length})</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-1">
                  {selectedProductsList.map(prod => (
                    <div
                      key={`sel-preview-${prod.id}`}
                      className="bg-slate-50 border border-blue-300 rounded-xl overflow-hidden flex flex-col justify-between shadow-2xs"
                    >
                      <div className="bg-slate-900 text-white px-2.5 py-1.5 flex items-center justify-between gap-1">
                        <label className="flex items-center gap-1.5 min-w-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.has(prod.id)}
                            onChange={() => toggleSelectProduct(prod.id)}
                            className="w-3.5 h-3.5 rounded border-slate-600 text-blue-600 cursor-pointer shrink-0"
                          />
                          <span className="font-mono text-[10px] font-black text-amber-300 truncate" title={prod.id}>
                            ID: {prod.id}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmTarget({
                              mode: 'SINGLE_PRODUCT',
                              product: prod,
                              imageUrl: prod.images?.[0]
                            })
                          }
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete image for this Product ID"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="h-24 w-full bg-slate-200 relative overflow-hidden">
                        <SafeImage
                          src={prod.images?.[0]}
                          alt={prod.title}
                          productId={prod.id}
                          productTitle={prod.title}
                          category={prod.category}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Existing
                        </span>
                      </div>
                      <div className="p-2">
                        <div className="text-[11px] font-bold text-slate-800 truncate" title={prod.title}>
                          {prod.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PRODUCTS GRID VIEW */}
          {viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedProducts.map(product => {
                const isSelected = selectedProductIds.has(product.id);
                const hasCustomOverride = Boolean(systemState.overrides[product.id]);
                const currentPrimary = product.images?.[0] || '';
                const detectedFormat = productImageManagerService.detectFormatFromUrl(currentPrimary);
                const isProductUploading = uploadingProductId === product.id;

                const isDragOverCard = dragOverProductId === product.id;

                return (
                  <div
                    key={product.id}
                    onDragOver={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dragOverProductId !== product.id) setDragOverProductId(product.id);
                    }}
                    onDragLeave={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dragOverProductId === product.id) setDragOverProductId(null);
                    }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverProductId(null);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleSingleProductFileUpload(product, e.dataTransfer.files);
                      }
                    }}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-2xs ${
                      isDragOverCard
                        ? 'border-blue-600 ring-4 ring-blue-500/30 bg-blue-50/30'
                        : isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500/20'
                          : hasCustomOverride
                            ? 'border-emerald-300'
                            : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Image Preview Header */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
                        <SafeImage
                          src={currentPrimary}
                          alt={product.title}
                          productId={product.id}
                          productTitle={product.title}
                          category={product.category}
                          className="w-full h-full object-cover"
                        />

                        {/* Checkbox top-left */}
                        <button
                          type="button"
                          onClick={() => toggleSelectProduct(product.id)}
                          className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-lg bg-white/95 hover:bg-white shadow-sm border border-slate-200 flex items-center justify-center cursor-pointer"
                          title="Select product for bulk image update"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {/* Format & Status Metadata top-right */}
                        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-bold">
                          <span>{detectedFormat}</span>
                          <span>·</span>
                          <span>{product.images?.length || 1} img</span>
                          {hasCustomOverride && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400">CUSTOM</span>
                            </>
                          )}
                        </div>

                        {/* Product ID Badge bottom-left on image */}
                        <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-900/90 backdrop-blur-xs text-amber-300 px-2.5 py-1 rounded-md text-[10px] font-mono font-black border border-slate-700">
                          ID: {product.id}
                        </div>

                        {/* Quick Hover Overlay Actions */}
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1.5 p-3">
                          <label className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleSingleProductFileUpload(product, file);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleQuickRotateProductImage(product, -90)}
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-md cursor-pointer"
                            title="Rotate Product Image -90° (Counter-Clockwise)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickRotateProductImage(product, 90)}
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-md cursor-pointer"
                            title="Rotate Product Image +90° (Clockwise)"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCroppingTarget({ product, imageUrl: currentPrimary })}
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-md cursor-pointer"
                            title="Open Image Rotation & Crop Studio Editor"
                          >
                            <Crop className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmTarget({
                                mode: 'SINGLE_PRODUCT',
                                product,
                                imageUrl: currentPrimary
                              })
                            }
                            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer"
                            title="Delete Image from Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {isProductUploading && (
                          <div className="absolute inset-0 bg-slate-900/75 flex flex-col items-center justify-center text-white z-20">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mb-1.5" />
                            <span className="text-[11px] font-bold">Converting &amp; Saving...</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-3.5 space-y-1.5">
                        <div className="text-[11px] text-slate-500 flex items-center justify-between gap-1.5">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            ID: {product.id}
                          </span>
                          <span className="truncate text-slate-500">{product.category}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug" title={product.title}>
                          {product.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate">
                          Supplier: <strong className="text-slate-700 font-semibold">{product.supplierName}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-3.5 pt-0 space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProductDetails(product)}
                          className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Edit each and every detail of this product (title, category, price, MOQ, specs, images)"
                        >
                          <Edit className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Edit</span>
                        </button>

                        <label className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                          <Upload className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Upload</span>
                          <input
                            type="file"
                            accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleSingleProductFileUpload(product, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setActiveProductForModal(product)}
                          className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">Gallery</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmTarget({
                              mode: 'SINGLE_PRODUCT',
                              product,
                              imageUrl: currentPrimary
                            })
                          }
                          className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Delete image from this product (opens confirmation modal)"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Delete</span>
                        </button>
                      </div>

                      {hasCustomOverride && (
                        <button
                          type="button"
                          onClick={async () => {
                            await productImageManagerService.resetProductImage(product.id);
                            await refreshState();
                            showToast('success', `Reset image for "${product.title.slice(0, 30)}..."`);
                          }}
                          className="w-full py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Default</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* PRODUCTS TABLE VIEW */
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="p-3.5 w-10">
                        <button type="button" onClick={toggleSelectAllFiltered} className="cursor-pointer">
                          {selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="p-3.5 w-24">Image</th>
                      <th className="p-3.5">Product Title &amp; SKU</th>
                      <th className="p-3.5">Category &amp; Supplier</th>
                      <th className="p-3.5">Format</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {paginatedProducts.map(product => {
                      const isSelected = selectedProductIds.has(product.id);
                      const hasCustomOverride = Boolean(systemState.overrides[product.id]);
                      const currentPrimary = product.images?.[0] || '';
                      const detectedFormat = productImageManagerService.detectFormatFromUrl(currentPrimary);

                      return (
                        <tr key={product.id} className={isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}>
                          <td className="p-3.5">
                            <button type="button" onClick={() => toggleSelectProduct(product.id)} className="cursor-pointer">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </td>
                          <td className="p-3.5">
                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                              <SafeImage
                                src={currentPrimary}
                                alt={product.title}
                                productId={product.id}
                                productTitle={product.title}
                                category={product.category}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <div className="font-bold text-slate-900 line-clamp-1">{product.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{product.id}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800">{product.category}</div>
                            <div className="text-[11px] text-slate-500">{product.supplierName}</div>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-700">
                            <span>{detectedFormat}</span>
                            {hasCustomOverride && <span className="ml-1.5 text-emerald-600 font-bold">· Custom</span>}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProductDetails(product)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                                title="Edit each and every detail of this product"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit Details</span>
                              </button>
                              <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                                <Upload className="w-3 h-3" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleSingleProductFileUpload(product, file);
                                    e.target.value = '';
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setActiveProductForModal(product)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold cursor-pointer"
                              >
                                Edit URL / Gallery
                              </button>
                              <button
                                type="button"
                                onClick={() => setCroppingTarget({ product, imageUrl: currentPrimary })}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                title="Crop / Studio Editor"
                              >
                                <Crop className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmTarget({
                                    mode: 'SINGLE_PRODUCT',
                                    product,
                                    imageUrl: currentPrimary
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Delete image from this product (opens confirmation modal)"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 font-medium">
                Showing <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredProducts.length)}</strong> of{' '}
                <strong className="text-slate-900">{filteredProducts.length.toLocaleString()}</strong> listed products
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-xs font-bold text-slate-800">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: BULK DRAG & DROP MULTI-IMAGE TO PRODUCT ID MAPPER
      ===================================================================== */}
      {activeSubTab === 'BULK_DRAG_DROP_MAPPER' && (
        <MultiImageBatchUploader
          products={allProducts}
          defaultOutputFormat={outputFormat}
          defaultAutoWebpLossless={autoWebpLossless}
          onToggleAutoWebpLossless={handleToggleAutoWebpLossless}
          embedded={true}
          onAssignImages={async assignments => {
            await refreshState();
            showToast(
              'success',
              `Successfully uploaded & mapped ${assignments.length} image(s) to existing Product IDs!`
            );
          }}
        />
      )}

      {/* =====================================================================
          TAB 3: BULK & GLOBAL IMAGE CHANGER (ALL PRODUCTS OR BY CATEGORY)
      ===================================================================== */}
      {activeSubTab === 'BULK_GLOBAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Target Scope + File Upload / URL Assignment */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Global &amp; Category Bulk Product Image Changer
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a new image in JPG or any format (PNG, WEBP, AVIF, SVG, GIF) and apply it across all listed products or an entire category in one click.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={autoWebpLossless}
                  onChange={e => handleToggleAutoWebpLossless(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Auto WebP + Lossless Compression</span>
              </label>
            </div>

            {/* Step 1: Choose Target Scope */}
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Step 1: Choose Which Products to Update
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBulkTargetScope('ALL_PRODUCTS')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    bulkTargetScope === 'ALL_PRODUCTS'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-black text-xs">All Listed Products</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Every product ({allProducts.length.toLocaleString()} items)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkTargetScope('CATEGORY')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    bulkTargetScope === 'CATEGORY'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-black text-xs">Specific Category</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    All products in chosen sector
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkTargetScope('SELECTED')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    bulkTargetScope === 'SELECTED'
                      ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-black text-xs">Selected Products</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {selectedProductIds.size} currently checked
                  </div>
                </button>
              </div>

              {bulkTargetScope === 'CATEGORY' && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                    Select Target Category
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={e => setBulkCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  >
                    {categories.map(cat => {
                      const count = allProducts.filter(p => p.category === cat).length;
                      return (
                        <option key={cat} value={cat}>
                          {cat} ({count} products)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* Step 2: Stage or Upload New Image File from Device */}
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Step 2A: Stage or Upload New Image File (JPG, PNG, WEBP, SVG, AVIF, GIF)
              </label>
              <label className="border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2.5 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-black text-slate-900">
                  Select New Image to Preview Before Bulk Update
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Stages your image so you can visually confirm it alongside existing product images and Product IDs in the preview grid below before applying.
                </p>
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (stagedBulkPreviewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(stagedBulkPreviewUrl);
                      }
                      setStagedBulkFile(file);
                      setStagedBulkPreviewUrl(URL.createObjectURL(file));
                      setStagedBulkRotation(0);
                    }
                    e.target.value = '';
                  }}
                />
              </label>

              {/* Staged Image Confirmation Banner + 90-Degree Increment Rotation & Filter Tool */}
              {(stagedBulkFile || stagedBulkPreviewUrl) && (
                <div className="bg-blue-950 text-white rounded-xl p-4 space-y-3 border border-blue-700">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-blue-400 shrink-0 relative flex items-center justify-center">
                        <img
                          src={stagedBulkPreviewUrl}
                          alt="Staged Bulk Replacement"
                          className="w-full h-full object-cover transition-all duration-200"
                          style={{
                            transform: `rotate(${stagedBulkRotation}deg)`,
                            filter: buildCssFilterString(stagedBulkFilters)
                          }}
                        />
                        {stagedBulkRotation !== 0 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-amber-400 text-slate-950 text-[9px] font-mono font-black px-1 rounded">
                            {stagedBulkRotation}°
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                          Staged for Visual Confirmation, 90° Rotation &amp; Filter Editing
                        </div>
                        <div className="text-xs font-black truncate">
                          {stagedBulkFile ? stagedBulkFile.name : stagedBulkPreviewUrl}
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Orientation: <strong className="text-amber-300 font-mono">{stagedBulkRotation}°</strong> ·
                          Filters:{' '}
                          <strong className="text-emerald-300">
                            {hasActiveImageFilters(stagedBulkFilters)
                              ? `G:${stagedBulkFilters.grayscale}% S:${stagedBulkFilters.sepia}% B:${stagedBulkFilters.brightness}% C:${stagedBulkFilters.contrast}%`
                              : 'Original'}
                          </strong>{' '}
                          · Ready to update {bulkTargetProducts.length} Product ID(s)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (stagedBulkPreviewUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(stagedBulkPreviewUrl);
                          }
                          setStagedBulkFile(null);
                          setStagedBulkPreviewUrl('');
                          setStagedBulkRotation(0);
                          setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
                        }}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={async () => {
                          if (stagedBulkFile) {
                            await handleBulkScopeFileUpload(
                              stagedBulkFile,
                              stagedBulkRotation,
                              stagedBulkFilters
                            );
                            setStagedBulkFile(null);
                            setStagedBulkPreviewUrl('');
                            setStagedBulkRotation(0);
                            setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
                          } else if (stagedBulkPreviewUrl) {
                            await handleApplyBulkUrl(
                              stagedBulkPreviewUrl,
                              stagedBulkRotation,
                              stagedBulkFilters
                            );
                            setStagedBulkPreviewUrl('');
                            setStagedBulkRotation(0);
                            setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm &amp; Apply Bulk Update ({bulkTargetProducts.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Basic Image Editing Tool: Rotate by 90-Degree Increments Bar */}
                  <div className="pt-2.5 border-t border-blue-800/80 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-200 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-amber-300" />
                      <span>Rotate Image by 90° Increments &amp; Adjust Filters Before Bulk Updating:</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStagedBulkRotation(r => (((r - 90) % 360) + 360) % 360)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Rotate 90° Counter-Clockwise (-90°)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>-90° CCW</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStagedBulkRotation(r => (((r + 90) % 360) + 360) % 360)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Rotate 90° Clockwise (+90°)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>+90° CW</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStagedBulkRotation(r => (((r + 180) % 360) + 360) % 360)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        title="Rotate 180°"
                      >
                        180°
                      </button>
                      {(stagedBulkRotation !== 0 || hasActiveImageFilters(stagedBulkFilters)) && (
                        <button
                          type="button"
                          onClick={() => {
                            setStagedBulkRotation(0);
                            setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reset All
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsEditingStagedBulkImage(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-blue-500/40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open Image &amp; Filter Studio</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Presets & Grayscale / Sepia / Brightness / Contrast Sliders */}
                  <div className="pt-2.5 border-t border-blue-800/80 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-200 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Filter Presets (Live Preview in Grid Below):</span>
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            !hasActiveImageFilters(stagedBulkFilters)
                              ? 'bg-white text-slate-900'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Original
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStagedBulkFilters(f => ({
                              ...f,
                              grayscale: f.grayscale === 100 ? 0 : 100,
                              sepia: 0
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            stagedBulkFilters.grayscale === 100
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Grayscale (B&amp;W)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStagedBulkFilters(f => ({
                              ...f,
                              sepia: f.sepia === 100 ? 0 : 100,
                              grayscale: 0
                            }))
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            stagedBulkFilters.sepia === 100
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Sepia Tone
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStagedBulkFilters({
                              grayscale: 0,
                              sepia: 0,
                              brightness: 115,
                              contrast: 110
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            stagedBulkFilters.brightness === 115 && stagedBulkFilters.contrast === 110
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          Studio Bright (+15%)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStagedBulkFilters({
                              grayscale: 0,
                              sepia: 0,
                              brightness: 105,
                              contrast: 125
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            stagedBulkFilters.contrast === 125
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          High Contrast (+25%)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                      <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                        <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                          <span>Grayscale</span>
                          <span className="font-mono text-blue-300">{stagedBulkFilters.grayscale}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={stagedBulkFilters.grayscale}
                          onChange={e =>
                            setStagedBulkFilters(f => ({ ...f, grayscale: Number(e.target.value) }))
                          }
                          className="w-full accent-blue-400 cursor-pointer h-1"
                        />
                      </div>
                      <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                        <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                          <span>Sepia</span>
                          <span className="font-mono text-amber-300">{stagedBulkFilters.sepia}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={stagedBulkFilters.sepia}
                          onChange={e =>
                            setStagedBulkFilters(f => ({ ...f, sepia: Number(e.target.value) }))
                          }
                          className="w-full accent-amber-400 cursor-pointer h-1"
                        />
                      </div>
                      <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                        <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                          <span>Brightness</span>
                          <span className="font-mono text-emerald-300">{stagedBulkFilters.brightness}%</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={150}
                          value={stagedBulkFilters.brightness}
                          onChange={e =>
                            setStagedBulkFilters(f => ({ ...f, brightness: Number(e.target.value) }))
                          }
                          className="w-full accent-emerald-400 cursor-pointer h-1"
                        />
                      </div>
                      <div className="bg-slate-900/90 border border-blue-800 rounded-lg px-2.5 py-1.5">
                        <div className="flex justify-between font-bold text-slate-300 mb-0.5">
                          <span>Contrast</span>
                          <span className="font-mono text-indigo-300">{stagedBulkFilters.contrast}%</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={150}
                          value={stagedBulkFilters.contrast}
                          onChange={e =>
                            setStagedBulkFilters(f => ({ ...f, contrast: Number(e.target.value) }))
                          }
                          className="w-full accent-indigo-400 cursor-pointer h-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2B: Or Paste Direct Image URL */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Step 2B: Or Stage / Apply Direct Image Path / URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={bulkCustomUrl}
                  onChange={e => setBulkCustomUrl(e.target.value)}
                  placeholder="e.g. /assets/aistudio/... or https://..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (bulkCustomUrl.trim()) {
                      setStagedBulkFile(null);
                      setStagedBulkPreviewUrl(bulkCustomUrl.trim());
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold shrink-0 cursor-pointer"
                >
                  Preview in Grid
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyBulkUrl(bulkCustomUrl)}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                >
                  Apply Immediately
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Quick Pick from Uploaded Media Library */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Or Pick Any Uploaded Server Image to Preview or Apply
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stage any uploaded asset to visually compare it in the Product ID Preview Grid below, or apply it directly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {systemState.mediaLibrary.map(item => (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between"
                >
                  <div className="h-28 w-full bg-slate-200 relative">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                      {item.format}
                    </span>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setStagedBulkFile(null);
                          setStagedBulkPreviewUrl(item.url);
                        }}
                        className="py-1.5 px-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyBulkUrl(item.url)}
                        className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FULL-WIDTH VISUAL CONFIRMATION PREVIEW GRID OF TARGET PRODUCT IDs & EXISTING IMAGES */}
          <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Pre-Update Visual Confirmation Preview Grid
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Existing Product Images &amp; Product IDs in Selected Bulk Scope ({bulkTargetProducts.length} Products)
                </h3>
                <p className="text-xs text-slate-500">
                  Review the existing product images alongside their Product IDs below, or check products and click &ldquo;Delete Selected&rdquo; to bulk-remove incorrect image associations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const visibleIds = bulkTargetProducts.slice(0, 48).map(p => p.id);
                    const allChecked = visibleIds.every(id => selectedProductIds.has(id)) && visibleIds.length > 0;
                    if (allChecked) {
                      setSelectedProductIds(new Set());
                    } else {
                      setSelectedProductIds(new Set(visibleIds));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {selectedProductIds.size > 0
                      ? `Selected (${selectedProductIds.size})`
                      : 'Select All in Grid'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={selectedProductIds.size === 0 || isUploading}
                  onClick={() => handleDeleteSelectedAssociations()}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-black flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedProductIds.size})</span>
                </button>

                {stagedBulkPreviewUrl && (
                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                    Showing Before (Existing) → After (Staged) Comparison
                  </span>
                )}
              </div>
            </div>

            {bulkTargetProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                No products currently selected in this scope. Select products in Tab 1 or choose &ldquo;All Listed Products&rdquo; / &ldquo;Specific Category&rdquo; above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                {bulkTargetProducts.slice(0, 48).map(prod => {
                  const isChecked = selectedProductIds.has(prod.id);
                  return (
                    <div
                      key={`bulk-confirm-${prod.id}`}
                      className={`border rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between shadow-2xs transition-all ${
                        isChecked
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between gap-1.5">
                          <label className="flex items-center gap-1.5 min-w-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectProduct(prod.id)}
                              className="w-3.5 h-3.5 rounded border-slate-600 text-blue-600 cursor-pointer shrink-0"
                            />
                            <span className="font-mono text-[10px] font-black text-amber-300 truncate" title={prod.id}>
                              ID: {prod.id}
                            </span>
                          </label>
                          <span className="text-[9px] font-mono text-slate-400">
                            {productImageManagerService.detectFormatFromUrl(prod.images?.[0])}
                          </span>
                        </div>

                        {stagedBulkPreviewUrl ? (
                          <div className="grid grid-cols-2 divide-x divide-slate-200 h-28 bg-slate-100">
                            <div className="relative h-full overflow-hidden">
                              <SafeImage
                                src={prod.images?.[0]}
                                alt={prod.title}
                                productId={prod.id}
                                productTitle={prod.title}
                                category={prod.category}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase">
                                Existing
                              </span>
                            </div>
                            <div className="relative h-full overflow-hidden bg-slate-900">
                              <img
                                src={stagedBulkPreviewUrl}
                                alt="Staged New"
                                className="w-full h-full object-cover transition-all duration-200"
                                style={{
                                  transform: `rotate(${stagedBulkRotation}deg)`,
                                  filter: buildCssFilterString(stagedBulkFilters)
                                }}
                              />
                              <span className="absolute bottom-1 right-1 bg-blue-600 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase">
                                New {stagedBulkRotation !== 0 ? `(${stagedBulkRotation}°)` : hasActiveImageFilters(stagedBulkFilters) ? '(Filtered)' : ''}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative h-28 w-full bg-slate-200 overflow-hidden">
                            <SafeImage
                              src={prod.images?.[0]}
                              alt={prod.title}
                              productId={prod.id}
                              productTitle={prod.title}
                              category={prod.category}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Existing Image
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 space-y-0.5">
                        <div className="text-[10px] text-slate-500 truncate">{prod.category}</div>
                        <div className="text-[11px] font-bold text-slate-900 truncate" title={prod.title}>
                          {prod.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: REPLACE BY EXISTING IMAGE GROUP ACROSS WHOLE APP
      ===================================================================== */}
      {activeSubTab === 'BY_EXISTING_IMAGE' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="text-base font-black text-slate-900">
              Replace Any Existing Image Across All Products Using It
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              All {allProducts.length.toLocaleString()} listed products are grouped below by their current image. Upload a new JPG or any format image on any group to replace that image across every product that uses it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageGroups.map((group, idx) => (
              <div
                key={`${group.imageUrl}-${idx}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <SafeImage
                      src={group.imageUrl}
                      alt={group.products[0]?.title || 'Product Group Image'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/85 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                      Used by {group.products.length} Product{group.products.length === 1 ? '' : 's'}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-white/90 text-slate-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {productImageManagerService.detectFormatFromUrl(group.imageUrl)}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] font-mono text-slate-500 truncate" title={group.imageUrl}>
                      {group.imageUrl}
                    </div>
                    <div className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Sample products: </span>
                      {group.products
                        .slice(0, 2)
                        .map(p => p.title)
                        .join(' · ')}
                      {group.products.length > 2 && ` +${group.products.length - 2} more`}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <label className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>Upload &amp; Replace Across All {group.products.length} Products</span>
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleReplaceImageGroupWithFile(group.imageUrl, group.products, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: SERVER MEDIA LIBRARY & MULTI-FILE UPLOADER
      ===================================================================== */}
      {activeSubTab === 'MEDIA_LIBRARY' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Uploaded Server Media Library (`/assets/uploads` &amp; `/assets/aistudio`)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload single or multiple images in any format (JPG, PNG, WEBP, AVIF, SVG, GIF). Every uploaded image is saved to the server and can be assigned to any product or all products.
              </p>
            </div>

            <label className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm shrink-0">
              <Upload className="w-4 h-4" />
              <span>Upload New Image Files</span>
              <input
                ref={mediaLibraryInputRef}
                type="file"
                multiple
                accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                className="hidden"
                onChange={e => {
                  handleMediaLibraryMultiUpload(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {systemState.mediaLibrary.map(item => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 right-2.5 bg-slate-900/85 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {item.format}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate" title={item.url}>
                      {item.url}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0 space-y-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      const allIds = allProducts.map(p => p.id);
                      await productImageManagerService.setAllProductsImage(item.url, allIds);
                      await refreshState();
                      showToast('success', `Applied "${item.name}" to all ${allIds.length} listed products!`);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Apply to All Listed Products
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(item.url);
                      setCopiedUrl(item.url);
                      setTimeout(() => setCopiedUrl(null), 2000);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied Image Path!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Image URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: AUTOMATED B2B PORTAL & EXPORT SEO ENGINE (TOP SEARCH RANKER)
      ===================================================================== */}
      {activeSubTab === 'AUTO_SEO_ENGINE' && (() => {
        const sched = autoSeoEngine.getAutonomousSchedulerStatus();
        return (
        <div className="space-y-5">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>24/7/365 Autonomous 30-Min SEO Daemon Active</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold uppercase">
                    <span>Zero Permission Required (Admin Approval Bypassed)</span>
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">
                  Trade Heaven Automated B2B Portal &amp; Export SEO Engine
                </h2>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Runs automatically <strong>every 30 minutes, 24 hours a day, 365 days a year (48x/day · 17,520x/year)</strong> without anyone&apos;s permission—plus instantly on every <strong>Image</strong>, <strong>Product</strong>, or <strong>Article</strong> upload—to maximize B2B portal &amp; export search visibility and rank items <strong>#1 in the Search Bar</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    autoSeoEngine.registerCatalogForAutonomousSeo(allProducts);
                    const updatedSched = autoSeoEngine.runAutonomous30MinCycle('IMMEDIATE_VISIBILITY_BOOST');
                    setSeoRecords(autoSeoEngine.getAllSeoRecords());
                    showToast(
                      'success',
                      `Executed Autonomous SEO Cycle #${updatedSched.totalCyclesExecuted}! Next automatic 30-min cycle at ${new Date(updatedSched.nextRunAt).toLocaleTimeString()}.`
                    );
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Force Extra SEO Cycle Now</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New Product (Auto-SEO)</span>
                </button>
              </div>
            </div>

            {/* 24/7/365 Unconditional 30-Minute Scheduler Telemetry Grid */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="text-[10px] font-mono uppercase text-slate-400">Autonomous Schedule</div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">Every 30 Minutes (24/7/365)</div>
                <div className="text-[11px] text-slate-300 mt-0.5">48 runs/day · 17,520 runs/year</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="text-[10px] font-mono uppercase text-slate-400">Permission Governance</div>
                <div className="text-sm font-black text-amber-300 mt-0.5">Unconditional (No Permission)</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Runs without user or admin approval</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="text-[10px] font-mono uppercase text-slate-400">Last Auto-SEO Cycle</div>
                <div className="text-sm font-black text-white mt-0.5">
                  {new Date(sched.lastRunAt).toLocaleTimeString()}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Cycle #{sched.totalCyclesExecuted} · {seoRecords.length} items indexed
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="text-[10px] font-mono uppercase text-slate-400">Next Auto-SEO Cycle</div>
                <div className="text-sm font-black text-sky-300 mt-0.5">
                  {new Date(sched.nextRunAt).toLocaleTimeString()}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Auto-updates Sitemap &amp; JSON-LD @graph
                </div>
              </div>
            </div>


            {/* Filter & Search Bar for SEO Index */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'product', 'image', 'article'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSeoFilterType(type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer transition-colors ${
                      seoFilterType === type
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {type === 'ALL' ? `All Indexed (${seoRecords.length})` : `${type}s`}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={seoSearchTerm}
                  onChange={e => setSeoSearchTerm(e.target.value)}
                  placeholder="Search indexed SEO titles, B2B export keywords, or IDs..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SEO Records List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seoRecords
              .filter(r => seoFilterType === 'ALL' || r.entityType === seoFilterType)
              .filter(r => {
                if (!seoSearchTerm.trim()) return true;
                const q = seoSearchTerm.toLowerCase();
                return (
                  r.title.toLowerCase().includes(q) ||
                  r.seoTitle.toLowerCase().includes(q) ||
                  r.entityId.toLowerCase().includes(q) ||
                  r.keywords.some(k => k.toLowerCase().includes(q))
                );
              })
              .slice(0, 30)
              .map(rec => (
                <div
                  key={rec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={rec.imageUrl}
                          alt={rec.altText}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold uppercase">
                              {rec.entityType} · SEO {rec.seoScore}/100
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
                              #1 TOP SEARCH BOOST (+{rec.searchPriorityBoost})
                            </span>
                          </div>
                          <div className="text-xs font-black text-slate-900 truncate" title={rec.seoTitle}>
                            {rec.seoTitle}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            Canonical: {rec.canonicalUrl}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong className="text-slate-800">Meta Description:</strong> {rec.metaDescription}
                    </p>

                    <div className="text-[11px] text-slate-600">
                      <strong className="text-slate-800">Auto Image Alt Text:</strong>{' '}
                      <span className="italic">{rec.altText}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {rec.b2bExportTags.slice(0, 6).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Schema.org: {(rec.jsonLd as any)?.['@type'] || 'Product'} JSON-LD Active</span>
                    <span>Updated: {new Date(rec.updatedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
        );
      })()}

      {/* =====================================================================
          MODAL 1: SINGLE PRODUCT IMAGE & GALLERY MANAGER MODAL
      ===================================================================== */}
      {activeProductForModal && (
        <QuickProductImageModal
          product={activeProductForModal}
          onClose={() => setActiveProductForModal(null)}
          onSaved={async msg => {
            await refreshState();
            showToast('success', msg);
          }}
        />
      )}

      {/* =====================================================================
          MODAL 2: IMAGE CROPPING, 90° ROTATION & AI STUDIO BACKDROP OVERLAY
      ===================================================================== */}
      {croppingTarget && (
        <ImageEditingOverlay
          imageSrc={croppingTarget.imageUrl}
          imageName={croppingTarget.product.title}
          onClose={() => setCroppingTarget(null)}
          onSave={async editedDataUrl => {
            const targetProd = croppingTarget.product;
            setCroppingTarget(null);
            setIsUploading(true);
            try {
              const file = productImageManagerService.dataUrlToFile(
                editedDataUrl,
                `${targetProd.id}-edited.png`
              );
              await productImageManagerService.uploadAndAssignImageFile(file, {
                targetFormat: autoWebpLossless ? 'webp' : outputFormat,
                quality: autoWebpLossless ? 1.0 : jpegQuality,
                autoWebpLossless,
                productId: targetProd.id
              });
              await refreshState();
              showToast('success', `Saved rotated & edited image for "${targetProd.title.slice(0, 35)}..."!`);
            } finally {
              setIsUploading(false);
            }
          }}
        />
      )}

      {/* =====================================================================
          MODAL 3: STAGED BULK IMAGE 90° ROTATION & FILTER EDITING OVERLAY
      ===================================================================== */}
      {isEditingStagedBulkImage && stagedBulkPreviewUrl && (
        <ImageEditingOverlay
          imageSrc={stagedBulkPreviewUrl}
          imageName={stagedBulkFile ? stagedBulkFile.name : 'Staged Bulk Product Image'}
          initialRotation={stagedBulkRotation}
          initialFilters={stagedBulkFilters}
          onClose={() => setIsEditingStagedBulkImage(false)}
          onSave={(editedDataUrl, finalRotationDegrees, appliedFilters) => {
            const editedFile = productImageManagerService.dataUrlToFile(
              editedDataUrl,
              stagedBulkFile ? stagedBulkFile.name : 'staged-bulk-edited.png'
            );
            if (stagedBulkPreviewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(stagedBulkPreviewUrl);
            }
            setStagedBulkFile(editedFile);
            setStagedBulkPreviewUrl(editedDataUrl);
            setStagedBulkRotation(0);
            setStagedBulkFilters({ ...DEFAULT_IMAGE_EDIT_FILTERS });
            setIsEditingStagedBulkImage(false);
            const filterSummary =
              appliedFilters && hasActiveImageFilters(appliedFilters)
                ? ` & filters (G:${appliedFilters.grayscale}%, S:${appliedFilters.sepia}%, B:${appliedFilters.brightness}%, C:${appliedFilters.contrast}%)`
                : '';
            showToast(
              'success',
              `Applied ${finalRotationDegrees}° rotation${filterSummary} to staged bulk image! Click "Confirm & Apply Bulk Update" to save.`
            );
          }}
        />
      )}

      {/* =====================================================================
          EDIT PRODUCT DETAILS / ADD NEW PRODUCT MODAL
      ===================================================================== */}
      {(isAddingNewProduct || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white shrink-0">
                  {isAddingNewProduct ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    {isAddingNewProduct ? 'Add New Product to Marketplace Catalog' : `Edit All Details for Product (${productForm.id})`}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isAddingNewProduct
                      ? 'Specify complete product specs, pricing, MOQ, supplier info, and images to publish new listing.'
                      : 'Update title, category, price range, MOQ, unit, specifications, description, and photo gallery.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewProduct(false);
                  setEditingProduct(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProductForm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Basic Metadata */}
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                  1. Title, Category &amp; SKU ID
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="e.g. Gourmet Grade A Madagascar Bourbon Vanilla Beans"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Product ID / SKU *</label>
                    <input
                      type="text"
                      required
                      value={productForm.id}
                      onChange={e => setProductForm({ ...productForm, id: e.target.value })}
                      placeholder="e.g. prod-vanilla-001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      disabled={!isAddingNewProduct}
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Category *</label>
                    <input
                      type="text"
                      required
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="e.g. Vanilla Beans & Spices"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Sub-Category</label>
                    <input
                      type="text"
                      value={productForm.subCategory}
                      onChange={e => setProductForm({ ...productForm, subCategory: e.target.value })}
                      placeholder="e.g. Bourbon Gourmet Grade A"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing, MOQ & Sourcing Parameters */}
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                  2. Pricing, Minimum Order Quantity (MOQ) &amp; Origin
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">FOB Price ($ USD)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={productForm.priceUsd}
                      onChange={e => setProductForm({ ...productForm, priceUsd: Number(e.target.value) })}
                      placeholder="180"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Price Unit</label>
                    <input
                      type="text"
                      required
                      value={productForm.priceUnit}
                      onChange={e => setProductForm({ ...productForm, priceUnit: e.target.value })}
                      placeholder="Kg (e.g. $180 / Kg)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Minimum Order Quantity (MOQ)</label>
                    <input
                      type="number"
                      required
                      value={productForm.moq}
                      onChange={e => setProductForm({ ...productForm, moq: Number(e.target.value) })}
                      placeholder="1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">MOQ Unit</label>
                    <input
                      type="text"
                      required
                      value={productForm.moqUnit}
                      onChange={e => setProductForm({ ...productForm, moqUnit: e.target.value })}
                      placeholder="Kgs (e.g. Kgs, Units, Metric Tons)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Supplier / Exporter Name</label>
                    <input
                      type="text"
                      required
                      value={productForm.supplierName}
                      onChange={e => setProductForm({ ...productForm, supplierName: e.target.value })}
                      placeholder="e.g. Trade Heaven Exporters Ltd"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Supplier Country</label>
                    <input
                      type="text"
                      required
                      value={productForm.supplierCountry}
                      onChange={e => setProductForm({ ...productForm, supplierCountry: e.target.value })}
                      placeholder="e.g. Madagascar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Port of Dispatch / Location</label>
                    <input
                      type="text"
                      value={productForm.portOfDispatch}
                      onChange={e => setProductForm({ ...productForm, portOfDispatch: e.target.value })}
                      placeholder="e.g. Port of Toamasina"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Description & Specifications */}
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                  3. Description &amp; Technical Specifications
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Product Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Detailed wholesale product description, quality guarantees, packaging specs..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Specifications List Editor */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Key Specifications</label>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            specifications: [...productForm.specifications, { name: '', value: '' }]
                          })
                        }
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Spec Row</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {productForm.specifications.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Attribute (e.g. Grade, Moisture)"
                            value={spec.name}
                            onChange={e => {
                              const list = [...productForm.specifications];
                              list[idx].name = e.target.value;
                              setProductForm({ ...productForm, specifications: list });
                            }}
                            className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. Grade A Gourmet 16-18cm)"
                            value={spec.value}
                            onChange={e => {
                              const list = [...productForm.specifications];
                              list[idx].value = e.target.value;
                              setProductForm({ ...productForm, specifications: list });
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm({
                                ...productForm,
                                specifications: productForm.specifications.filter((_, i) => i !== idx)
                              })
                            }
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Image Gallery */}
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                  4. Product Image Gallery &amp; File Uploads
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">
                      Current Images ({productForm.images.length})
                    </label>

                    <label className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload &amp; Add File(s)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                        className="hidden"
                        onChange={async e => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          setIsUploading(true);
                          try {
                            const newUrls: string[] = [];
                            for (let i = 0; i < files.length; i++) {
                              const res = await productImageManagerService.uploadAndAssignImageFile(files[i], {
                                targetFormat: autoWebpLossless ? 'webp' : outputFormat,
                                quality: autoWebpLossless ? 1.0 : jpegQuality,
                                autoWebpLossless
                              });
                              newUrls.push(res.url);
                            }
                            setProductForm(prev => ({
                              ...prev,
                              images: [...prev.images, ...newUrls]
                            }));
                            showToast('success', `Uploaded & attached ${newUrls.length} image(s)!`);
                          } catch (err: any) {
                            showToast('error', err?.message || 'Upload failed');
                          } finally {
                            setIsUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {productForm.images.map((imgUrl, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group h-28">
                        <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 bg-slate-900/80 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {idx === 0 ? 'Primary' : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirmTarget({
                              mode: 'FORM_GALLERY_IMAGE',
                              product: editingProduct || undefined,
                              imageUrl: imgUrl,
                              imageIndex: idx
                            })
                          }
                          className="absolute top-1 right-1 p-1 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete Image (Confirmation Required)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add URL Field */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Paste image URL to attach..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setProductForm({
                              ...productForm,
                              images: [...productForm.images, val]
                            });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Live Automated B2B Portal & Export SEO Preview */}
              {(() => {
                const liveSeo = autoSeoEngine.previewProductSeo({
                  id: productForm.id,
                  title: productForm.title || 'New Wholesale Export Product',
                  category: productForm.category || 'Global B2B Export',
                  supplierName: productForm.supplierName || 'Trade Heaven Verified Exporter',
                  supplierCountry: productForm.supplierCountry || 'Global',
                  imageUrl: productForm.images[0],
                  price: `$${productForm.priceUsd} / ${productForm.priceUnit}`,
                  moq: `${productForm.moq} ${productForm.moqUnit}`
                }, true);
                return (
                  <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-emerald-600" />
                        <span>5. Automatic B2B Portal &amp; Export SEO (Auto-Generated on Save)</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold">
                        SEO SCORE: {liveSeo.seoScore}/100 · #1 TOP SEARCH BAR RANK
                      </span>
                    </div>
                    <div className="text-xs font-bold text-blue-800 truncate">
                      {liveSeo.seoTitle}
                    </div>
                    <div className="text-[11px] text-slate-700">
                      {liveSeo.metaDescription}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-800 truncate">
                      <strong>Auto Image Alt:</strong> {liveSeo.altText}
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {liveSeo.b2bExportTags.slice(0, 6).map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800 text-[10px] font-bold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewProduct(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAddingNewProduct ? 'Save & Auto-SEO Rank #1' : 'Save Changes & Update SEO'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CONFIRM PERMANENT IMAGE DELETION
      ===================================================================== */}
      {deleteConfirmTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setDeleteConfirmTarget(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                    Deletion Safety Check
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Confirm Image Removal
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                {deleteConfirmTarget.mode === 'BULK_SELECTED'
                  ? `Are you sure you want to permanently remove the custom image associations for ${deleteConfirmTarget.targetIds?.length || 0} selected product(s)?`
                  : deleteConfirmTarget.mode === 'FORM_GALLERY_IMAGE'
                    ? `Are you sure you want to permanently remove this gallery image (#${(deleteConfirmTarget.imageIndex ?? 0) + 1}) from "${deleteConfirmTarget.product?.title || productForm.title || 'this product'}"?`
                    : `Are you sure you want to permanently remove this image from "${deleteConfirmTarget.product?.title || 'this product'}" (ID: ${deleteConfirmTarget.product?.id || 'N/A'})?`}
              </p>

              {deleteConfirmTarget.imageUrl && (
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                    <SafeImage
                      src={deleteConfirmTarget.imageUrl}
                      alt={deleteConfirmTarget.product?.title || 'Target Image'}
                      productId={deleteConfirmTarget.product?.id}
                      productTitle={deleteConfirmTarget.product?.title}
                      category={deleteConfirmTarget.product?.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    {deleteConfirmTarget.product && (
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {deleteConfirmTarget.product.title}
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      {deleteConfirmTarget.imageUrl}
                    </div>
                    <div className="text-[10px] font-semibold text-rose-600">
                      This action prevents accidental deletions and will take effect immediately upon confirmation.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleExecuteConfirmedDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm &amp; Permanently Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkPlaceholderModalOpen && (
        <BulkAssignPlaceholderModal
          selectedCount={selectedProductIds.size}
          selectedProductIds={selectedProductIds}
          allProducts={allProducts}
          onClose={() => setIsBulkPlaceholderModalOpen(false)}
          onApplied={async (msg) => {
            await refreshState();
            showToast('success', msg);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// REUSABLE QUICK PRODUCT IMAGE UPLOAD & GALLERY MODAL (USABLE ANYWHERE BY ADMIN)
// ============================================================================
export interface QuickProductImageModalProps {
  product: Product;
  onClose: () => void;
  onSaved?: (message: string) => void;
}

export const QuickProductImageModal: React.FC<QuickProductImageModalProps> = ({
  product,
  onClose,
  onSaved
}) => {
  const [outputFormat, setOutputFormat] = useState<OutputImageFormat>('jpg');
  const existingOverride = productImageManagerService.getState().overrides[product.id];
  const [beforePrimaryUrl, setBeforePrimaryUrl] = useState<string>(
    existingOverride?.previousPrimary || product.images?.[0] || ''
  );
  const [primaryUrl, setPrimaryUrl] = useState<string>(
    existingOverride?.primary || product.images?.[0] || ''
  );
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    existingOverride?.gallery && existingOverride.gallery.length > 0
      ? [...existingOverride.gallery]
      : product.images && product.images.length > 0
      ? [...product.images]
      : ['']
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [pendingGalleryDeleteIndex, setPendingGalleryDeleteIndex] = useState<number | null>(null);
  const [galleryUndoState, setGalleryUndoState] = useState<{
    previousGallery: string[];
    previousPrimary: string;
    secondsLeft: number;
  } | null>(null);
  const galleryUndoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const galleryUndoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mediaLibrary, setMediaLibrary] = useState<MediaLibraryItem[]>(
    () => productImageManagerService.getState().mediaLibrary
  );

  const clearGalleryUndoTimers = () => {
    if (galleryUndoTimerRef.current) {
      clearTimeout(galleryUndoTimerRef.current);
      galleryUndoTimerRef.current = null;
    }
    if (galleryUndoIntervalRef.current) {
      clearInterval(galleryUndoIntervalRef.current);
      galleryUndoIntervalRef.current = null;
    }
  };

  useEffect(() => {
    productImageManagerService.syncFromServer().then(st => {
      setMediaLibrary(st.mediaLibrary);
    });
    return () => clearGalleryUndoTimers();
  }, []);

  const handleFileUpload = async (file: File, applyToAllProducts = false) => {
    setIsUploading(true);
    try {
      const currentBefore = primaryUrl;
      const res = await productImageManagerService.uploadAndAssignImageFile(file, {
        targetFormat: outputFormat,
        quality: 0.92,
        productId: applyToAllProducts ? undefined : product.id,
        applyToAll: applyToAllProducts,
        productIds: applyToAllProducts ? MOCK_PRODUCTS.map(p => p.id) : undefined
      });
      if (currentBefore && currentBefore !== res.url) {
        setBeforePrimaryUrl(currentBefore);
      }
      setPrimaryUrl(res.url);
      setGalleryUrls(prev => [res.url, ...prev.filter(u => u && u !== res.url)]);
      setMediaLibrary(productImageManagerService.getState().mediaLibrary);
      await productImageManagerService.forceSyncToServer();
      if (onSaved) {
        onSaved(
          applyToAllProducts
            ? `Uploaded ${res.format} image & applied to ALL listed products!`
            : `Uploaded new ${res.format} image for "${product.title.slice(0, 40)}..."`
        );
      }
      if (applyToAllProducts) {
        onClose();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrimary = primaryUrl.trim() || galleryUrls.find(Boolean) || '';
    if (!cleanPrimary) return;
    const cleanGallery = [cleanPrimary, ...galleryUrls.map(u => u.trim()).filter(u => u && u !== cleanPrimary)];
    setIsUploading(true);
    try {
      await productImageManagerService.setProductImage(product.id, cleanPrimary, cleanGallery);
      await productImageManagerService.forceSyncToServer();
      if (onSaved) {
        onSaved(`Saved updated product image(s) for "${product.title.slice(0, 40)}..."`);
      }
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddGalleryUrl = () => {
    const clean = newGalleryUrl.trim();
    if (!clean) return;
    if (!primaryUrl) setPrimaryUrl(clean);
    setGalleryUrls(prev => [...prev.filter(Boolean), clean]);
    setNewGalleryUrl('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-900">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="min-w-0 pr-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              Admin Product Image &amp; Format Controller
            </div>
            <h3 className="text-sm sm:text-base font-black truncate">{product.title}</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Product ID: {product.id} · Category: {product.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSaveChanges} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Row: Side-by-Side BEFORE & AFTER Preview + Upload File Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Before & After Primary Image Comparison */}
            <div className="md:col-span-6 flex flex-col">
              <label className="text-[11px] font-bold text-slate-600 uppercase mb-1.5 flex items-center justify-between">
                <span>Before &amp; After Product Image</span>
                <span className="text-[10px] font-bold text-emerald-600">Live Server Sync</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5 flex-1">
                {/* BEFORE */}
                <div className="flex flex-col rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <div className="bg-slate-800 text-slate-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 flex items-center justify-between">
                    <span>BEFORE</span>
                    <span className="text-[9px] text-slate-400">Previous</span>
                  </div>
                  <div className="relative flex-1 min-h-[150px] bg-slate-100">
                    <img
                      src={beforePrimaryUrl || primaryUrl}
                      alt={`Before ${product.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {/* AFTER */}
                <div className="flex flex-col rounded-xl overflow-hidden bg-emerald-50/40 border-2 border-emerald-500 shadow-xs">
                  <div className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 flex items-center justify-between">
                    <span>AFTER</span>
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">LIVE</span>
                  </div>
                  <div className="relative flex-1 min-h-[150px] bg-slate-100">
                    <SafeImage
                      src={primaryUrl}
                      alt={product.title}
                      productId={product.id}
                      productTitle={product.title}
                      category={product.category}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-slate-900/85 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {productImageManagerService.detectFormatFromUrl(primaryUrl)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload & Format Converter */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">
                    Upload New Image (JPG or Any Format)
                  </label>
                  <select
                    value={outputFormat}
                    onChange={e => setOutputFormat(e.target.value as OutputImageFormat)}
                    className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-800"
                  >
                    <option value="jpg">Save as .JPG (Standard)</option>
                    <option value="png">Save as .PNG</option>
                    <option value="webp">Save as .WEBP</option>
                    <option value="original">Keep Original Format</option>
                  </select>
                </div>

                <label className="border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50/80 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-blue-600 mb-1.5" />
                  <span className="text-xs font-black text-slate-900">
                    {isUploading ? 'Uploading & Converting...' : 'Click to Upload New Image for This Product'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Supports JPG, JPEG, PNG, WEBP, AVIF, GIF, SVG, BMP
                  </span>
                  <input
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                    className="hidden"
                    disabled={isUploading}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, false);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {/* Optional: Upload & Apply to ALL Products */}
              <label className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Or Upload Image &amp; Apply to ALL Listed Products in App</span>
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.bmp"
                  className="hidden"
                  disabled={isUploading}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, true);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>

          {/* Direct Image URL Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase block">
              Primary Image URL or Local Asset Path (`.jpg`, `.png`, `.webp`, etc.)
            </label>
            <input
              type="text"
              value={primaryUrl}
              onChange={e => {
                setPrimaryUrl(e.target.value);
                setGalleryUrls(prev => [e.target.value, ...prev.slice(1)]);
              }}
              placeholder="/assets/uploads/... or https://..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Gallery Images Management */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 uppercase block">
              Product Gallery Images ({galleryUrls.filter(Boolean).length})
            </label>
            <div className="flex flex-wrap gap-2">
              {galleryUrls.filter(Boolean).map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 group ${
                    url === primaryUrl ? 'border-blue-600' : 'border-slate-200'
                  }`}
                >
                  <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {url !== primaryUrl && (
                      <button
                        type="button"
                        onClick={() => setPrimaryUrl(url)}
                        className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold cursor-pointer"
                      >
                        Set Main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPendingGalleryDeleteIndex(idx)}
                      className="p-1 rounded bg-rose-600 text-white cursor-pointer"
                      title="Delete Gallery Image (Confirmation Required)"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pendingGalleryDeleteIndex !== null && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-rose-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Confirm permanent removal of gallery image #{pendingGalleryDeleteIndex + 1}?
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPendingGalleryDeleteIndex(null)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const prevList = galleryUrls.filter(Boolean);
                      const prevPrim = primaryUrl;
                      const targetUrl = prevList[pendingGalleryDeleteIndex];
                      const next = prevList.filter((_, i) => i !== pendingGalleryDeleteIndex);
                      setGalleryUrls(next.length > 0 ? next : ['']);
                      if (targetUrl === primaryUrl) {
                        setPrimaryUrl(next[0] || '');
                      }
                      setPendingGalleryDeleteIndex(null);

                      // Start 5-second Undo toast inside QuickProductImageModal
                      clearGalleryUndoTimers();
                      setGalleryUndoState({
                        previousGallery: prevList,
                        previousPrimary: prevPrim,
                        secondsLeft: 5
                      });
                      const startedAt = Date.now();
                      galleryUndoIntervalRef.current = setInterval(() => {
                        const elapsed = Date.now() - startedAt;
                        const remaining = Math.max(1, Math.ceil((5000 - elapsed) / 1000));
                        setGalleryUndoState(prev => (prev ? { ...prev, secondsLeft: remaining } : null));
                      }, 250);
                      galleryUndoTimerRef.current = setTimeout(() => {
                        clearGalleryUndoTimers();
                        setGalleryUndoState(null);
                      }, 5000);
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}

            {galleryUndoState && (
              <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gallery image removed.</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryUrls(galleryUndoState.previousGallery);
                      setPrimaryUrl(galleryUndoState.previousPrimary);
                      clearGalleryUndoTimers();
                      setGalleryUndoState(null);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Undo ({galleryUndoState.secondsLeft}s)</span>
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newGalleryUrl}
                onChange={e => setNewGalleryUrl(e.target.value)}
                placeholder="Add additional gallery image URL..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Gallery</span>
              </button>
            </div>
          </div>

          {/* Quick Pick from Server Media Library */}
          {mediaLibrary.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-600 uppercase block">
                Or Pick From Uploaded Server Media Library
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 max-h-40 overflow-y-auto p-1">
                {mediaLibrary.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPrimaryUrl(item.url);
                      setGalleryUrls(prev => [item.url, ...prev.filter(u => u && u !== item.url)]);
                    }}
                    className={`rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                      primaryUrl === item.url ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="h-16 w-full bg-slate-100">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-1 text-[9px] font-bold text-slate-700 truncate">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const clean = primaryUrl.trim();
                  if (!clean) return;
                  await productImageManagerService.setAllProductsImage(clean, MOCK_PRODUCTS.map(p => p.id));
                  if (onSaved) onSaved('Applied this image to ALL listed products across the app!');
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Save &amp; Apply to All Products
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Product Image</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export interface BulkAssignPlaceholderModalProps {
  selectedCount: number;
  selectedProductIds: Set<string>;
  allProducts: Product[];
  onClose: () => void;
  onApplied: (message: string) => void;
}

export const VERIFIED_PLACEHOLDERS = [
  {
    id: 'vanilla-spices',
    title: 'Gourmet Vanilla Beans & Spices',
    category: 'Agriculture & Spices',
    url: '/assets/aistudio/sidath-vimukthi-fIGw-jVGy5g-unsplash_c8b9928d.jpg'
  },
  {
    id: 'port-shipping',
    title: 'Cargo Ships & Maritime Port Logistics',
    category: 'Industrial Shipping & Port',
    url: '/assets/aistudio/vecteezy_in-the-evening-cargo-ships-oil-ships-dock-at-the-port_4639072_54378ca6.jpg'
  },
  {
    id: 'agri-grains',
    title: 'Bulk Grains, Harvest & Agriculture',
    category: 'Agriculture & Food',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'machinery-industry',
    title: 'Heavy Industrial Machinery & Equipment',
    category: 'Machinery & Tools',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'apparel-textiles',
    title: 'Textiles, Fabrics & Apparel Wholesale',
    category: 'Textiles & Garments',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'construction-materials',
    title: 'Steel, Cement & Construction Supplies',
    category: 'Construction & Building',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'gold-bullion',
    title: 'Refined Gold Bars & Precious Metals',
    category: 'Metals & Mining',
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'seafood-coldstorage',
    title: 'Fresh Seafood & Cold Storage Logistics',
    category: 'Seafood & Cold Chain',
    url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80'
  }
];

export const BulkAssignPlaceholderModal: React.FC<BulkAssignPlaceholderModalProps> = ({
  selectedCount,
  selectedProductIds,
  allProducts,
  onClose,
  onApplied
}) => {
  const [selectedUrl, setSelectedUrl] = useState<string>(VERIFIED_PLACEHOLDERS[0].url);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const selectedProductsList = useMemo(() => {
    return allProducts.filter(p => selectedProductIds.has(p.id));
  }, [allProducts, selectedProductIds]);

  const effectiveUrl = customUrlInput.trim() || selectedUrl;

  const handleApply = async () => {
    if (!effectiveUrl) return;
    setIsApplying(true);
    try {
      const ids = Array.from(selectedProductIds);
      await productImageManagerService.setBulkProductImages(ids, effectiveUrl);
      onApplied(`Successfully assigned verified placeholder image to ${ids.length} selected product(s).`);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                Admin Bulk Operations
              </span>
              <span className="text-xs font-bold text-slate-500">
                {selectedCount} Item(s) Selected
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Bulk Assign Verified Placeholder Image
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Items Preview */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Target Selected Items ({selectedProductsList.length}):</span>
            <span className="text-[11px] text-slate-500 font-normal">All selected products will be assigned this verified image</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {selectedProductsList.map(p => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-800 shadow-2xs"
              >
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[160px]">{p.title}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Preset Verified Placeholders Grid */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Select a Verified Placeholder Preset:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
            {VERIFIED_PLACEHOLDERS.map(item => {
              const isSelected = selectedUrl === item.url && !customUrlInput.trim();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedUrl(item.url);
                    setCustomUrlInput('');
                  }}
                  className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all p-1.5 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="relative h-20 w-full rounded-xl overflow-hidden bg-slate-100">
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white rounded-full p-1 shadow-sm">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="pt-2 px-1 space-y-0.5">
                    <div className="text-[11px] font-black text-slate-900 line-clamp-1">{item.title}</div>
                    <div className="text-[9px] font-semibold text-slate-500">{item.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Or Custom URL Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Or Enter Custom Verified Image URL:
          </label>
          <input
            type="url"
            value={customUrlInput}
            onChange={e => setCustomUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-... or /assets/..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isApplying || !effectiveUrl}
            onClick={handleApply}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Placeholder to {selectedCount} Selected Item(s)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductImageAdmin = DedicatedProductImageSystem;

