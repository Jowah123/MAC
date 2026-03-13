'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Upload, Download, Eye, Trash2, Edit, Package, X, Shield, ShieldOff, AlertTriangle, GitCompare, CheckSquare, Square, Check, ArrowLeft } from 'lucide-react';
import type { Product } from '@/types/product';

// 完整的表头定义（24个字段）
const ALL_COLUMNS = [
  { key: 'sku', label: 'SKU', width: 150 },
  { key: 'brand', label: '品牌', width: 100 },
  { key: 'model', label: '型号', width: 100 },
  { key: 'name', label: '名称', width: 120 },
  { key: 'product_no', label: '货号', width: 100 },
  { key: 'color', label: '配色', width: 80 },
  { key: 'size', label: '尺码', width: 100 },
  { key: 'price', label: '吊牌价', width: 80 },
  { key: 'gender', label: '性别', width: 60 },
  { key: 'features', label: '功能', width: 150 },
  { key: 'upper_function', label: '鞋面功能', width: 100 },
  { key: 'midsole_function', label: '中底功能', width: 100 },
  { key: 'outsole_function', label: '外底功能', width: 100 },
  { key: 'upper_tech', label: '鞋面科技', width: 120 },
  { key: 'midsole_tech', label: '中底科技', width: 120 },
  { key: 'outsole_tech', label: '外底科技', width: 120 },
  { key: 'upper_material', label: '鞋面材质', width: 100 },
  { key: 'midsole_material', label: '中底材质', width: 100 },
  { key: 'outsole_material', label: '外底材质', width: 100 },
  { key: 'applicable_venue', label: '适用场地', width: 120 },
  { key: 'recommended_scenario', label: '推荐场景', width: 150 },
  { key: 'applicable_season', label: '适用季节', width: 80 },
  { key: 'closure_type', label: '闭合方式', width: 80 },
  { key: 'pace_distance', label: '配速/距离', width: 100 },
];

