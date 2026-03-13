// 产品类型 - 运动鞋产品信息
export interface Product {
  id: number;
  // 基础信息
  sku: string | null;
  brand: string | null;
  model: string | null;
  name: string;
  product_no: string | null;
  color: string | null;
  size: string | null;
  price: string | null;
  gender: string | null;
  
  // 功能特性
  features: string | null;
  
  // 功能分类
  upper_function: string | null;
  midsole_function: string | null;
  outsole_function: string | null;
  
  // 科技特性
  upper_tech: string | null;
  midsole_tech: string | null;
  outsole_tech: string | null;
  
  // 材质信息
  upper_material: string | null;
  midsole_material: string | null;
  outsole_material: string | null;
  
  // 适用信息
  applicable_venue: string | null;
  recommended_scenario: string | null;
  applicable_season: string | null;
  closure_type: string | null;
  pace_distance: string | null;
  
  // 扩展字段
  category: string | null;
  description: string | null;
  
  created_at: string;
  updated_at: string | null;
  parameters?: ProductParameter[];
}

// 产品参数类型
export interface ProductParameter {
  id: number;
  product_id: number;
  param_name: string;
  param_value: string;
  param_unit: string | null;
  param_category: string | null;
  created_at: string;
  updated_at: string | null;
}

// 创建产品请求
export interface CreateProductRequest {
  sku?: string;
  brand?: string;
  model?: string;
  name: string;
  product_no?: string;
  color?: string;
  size?: string;
  price?: string;
  gender?: string;
  features?: string;
  upper_function?: string;
  midsole_function?: string;
  outsole_function?: string;
  upper_tech?: string;
  midsole_tech?: string;
  outsole_tech?: string;
  upper_material?: string;
  midsole_material?: string;
  outsole_material?: string;
  applicable_venue?: string;
  recommended_scenario?: string;
  applicable_season?: string;
  closure_type?: string;
  pace_distance?: string;
  category?: string;
  description?: string;
}

// 更新产品请求
export type UpdateProductRequest = Partial<CreateProductRequest>;

// 创建参数请求
export interface CreateParameterRequest {
  param_name: string;
  param_value: string;
  param_unit?: string;
  param_category?: string;
}

// 更新参数请求
export type UpdateParameterRequest = Partial<CreateParameterRequest>;

// 批量上传产品请求
export interface BatchUploadProductRequest {
  products: CreateProductRequest[];
}

// 表格列定义
export const PRODUCT_COLUMNS = [
  { key: 'sku', label: 'SKU', width: 150 },
  { key: 'brand', label: '品牌', width: 120 },
  { key: 'model', label: '型号', width: 120 },
  { key: 'name', label: '名称', width: 150 },
  { key: 'product_no', label: '货号', width: 120 },
  { key: 'color', label: '配色', width: 100 },
  { key: 'size', label: '尺码', width: 150 },
  { key: 'price', label: '吊牌价', width: 100 },
  { key: 'gender', label: '性别', width: 80 },
  { key: 'features', label: '功能', width: 200 },
  { key: 'upper_function', label: '鞋面功能', width: 120 },
  { key: 'midsole_function', label: '中底功能', width: 120 },
  { key: 'outsole_function', label: '外底功能', width: 120 },
  { key: 'upper_tech', label: '鞋面科技', width: 150 },
  { key: 'midsole_tech', label: '中底科技', width: 150 },
  { key: 'outsole_tech', label: '外底科技', width: 150 },
  { key: 'upper_material', label: '鞋面材质', width: 120 },
  { key: 'midsole_material', label: '中底材质', width: 120 },
  { key: 'outsole_material', label: '外底材质', width: 120 },
  { key: 'applicable_venue', label: '适用场地', width: 150 },
  { key: 'recommended_scenario', label: '推荐场景', width: 200 },
  { key: 'applicable_season', label: '适用季节', width: 100 },
  { key: 'closure_type', label: '闭合方式', width: 100 },
  { key: 'pace_distance', label: '配速/距离', width: 120 },
] as const;
