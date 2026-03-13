import { pgTable, serial, timestamp, varchar, text, integer, numeric, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 系统表 - 保持不变
export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 参数库表 - 独立存储各类参数
export const parameterLibrary = pgTable(
  "parameter_library",
  {
    id: serial().notNull().primaryKey(),
    paramType: varchar("param_type", { length: 50 }).notNull(), // 参数类型：brand, tech, material, venue, scenario等
    paramValue: varchar("param_value", { length: 200 }).notNull(), // 参数值（中文显示名）
    paramCode: varchar("param_code", { length: 100 }), // 参数编码（英文标识，可选）
    description: varchar("description", { length: 500 }), // 描述说明
    sortOrder: integer("sort_order").default(0), // 排序权重
    isActive: integer("is_active").default(1), // 是否启用 1-启用 0-禁用
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index("parameter_library_type_idx").on(table.paramType),
    index("parameter_library_value_idx").on(table.paramValue),
    index("parameter_library_type_value_idx").on(table.paramType, table.paramValue),
  ]
);

// 参数类型枚举
export const PARAM_TYPES = {
  BRAND: 'brand',                    // 品牌
  MODEL: 'model',                    // 型号系列
  UPPER_TECH: 'upper_tech',          // 鞋面科技
  MIDSOLE_TECH: 'midsole_tech',      // 中底科技
  OUTSOLE_TECH: 'outsole_tech',      // 外底科技
  UPPER_MATERIAL: 'upper_material',  // 鞋面材质
  MIDSOLE_MATERIAL: 'midsole_material', // 中底材质
  OUTSOLE_MATERIAL: 'outsole_material', // 外底材质
  UPPER_FUNCTION: 'upper_function',  // 鞋面功能
  MIDSOLE_FUNCTION: 'midsole_function', // 中底功能
  OUTSOLE_FUNCTION: 'outsole_function', // 外底功能
  VENUE: 'venue',                    // 适用场地
  SCENARIO: 'scenario',              // 推荐场景
  SEASON: 'season',                  // 适用季节
  CLOSURE_TYPE: 'closure_type',      // 闭合方式
  GENDER: 'gender',                  // 性别
} as const;

// 参数类型中文映射
export const PARAM_TYPE_LABELS: Record<string, string> = {
  [PARAM_TYPES.BRAND]: '品牌',
  [PARAM_TYPES.MODEL]: '型号系列',
  [PARAM_TYPES.UPPER_TECH]: '鞋面科技',
  [PARAM_TYPES.MIDSOLE_TECH]: '中底科技',
  [PARAM_TYPES.OUTSOLE_TECH]: '外底科技',
  [PARAM_TYPES.UPPER_MATERIAL]: '鞋面材质',
  [PARAM_TYPES.MIDSOLE_MATERIAL]: '中底材质',
  [PARAM_TYPES.OUTSOLE_MATERIAL]: '外底材质',
  [PARAM_TYPES.UPPER_FUNCTION]: '鞋面功能',
  [PARAM_TYPES.MIDSOLE_FUNCTION]: '中底功能',
  [PARAM_TYPES.OUTSOLE_FUNCTION]: '外底功能',
  [PARAM_TYPES.VENUE]: '适用场地',
  [PARAM_TYPES.SCENARIO]: '推荐场景',
  [PARAM_TYPES.SEASON]: '适用季节',
  [PARAM_TYPES.CLOSURE_TYPE]: '闭合方式',
  [PARAM_TYPES.GENDER]: '性别',
};

// 产品表 - 运动鞋产品信息
export const products = pgTable(
  "products",
  {
    id: serial().notNull().primaryKey(),
    // 基础信息
    sku: varchar("sku", { length: 50 }).unique(),
    brand: varchar("brand", { length: 100 }),
    model: varchar("model", { length: 100 }),
    name: varchar("name", { length: 255 }).notNull(),
    productNo: varchar("product_no", { length: 50 }),
    color: varchar("color", { length: 100 }),
    size: varchar("size", { length: 100 }),
    price: numeric("price", { precision: 10, scale: 2 }),
    gender: varchar("gender", { length: 50 }),
    
    // 功能特性
    features: varchar("features", { length: 500 }),
    
    // 功能分类
    upperFunction: varchar("upper_function", { length: 200 }),
    midsoleFunction: varchar("midsole_function", { length: 200 }),
    outsoleFunction: varchar("outsole_function", { length: 200 }),
    
    // 科技特性
    upperTech: varchar("upper_tech", { length: 200 }),
    midsoleTech: varchar("midsole_tech", { length: 200 }),
    outsoleTech: varchar("outsole_tech", { length: 200 }),
    
    // 材质信息
    upperMaterial: varchar("upper_material", { length: 200 }),
    midsoleMaterial: varchar("midsole_material", { length: 200 }),
    outsoleMaterial: varchar("outsole_material", { length: 200 }),
    
    // 适用信息
    applicableVenue: varchar("applicable_venue", { length: 200 }),
    recommendedScenario: varchar("recommended_scenario", { length: 500 }),
    applicableSeason: varchar("applicable_season", { length: 100 }),
    closureType: varchar("closure_type", { length: 50 }),
    paceDistance: varchar("pace_distance", { length: 100 }),
    
    // 扩展字段
    category: varchar("category", { length: 100 }),
    description: text("description"),
    
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index("products_sku_idx").on(table.sku),
    index("products_name_idx").on(table.name),
    index("products_brand_idx").on(table.brand),
    index("products_category_idx").on(table.category),
  ]
);

// 产品参数表 - 用于存储额外的自定义参数
export const productParameters = pgTable(
  "product_parameters",
  {
    id: serial().notNull().primaryKey(),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
    paramName: varchar("param_name", { length: 255 }).notNull(),
    paramValue: varchar("param_value", { length: 500 }).notNull(),
    paramUnit: varchar("param_unit", { length: 50 }),
    paramCategory: varchar("param_category", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index("product_parameters_product_id_idx").on(table.productId),
    index("product_parameters_name_idx").on(table.paramName),
    index("product_parameters_category_idx").on(table.paramCategory),
  ]
);

// Schema factory for Zod validation
const { createInsertSchema, createUpdateSchema } = createSchemaFactory({
  coerce: { date: true },
});

// Product schemas
export const insertProductSchema = createInsertSchema(products).pick({
  sku: true,
  brand: true,
  model: true,
  name: true,
  productNo: true,
  color: true,
  size: true,
  price: true,
  gender: true,
  features: true,
  upperFunction: true,
  midsoleFunction: true,
  outsoleFunction: true,
  upperTech: true,
  midsoleTech: true,
  outsoleTech: true,
  upperMaterial: true,
  midsoleMaterial: true,
  outsoleMaterial: true,
  applicableVenue: true,
  recommendedScenario: true,
  applicableSeason: true,
  closureType: true,
  paceDistance: true,
  category: true,
  description: true,
});

export const updateProductSchema = createUpdateSchema(products).pick({
  sku: true,
  brand: true,
  model: true,
  name: true,
  productNo: true,
  color: true,
  size: true,
  price: true,
  gender: true,
  features: true,
  upperFunction: true,
  midsoleFunction: true,
  outsoleFunction: true,
  upperTech: true,
  midsoleTech: true,
  outsoleTech: true,
  upperMaterial: true,
  midsoleMaterial: true,
  outsoleMaterial: true,
  applicableVenue: true,
  recommendedScenario: true,
  applicableSeason: true,
  closureType: true,
  paceDistance: true,
  category: true,
  description: true,
}).partial();

// Product parameter schemas
export const insertProductParameterSchema = createInsertSchema(productParameters).pick({
  productId: true,
  paramName: true,
  paramValue: true,
  paramUnit: true,
  paramCategory: true,
});

export const updateProductParameterSchema = createUpdateSchema(productParameters).pick({
  paramName: true,
  paramValue: true,
  paramUnit: true,
  paramCategory: true,
}).partial();

// TypeScript types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export type ProductParameter = typeof productParameters.$inferSelect;
export type InsertProductParameter = z.infer<typeof insertProductParameterSchema>;
export type UpdateProductParameter = z.infer<typeof updateProductParameterSchema>;

// Parameter Library schemas
export const insertParameterLibrarySchema = createInsertSchema(parameterLibrary).pick({
  paramType: true,
  paramValue: true,
  paramCode: true,
  description: true,
  sortOrder: true,
  isActive: true,
});

export const updateParameterLibrarySchema = createUpdateSchema(parameterLibrary).pick({
  paramType: true,
  paramValue: true,
  paramCode: true,
  description: true,
  sortOrder: true,
  isActive: true,
}).partial();

export type ParameterLibrary = typeof parameterLibrary.$inferSelect;
export type InsertParameterLibrary = z.infer<typeof insertParameterLibrarySchema>;
export type UpdateParameterLibrary = z.infer<typeof updateParameterLibrarySchema>;


