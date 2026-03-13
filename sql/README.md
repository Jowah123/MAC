# SQL 数据库脚本说明

## 目录结构

```
sql/
├── README.md          # 本说明文件
├── init-all.sql       # 一键初始化脚本（推荐）
├── drop-tables.sql    # 清理脚本（删除所有表）
├── schema.sql         # 表结构定义
├── seed-data.sql      # 测试数据
└── views.sql          # 常用查询视图
```

## 表结构说明

### 1. products（产品表）
存储运动鞋产品的核心信息，包含24个标准字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| sku | VARCHAR(50) | SKU编码（唯一） |
| brand | VARCHAR(100) | 品牌 |
| model | VARCHAR(100) | 型号系列 |
| name | VARCHAR(255) | 产品名称（必填） |
| product_no | VARCHAR(50) | 货号 |
| color | VARCHAR(100) | 配色 |
| size | VARCHAR(100) | 尺码范围 |
| price | NUMERIC(10,2) | 吊牌价 |
| gender | VARCHAR(50) | 性别 |
| features | VARCHAR(500) | 功能特点 |
| upper_function | VARCHAR(200) | 鞋面功能 |
| midsole_function | VARCHAR(200) | 中底功能 |
| outsole_function | VARCHAR(200) | 外底功能 |
| upper_tech | VARCHAR(200) | 鞋面科技 |
| midsole_tech | VARCHAR(200) | 中底科技 |
| outsole_tech | VARCHAR(200) | 外底科技 |
| upper_material | VARCHAR(200) | 鞋面材质 |
| midsole_material | VARCHAR(200) | 中底材质 |
| outsole_material | VARCHAR(200) | 外底材质 |
| applicable_venue | VARCHAR(200) | 适用场地 |
| recommended_scenario | VARCHAR(500) | 推荐场景 |
| applicable_season | VARCHAR(100) | 适用季节 |
| closure_type | VARCHAR(50) | 闭合方式 |
| pace_distance | VARCHAR(100) | 配速/距离 |
| category | VARCHAR(100) | 分类 |
| description | TEXT | 详细描述 |

### 2. product_parameters（产品参数表）
存储产品的自定义扩展参数：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| product_id | INTEGER | 关联产品ID（外键） |
| param_name | VARCHAR(255) | 参数名称 |
| param_value | VARCHAR(500) | 参数值 |
| param_unit | VARCHAR(50) | 参数单位 |
| param_category | VARCHAR(100) | 参数分类 |

### 3. parameter_library（参数库表）
独立存储各类参数值，用于下拉选择：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| param_type | VARCHAR(50) | 参数类型 |
| param_value | VARCHAR(200) | 参数值（中文） |
| param_code | VARCHAR(100) | 参数编码（英文） |
| description | VARCHAR(500) | 描述说明 |
| sort_order | INTEGER | 排序权重 |
| is_active | INTEGER | 是否启用（1/0） |

## 使用方法

### 方式一：一键初始化（推荐）
```bash
# 在 Supabase SQL Editor 中执行
\i init-all.sql

# 或使用 psql 命令行
psql -h <host> -U <user> -d <database> -f init-all.sql
```

### 方式二：分步执行
```bash
# 1. 清理旧表（可选，会删除数据）
psql -f drop-tables.sql

# 2. 创建表结构
psql -f schema.sql

# 3. 插入测试数据（可选）
psql -f seed-data.sql

# 4. 创建视图（可选）
psql -f views.sql
```

### 方式三：Supabase 控制台
1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 schema.sql 内容并执行
4. 根据需要执行其他脚本

## 参数类型枚举

参数库表支持以下参数类型：

| param_type | 中文名称 |
|------------|----------|
| brand | 品牌 |
| category | 分类 |
| color | 配色 |
| gender | 性别 |
| features | 功能特点 |
| upper_function | 鞋面功能 |
| midsole_function | 中底功能 |
| outsole_function | 外底功能 |
| upper_tech | 鞋面科技 |
| midsole_tech | 中底科技 |
| outsole_tech | 外底科技 |
| upper_material | 鞋面材质 |
| midsole_material | 中底材质 |
| outsole_material | 外底材质 |
| applicable_venue | 适用场地 |
| recommended_scenario | 推荐场景 |
| applicable_season | 适用季节 |

## 常用查询

### 查看所有产品
```sql
SELECT * FROM v_products_full LIMIT 10;
```

### 按品牌统计产品
```sql
SELECT * FROM v_brand_stats;
```

### 按分类统计产品
```sql
SELECT * FROM v_category_stats;
```

### 参数库统计
```sql
SELECT * FROM v_parameter_library_stats;
```

### 搜索产品
```sql
SELECT * FROM products 
WHERE name ILIKE '%跑步%' 
   OR brand ILIKE '%耐克%';
```

## 注意事项

1. **数据安全**：drop-tables.sql 会删除所有数据，生产环境慎用
2. **权限配置**：脚本默认授权给 anon 和 authenticated 角色（Supabase）
3. **唯一约束**：参数库表有 (param_type, param_value) 唯一约束
4. **级联删除**：删除产品时，关联的产品参数会自动删除

## 与现有代码的关联

项目使用 Drizzle ORM，schema.ts 定义与 SQL 表结构一致：
- `src/storage/database/shared/schema.ts` - Drizzle Schema 定义
- `src/lib/parameter-library-helper.ts` - 参数库自动存储逻辑
- `src/app/api/products/route.ts` - 产品 CRUD API
- `src/app/api/parameter-library/route.ts` - 参数库 API