// 表单字段分组
const FORM_GROUPS: Record<string, {
  title: string;
  fields: { key: string; label: string; required?: boolean }[];
}> = {
  basic: {
    title: '基础信息',
    fields: [
      { key: 'sku', label: 'SKU' },
      { key: 'brand', label: '品牌' },
      { key: 'model', label: '型号' },
      { key: 'name', label: '名称', required: true },
      { key: 'product_no', label: '货号' },
      { key: 'color', label: '配色' },
      { key: 'size', label: '尺码' },
      { key: 'price', label: '吊牌价' },
      { key: 'gender', label: '性别' },
      { key: 'category', label: '分类' },
    ],
  },
  function: {
    title: '功能特性',
    fields: [
      { key: 'features', label: '功能' },
      { key: 'upper_function', label: '鞋面功能' },
      { key: 'midsole_function', label: '中底功能' },
      { key: 'outsole_function', label: '外底功能' },
    ],
  },
  tech: {
    title: '科技特性',
    fields: [
      { key: 'upper_tech', label: '鞋面科技' },
      { key: 'midsole_tech', label: '中底科技' },
      { key: 'outsole_tech', label: '外底科技' },
    ],
  },
  material: {
    title: '材质信息',
    fields: [
      { key: 'upper_material', label: '鞋面材质' },
      { key: 'midsole_material', label: '中底材质' },
      { key: 'outsole_material', label: '外底材质' },
    ],
  },
  usage: {
    title: '适用信息',
    fields: [
      { key: 'applicable_venue', label: '适用场地' },
      { key: 'recommended_scenario', label: '推荐场景' },
      { key: 'applicable_season', label: '适用季节' },
      { key: 'closure_type', label: '闭合方式' },
      { key: 'pace_distance', label: '配速/距离' },
    ],
  },
};

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brand, setSearchBrand] = useState('');
  const [productNo, setSearchProductNo] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // 管理模式（默认关闭，普通用户只能查看）
  const [managementMode, setManagementMode] = useState(false);
  
  // 产品详情侧边栏
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // 新增/编辑产品表单
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  // 删除确认对话框
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // 管理模式密码验证
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // 产品对比功能
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  
  // 对比对话框滚动同步
  const compareTopScrollRef = useRef<HTMLDivElement>(null);
  const compareContentScrollRef = useRef<HTMLDivElement>(null);

  // 获取产品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (brand) params.append('brand', brand);
      if (productNo) params.append('product_no', productNo);

      const response = await fetch(`/api/products?${params.toString()}`);
      const result = await response.json();
      
      if (result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('获取产品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, brand, productNo]);

  // 验证管理模式密码
  const handlePasswordVerify = () => {
    if (passwordInput === 'admin') {
      setManagementMode(true);
      setPasswordDialogOpen(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('密码错误，请重试');
      setPasswordInput('');
    }
  };

  // 产品对比功能
  const toggleProductSelection = (productId: number) => {
    const newSet = new Set(selectedProductIds);
    if (newSet.has(productId)) {
      newSet.delete(productId);
    } else {
      if (newSet.size >= 4) {
        alert('最多只能选择4个产品进行对比');
        return;
      }
      newSet.add(productId);
    }
    setSelectedProductIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      const newSet = new Set<number>();
      products.slice(0, 4).forEach(p => newSet.add(p.id));
      if (products.length > 4) {
        alert('已选择前4个产品，最多支持对比4个产品');
      }
      setSelectedProductIds(newSet);
    }
  };

  const openCompare = () => {
    if (selectedProductIds.size < 2) {
      alert('请至少选择2个产品进行对比');
      return;
    }
    setCompareDialogOpen(true);
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedProductIds(new Set());
  };

  // 获取选中的产品列表
  const selectedProducts = products.filter(p => selectedProductIds.has(p.id));

  // 对比字段定义
  const COMPARE_FIELDS = [
    { group: '基础信息', fields: ['sku', 'brand', 'model', 'name', 'product_no', 'color', 'size', 'price', 'gender'] },
    { group: '功能特性', fields: ['features', 'upper_function', 'midsole_function', 'outsole_function'] },
    { group: '科技配置', fields: ['upper_tech', 'midsole_tech', 'outsole_tech'] },
    { group: '材质信息', fields: ['upper_material', 'midsole_material', 'outsole_material'] },
    { group: '适用信息', fields: ['applicable_venue', 'recommended_scenario', 'applicable_season', 'closure_type', 'pace_distance'] },
  ];

  // 检查字段值是否在选中的产品中有差异
  const hasDifference = (fieldKey: string) => {
    const values = selectedProducts.map(p => p[fieldKey as keyof Product] ?? '-');
    return new Set(values).size > 1;
  };

  // 打开产品详情
  const openProductDetail = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`);
      const result = await response.json();
      if (result.data) {
        setSelectedProduct(result.data);
        setFormData({});
        setEditMode(false);
        setDetailOpen(true);
      }
    } catch (error) {
      console.error('获取产品详情失败:', error);
    }
  };

  // 打开新增产品
  const openAddProduct = () => {
    setSelectedProduct(null);
    setFormData({ name: '' });
    setEditMode(true);
    setDetailOpen(true);
  };

  // 保存产品
  const handleSaveProduct = async () => {
    try {
      if (!formData.name) {
        alert('请填写产品名称');
        return;
      }

      const url = selectedProduct ? `/api/products/${selectedProduct.id}` : '/api/products';
      const method = selectedProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.data) {
        setDetailOpen(false);
        fetchProducts();
      } else {
        alert(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存产品失败:', error);
      alert('保存产品失败');
    }
  };

  // 打开删除确认对话框
  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmName('');
    setDeleteConfirmOpen(true);
  };

  // 确认删除产品
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    // 验证输入的产品名称是否正确
    if (deleteConfirmName.trim() !== productToDelete.name) {
      alert('输入的产品名称不正确，请重新输入');
      return;
    }

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        setDeleteConfirmOpen(false);
        setDetailOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        alert(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除产品失败:', error);
      alert('删除产品失败');
    }
  };

  // 删除产品（旧方法，保留兼容）
  const handleDeleteProduct = async (id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      openDeleteConfirm(product);
    }
  };

  // 处理文件上传（支持Excel和TXT/CSV）
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await fetch('/api/products/upload', {
        method: 'POST',
        body: formDataObj,
      });

      const result = await response.json();

      if (result.success) {
        alert(`成功上传 ${result.count} 个产品`);
        setUploadDialogOpen(false);
        fetchProducts();
      } else {
        alert(result.error || '上传失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      alert(error instanceof Error ? error.message : '文件上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 下载TXT模板
  const downloadTemplate = () => {
    const headers = ALL_COLUMNS.map(c => c.label);
    const template = headers.join('\t') + '\n' + headers.map(() => '').join('\t');
    const blob = new Blob(['\ufeff' + template], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '产品导入模板.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 下载Excel模板
  const downloadExcelTemplate = async () => {
    const XLSX = await import('xlsx');
    const headers = ALL_COLUMNS.map(c => c.label);
    
    const sampleData = [
      '10211031074161', '李宁', '飞电6Ultra', '飞电6', 'ARMW005-2', '香槟白', 
      '36-45码', '2299', '男/女', '包裹性 减震 耐磨', '透气', '支撑', '耐磨',
      '李宁䨻丝科技', '李宁弜', '橡胶大底', '织物', '碳板', 'PU(聚氨酯)',
      '跑道 公路 小道', '竞赛训练、赛事竞速', '四季通用', '系带', '4-5分配'
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '产品数据');
    ws['!cols'] = headers.map(() => ({ wch: 15 }));
    XLSX.writeFile(wb, '产品导入模板.xlsx');
  };

  // 渲染表单字段
  const renderFormFields = (groupKey: string) => {
    const group = FORM_GROUPS[groupKey];
    if (!group) return null;
    
    return (
      <div className="space-y-4 px-1">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {group.fields.map(field => {
            const fieldValue = selectedProduct?.[field.key as keyof Product];
            const displayValue = fieldValue !== null && fieldValue !== undefined && typeof fieldValue !== 'object' 
              ? String(fieldValue) 
              : '';
            
            return (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key} className="text-xs">
                  {field.label}{field.required && <span className="text-destructive"> *</span>}
                </Label>
                <Input
                  id={field.key}
                  value={editMode ? (formData[field.key] || '') : displayValue || '-'}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  disabled={!editMode}
                  placeholder={editMode ? `请输入${field.label}` : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染只读详情
  const renderDetailValue = (value: string | null | undefined) => {
    return value || '-';
  };

  return (
    <div className="container mx-auto p-6 max-w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Package className="w-6 h-6" />
              京东产品知识库
              {managementMode && (
                <Badge variant="destructive" className="ml-2">
                  管理模式
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2 flex-wrap items-center">
              {/* 管理模式切换按钮 */}
              <Button
                variant={managementMode ? "destructive" : "outline"}
                onClick={() => {
                  if (managementMode) {
                    // 退出管理模式
                    setManagementMode(false);
                    setEditMode(false);
                  } else {
                    // 进入管理模式 - 弹出密码验证
                    setPasswordDialogOpen(true);
                    setPasswordInput('');
                    setPasswordError('');
                  }
                }}
              >
                {managementMode ? (
                  <>
                    <ShieldOff className="w-4 h-4 mr-2" />
                    退出管理模式
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    进入管理模式
                  </>
                )}
              </Button>
              
              {/* 仅在管理模式下显示的操作按钮 */}
              {managementMode && (
                <>
                  <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    批量上传
                  </Button>
                  <Button onClick={openAddProduct}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增产品
                  </Button>
                </>
              )}
              
              {/* 产品对比按钮 */}
              <Button
                variant={compareMode ? "default" : "outline"}
                onClick={() => {
                  if (compareMode) {
                    exitCompareMode();
                  } else {
                    setCompareMode(true);
                  }
                }}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                {compareMode ? '退出对比' : '产品对比'}
              </Button>
              
              {/* 对比模式下的操作 */}
              {compareMode && (
                <>
                  <Badge variant="secondary" className="px-3 py-1">
                    已选 {selectedProductIds.size}/4 个产品
                  </Badge>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={openCompare}
                    disabled={selectedProductIds.size < 2}
                  >
                    开始对比
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {selectedProductIds.size === products.length ? '取消全选' : '全选'}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* 搜索和筛选 */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="搜索SKU、名称、品牌或型号..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Input
              className="w-40"
              placeholder="货号搜索"
              value={productNo}
              onChange={(e) => setSearchProductNo(e.target.value)}
            />
            <Input
              className="w-36"
              placeholder="品牌筛选"
              value={brand}
              onChange={(e) => setSearchBrand(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">加载中...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无产品数据，点击"新增产品"或"批量上传"开始添加
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {compareMode && (
                      <TableHead className="sticky left-0 bg-muted/50 z-20 w-12 text-center">
                        <span className="text-xs">选择</span>
                      </TableHead>
                    )}
                    <TableHead className="sticky left-0 bg-muted/50 z-20 w-12 text-center">序号</TableHead>
                    {ALL_COLUMNS.map(col => (
                      <TableHead 
                        key={col.key} 
                        style={{ minWidth: col.width }}
                        className="whitespace-nowrap font-medium"
                      >
                        {col.label}
                      </TableHead>
                    ))}
                    <TableHead className="sticky right-0 bg-muted/50 z-20 w-20 text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className={`cursor-pointer hover:bg-muted/50 ${selectedProductIds.has(product.id) ? 'bg-primary/10' : ''}`}
                      onClick={() => {
                        if (compareMode) {
                          toggleProductSelection(product.id);
                        } else {
                          openProductDetail(product);
                        }
                      }}
                    >
                      {compareMode && (
                        <TableCell 
                          className="sticky left-0 bg-background z-10 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="p-1"
                            onClick={() => toggleProductSelection(product.id)}
                          >
                            {selectedProductIds.has(product.id) ? (
                              <CheckSquare className="w-5 h-5 text-primary" />
                            ) : (
                              <Square className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        </TableCell>
                      )}
                      <TableCell className={`sticky left-0 z-10 text-center font-medium ${compareMode ? '' : 'bg-background'}`}>
                        {index + 1}
                      </TableCell>
                      {ALL_COLUMNS.map(col => (
                        <TableCell 
                          key={col.key} 
                          className="whitespace-nowrap max-w-[200px] truncate"
                          title={product[col.key as keyof Product] as string || ''}
                        >
                          {col.key === 'price' && product.price ? `¥${product.price}` : 
                           (product[col.key as keyof Product] as string || '-')}
                        </TableCell>
                      ))}
                      <TableCell className="sticky right-0 bg-background z-10">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openProductDetail(product);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {managementMode && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* 产品数量统计 */}
          <div className="mt-4 text-sm text-muted-foreground">
            共 {products.length} 个产品
          </div>
        </CardContent>
      </Card>

      {/* 产品详情侧边栏 */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center justify-between pr-8">
              <SheetTitle>
                {editMode ? (selectedProduct ? '编辑产品' : '新增产品') : '产品详情'}
              </SheetTitle>
              <div className="flex gap-2">
                {editMode ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => {
                      if (selectedProduct) {
                        setEditMode(false);
                        setFormData({});
                      } else {
                        setDetailOpen(false);
                      }
                    }}>
                      取消
                    </Button>
                    <Button size="sm" onClick={handleSaveProduct}>
                      保存
                    </Button>
                  </>
                ) : (
                  <>
                    {/* 仅在管理模式下显示编辑/删除按钮 */}
                    {managementMode && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const productData: Record<string, string> = {};
                            Object.keys(selectedProduct || {}).forEach(key => {
                              const value = selectedProduct?.[key as keyof Product];
                              if (value !== null && key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'parameters') {
                                productData[key] = String(value);
                              }
                            });
                            setFormData(productData);
                            setEditMode(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => selectedProduct && openDeleteConfirm(selectedProduct)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          删除
                        </Button>
                      </>
                    )}
                    {!managementMode && (
                      <Badge variant="outline" className="text-muted-foreground">
                        只读模式
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </SheetHeader>
          
          <div className="mt-4 px-2 space-y-6">
            {editMode ? (
              // 编辑模式 - 保持分页
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="basic">基础</TabsTrigger>
                  <TabsTrigger value="function">功能</TabsTrigger>
                  <TabsTrigger value="tech">科技</TabsTrigger>
                  <TabsTrigger value="material">材质</TabsTrigger>
                  <TabsTrigger value="usage">适用</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="mt-4">
                  {renderFormFields('basic')}
                </TabsContent>
                <TabsContent value="function" className="mt-4">
                  {renderFormFields('function')}
                </TabsContent>
                <TabsContent value="tech" className="mt-4">
                  {renderFormFields('tech')}
                </TabsContent>
                <TabsContent value="material" className="mt-4">
                  {renderFormFields('material')}
                </TabsContent>
                <TabsContent value="usage" className="mt-4">
                  {renderFormFields('usage')}
                </TabsContent>
              </Tabs>
            ) : (
              // 只读模式 - 展示所有信息
              <>
                {/* 快捷导航 */}
                <div className="flex gap-2 flex-wrap sticky top-0 bg-background py-2 z-10 border-b">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('section-basic')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    基础信息
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('section-function')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    功能特性
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('section-tech')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    科技配置
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('section-material')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    材质信息
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('section-usage')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    适用信息
                  </Button>
                </div>

                {/* 基础信息 */}
                <div id="section-basic" className="scroll-mt-16">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    基础信息
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-muted/30 rounded-lg p-4">
                    {FORM_GROUPS.basic.fields.map(field => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <div className="font-medium text-sm">
                          {field.key === 'price' && selectedProduct?.price 
                            ? `¥${selectedProduct.price}` 
                            : renderDetailValue(selectedProduct?.[field.key as keyof Product] as string)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 功能特性 */}
                <div id="section-function" className="scroll-mt-16">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    功能特性
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-muted/30 rounded-lg p-4">
                    {FORM_GROUPS.function.fields.map(field => (
                      <div key={field.key} className="col-span-2 first:col-span-2 space-y-1">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <div className="font-medium text-sm">
                          {renderDetailValue(selectedProduct?.[field.key as keyof Product] as string)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 科技配置 */}
                <div id="section-tech" className="scroll-mt-16">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    科技配置
                  </h3>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-3 bg-muted/30 rounded-lg p-4">
                    {FORM_GROUPS.tech.fields.map(field => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <div className="font-medium text-sm">
                          {renderDetailValue(selectedProduct?.[field.key as keyof Product] as string)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 材质信息 */}
                <div id="section-material" className="scroll-mt-16">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    材质信息
                  </h3>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-3 bg-muted/30 rounded-lg p-4">
                    {FORM_GROUPS.material.fields.map(field => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <div className="font-medium text-sm">
                          {renderDetailValue(selectedProduct?.[field.key as keyof Product] as string)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 适用信息 */}
                <div id="section-usage" className="scroll-mt-16">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    适用信息
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-muted/30 rounded-lg p-4">
                    {FORM_GROUPS.usage.fields.map(field => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <div className="font-medium text-sm">
                          {renderDetailValue(selectedProduct?.[field.key as keyof Product] as string)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {/* 创建时间 */}
            {selectedProduct && !editMode && (
              <div className="text-xs text-muted-foreground pt-6 mt-6 border-t px-2">
                <span>创建时间: {new Date(selectedProduct.created_at).toLocaleString()}</span>
                {selectedProduct.updated_at && (
                  <span className="ml-6">
                    更新时间: {new Date(selectedProduct.updated_at).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 批量上传对话框 */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>批量上传产品</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                支持 Excel (.xlsx, .xls) 和 文本文件 (.txt, .csv)
              </p>
              <p className="text-xs text-muted-foreground/70 mb-4">
                Excel格式更推荐，支持完整的中文表头
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? '上传中...' : '选择文件'}
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={downloadExcelTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Excel模板
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                TXT模板
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              确认删除产品
            </DialogTitle>
            <DialogDescription className="pt-2">
              您即将删除产品 <strong className="text-foreground">{productToDelete?.name}</strong>，
              此操作不可撤销。为防止误删，请输入产品名称进行确认。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="confirm-name" className="text-sm text-muted-foreground">
              请输入产品名称：<span className="text-foreground font-medium">{productToDelete?.name}</span>
            </Label>
            <Input
              id="confirm-name"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="请输入产品名称"
              className="mt-2"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setProductToDelete(null);
                setDeleteConfirmName('');
              }}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteConfirmName.trim() !== productToDelete?.name}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 管理模式密码验证对话框 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              管理模式验证
            </DialogTitle>
            <DialogDescription className="pt-2">
              请输入管理密码以进入管理模式
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-password" className="text-sm text-muted-foreground">
              管理密码
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordVerify();
                }
              }}
              placeholder="请输入密码"
              className="mt-2"
            />
            {passwordError && (
              <p className="text-sm text-destructive mt-2">{passwordError}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false);
                setPasswordInput('');
                setPasswordError('');
              }}
            >
              取消
            </Button>
            <Button
              onClick={handlePasswordVerify}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 产品对比对话框 */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent 
          className="min-w-[800px] w-[1200px] h-[85vh] max-w-[98vw] max-h-[95vh] p-0 flex flex-col [&>button]:hidden"
        >
          {/* 关闭按钮 - 右上角 */}
          <button
            onClick={() => setCompareDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-50 bg-background p-1"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">关闭</span>
          </button>
          <DialogHeader className="px-6 pt-6 pb-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 pr-8">
              <GitCompare className="w-5 h-5" />
              产品对比
              <Badge variant="secondary" className="ml-2">
                {selectedProducts.length} 个产品
              </Badge>
            </DialogTitle>
            <DialogDescription className="pt-1">
              高亮显示的字段表示产品间存在差异，可横向滚动查看更多产品
            </DialogDescription>
          </DialogHeader>
          {/* 表格滚动区域 */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {selectedProducts.length >= 2 && (
              <>
                {/* 顶部横向滚动条 - 仅在内容超出时显示 */}
                {(() => {
                  const contentWidth = 140 + selectedProducts.length * 200;
                  const containerWidth = 1200; // 默认窗口宽度
                  const needScroll = contentWidth > containerWidth;
                  
                  return needScroll ? (
                    <div 
                      ref={compareTopScrollRef}
                      className="overflow-x-auto overflow-y-hidden flex-shrink-0 border-b bg-muted/30"
                      style={{ scrollbarWidth: 'thin' }}
                      onScroll={() => {
                        if (compareTopScrollRef.current && compareContentScrollRef.current) {
                          compareContentScrollRef.current.scrollLeft = compareTopScrollRef.current.scrollLeft;
                        }
                      }}
                    >
                      <div style={{ width: `${contentWidth}px`, height: '12px' }}></div>
                    </div>
                  ) : null;
                })()}
                {/* 表格内容区域 */}
                <div 
                  ref={compareContentScrollRef}
                  className="flex-1 overflow-auto p-4" 
                  style={{ scrollbarWidth: 'thin' }}
                  onScroll={() => {
                    if (compareTopScrollRef.current && compareContentScrollRef.current) {
                      compareTopScrollRef.current.scrollLeft = compareContentScrollRef.current.scrollLeft;
                    }
                  }}
                >
                <Table className="border-collapse min-w-max">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-muted/50 z-20 w-[140px] min-w-[140px] font-medium border-r border-b">
                      对比项
                    </TableHead>
                    {selectedProducts.map((product, index) => (
                      <TableHead 
                        key={product.id} 
                        className="w-[200px] min-w-[200px] text-center font-medium bg-muted/30 border-b"
                      >
                        <div className="flex flex-col items-center gap-1 py-2">
                          <Badge variant="outline">产品 {index + 1}</Badge>
                          <span className="text-sm font-normal truncate max-w-[180px]">
                            {product.name}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPARE_FIELDS.map(group => (
                    <>
                      <TableRow key={group.group} className="bg-muted/40">
                        <TableCell 
                          colSpan={selectedProducts.length + 1} 
                          className="font-semibold text-primary bg-muted/40 border-y"
                        >
                          {group.group}
                        </TableCell>
                      </TableRow>
                      {group.fields.map(fieldKey => {
                        const fieldDef = ALL_COLUMNS.find(c => c.key === fieldKey);
                        const isDiff = hasDifference(fieldKey);
                        
                        return (
                          <TableRow key={fieldKey} className="hover:bg-muted/30">
                            <TableCell className="sticky left-0 bg-background z-10 font-medium border-r">
                              {fieldDef?.label || fieldKey}
                            </TableCell>
                            {selectedProducts.map(product => (
                              <TableCell 
                                key={product.id}
                                className={`text-center px-4 py-3 ${isDiff ? 'bg-yellow-100 dark:bg-yellow-900/30 font-semibold' : ''}`}
                              >
                                {fieldKey === 'price' && product.price 
                                  ? `¥${product.price}` 
                                  : (product[fieldKey as keyof Product] as string || '-')}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </>
                  ))}
                </TableBody>
              </Table>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="px-6 py-3 border-t shrink-0">
            <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
