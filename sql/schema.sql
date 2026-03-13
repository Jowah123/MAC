-- =============================================
-- 京东产品知识库 - 数据库表结构
-- 创建时间: 2024
-- 数据库: PostgreSQL (Supabase)
-- =============================================

-- =============================================
-- 1. 产品表 (products)
-- 存储运动鞋产品的核心信息
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    -- 主键
    id SERIAL PRIMARY KEY,
    
    -- 基础信息
    sku VARCHAR(50) UNIQUE,                    -- SKU编码
    brand VARCHAR(100),                        -- 品牌
    model VARCHAR(100),                        -- 型号系列
    name VARCHAR(255) NOT NULL,                -- 产品名称
    product_no VARCHAR(50),                    -- 货号
    color VARCHAR(100),                        -- 配色
    size VARCHAR(100),                         -- 尺码范围
    price NUMERIC(10, 2),                      -- 吊牌价
    gender VARCHAR(50),                        -- 性别
    
    -- 功能特性
    features VARCHAR(500),                     -- 功能特点（多值，空格分隔）
    
    -- 功能分类
    upper_function VARCHAR(200),               -- 鞋面功能
    midsole_function VARCHAR(200),             -- 中底功能
    outsole_function VARCHAR(200),             -- 外底功能
    
    -- 科技特性
    upper_tech VARCHAR(200),                   -- 鞋面科技
    midsole_tech VARCHAR(200),                 -- 中底科技
    outsole_tech VARCHAR(200),                 -- 外底科技
    
    -- 材质信息
    upper_material VARCHAR(200),               -- 鞋面材质
    midsole_material VARCHAR(200),             -- 中底材质
    outsole_material VARCHAR(200),             -- 外底材质
    
    -- 适用信息
    applicable_venue VARCHAR(200),             -- 适用场地
    recommended_scenario VARCHAR(500),         -- 推荐场景
    applicable_season VARCHAR(100),            -- 适用季节
    closure_type VARCHAR(50),                  -- 闭合方式
    pace_distance VARCHAR(100),                -- 配速/距离
    
    -- 扩展字段
    category VARCHAR(100),                     -- 分类
    description TEXT,                          -- 详细描述
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 产品表索引
CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);
CREATE INDEX IF NOT EXISTS products_name_idx ON products(name);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products(brand);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at);

-- 添加注释
COMMENT ON TABLE products IS '运动鞋产品信息表';
COMMENT ON COLUMN products.sku IS 'SKU编码，唯一标识';
COMMENT ON COLUMN products.brand IS '品牌名称';
COMMENT ON COLUMN products.model IS '产品型号/系列';
COMMENT ON COLUMN products.name IS '产品名称';
COMMENT ON COLUMN products.product_no IS '货号';
COMMENT ON COLUMN products.features IS '功能特点，多个功能用空格分隔';

-- =============================================
-- 2. 产品参数表 (product_parameters)
-- 存储产品的自定义扩展参数
-- =============================================
CREATE TABLE IF NOT EXISTS product_parameters (
    -- 主键
    id SERIAL PRIMARY KEY,
    
    -- 关联产品
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- 参数信息
    param_name VARCHAR(255) NOT NULL,          -- 参数名称
    param_value VARCHAR(500) NOT NULL,         -- 参数值
    param_unit VARCHAR(50),                    -- 参数单位
    param_category VARCHAR(100),               -- 参数分类
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 产品参数表索引
CREATE INDEX IF NOT EXISTS product_parameters_product_id_idx ON product_parameters(product_id);
CREATE INDEX IF NOT EXISTS product_parameters_name_idx ON product_parameters(param_name);
CREATE INDEX IF NOT EXISTS product_parameters_category_idx ON product_parameters(param_category);

-- 添加注释
COMMENT ON TABLE product_parameters IS '产品扩展参数表，用于存储自定义参数';
COMMENT ON COLUMN product_parameters.product_id IS '关联的产品ID';
COMMENT ON COLUMN product_parameters.param_category IS '参数分类，用于分组展示';

-- =============================================
-- 3. 参数库表 (parameter_library)
-- 独立存储各类参数值，用于下拉选择和参数管理
-- =============================================
CREATE TABLE IF NOT EXISTS parameter_library (
    -- 主键
    id SERIAL PRIMARY KEY,
    
    -- 参数信息
    param_type VARCHAR(50) NOT NULL,           -- 参数类型：brand, tech, material等
    param_value VARCHAR(200) NOT NULL,         -- 参数值（中文显示名）
    param_code VARCHAR(100),                   -- 参数编码（英文标识，可选）
    description VARCHAR(500),                  -- 描述说明
    sort_order INTEGER DEFAULT 0,              -- 排序权重
    is_active INTEGER DEFAULT 1,               -- 是否启用 1-启用 0-禁用
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 唯一约束：同一类型下的参数值唯一
    CONSTRAINT parameter_library_type_value_unique UNIQUE (param_type, param_value)
);

-- 参数库表索引
CREATE INDEX IF NOT EXISTS parameter_library_type_idx ON parameter_library(param_type);
CREATE INDEX IF NOT EXISTS parameter_library_value_idx ON parameter_library(param_value);
CREATE INDEX IF NOT EXISTS parameter_library_type_value_idx ON parameter_library(param_type, param_value);
CREATE INDEX IF NOT EXISTS parameter_library_active_idx ON parameter_library(is_active);

-- 添加注释
COMMENT ON TABLE parameter_library IS '参数库表，存储各类参数的标准值';
COMMENT ON COLUMN parameter_library.param_type IS '参数类型，如：brand(品牌)、upper_tech(鞋面科技)等';
COMMENT ON COLUMN parameter_library.param_value IS '参数值，中文显示名称';
COMMENT ON COLUMN parameter_library.param_code IS '参数编码，英文标识，可用于国际化';
COMMENT ON COLUMN parameter_library.sort_order IS '排序权重，数值越小越靠前';
COMMENT ON COLUMN parameter_library.is_active IS '是否启用：1-启用，0-禁用';

-- =============================================
-- 4. 参数类型说明
-- =============================================
/*
参数类型 (param_type) 枚举值：

brand              - 品牌
category           - 分类
color              - 配色
gender             - 性别
features           - 功能特点
upper_function     - 鞋面功能
midsole_function   - 中底功能
outsole_function   - 外底功能
upper_tech         - 鞋面科技
midsole_tech       - 中底科技
outsole_tech       - 外底科技
upper_material     - 鞋面材质
midsole_material   - 中底材质
outsole_material   - 外底材质
applicable_venue   - 适用场地
recommended_scenario - 推荐场景
applicable_season  - 适用季节
*/

-- =============================================
-- 5. 更新时间触发器
-- 自动更新 updated_at 字段
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 产品表触发器
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 产品参数表触发器
DROP TRIGGER IF EXISTS update_product_parameters_updated_at ON product_parameters;
CREATE TRIGGER update_product_parameters_updated_at
    BEFORE UPDATE ON product_parameters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 参数库表触发器
DROP TRIGGER IF EXISTS update_parameter_library_updated_at ON parameter_library;
CREATE TRIGGER update_parameter_library_updated_at
    BEFORE UPDATE ON parameter_library
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. 授权 (Supabase)
-- 授权 anon 和 authenticated 用户访问权限
-- =============================================
-- 产品表授权
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO authenticated;

-- 产品参数表授权
GRANT SELECT, INSERT, UPDATE, DELETE ON product_parameters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_parameters TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE product_parameters_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE product_parameters_id_seq TO authenticated;

-- 参数库表授权
GRANT SELECT, INSERT, UPDATE, DELETE ON parameter_library TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON parameter_library TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE parameter_library_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE parameter_library_id_seq TO authenticated;

-- =============================================
-- 7. 初始化参数库数据（可选）
-- 插入常用参数值
-- =============================================
-- 品牌数据
INSERT INTO parameter_library (param_type, param_value, sort_order) VALUES
('brand', '安踏', 1),
('brand', '李宁', 2),
('brand', '特步', 3),
('brand', '361°', 4),
('brand', '鸿星尔克', 5),
('brand', '乔丹', 6),
('brand', '耐克', 7),
('brand', '阿迪达斯', 8),
('brand', '索康尼', 9),
('brand', '亚瑟士', 10),
('brand', '新百伦', 11),
('brand', '彪马', 12),
('brand', '美津浓', 13),
('brand', '斯凯奇', 14)
ON CONFLICT (param_type, param_value) DO NOTHING;

-- 性别数据
INSERT INTO parameter_library (param_type, param_value, sort_order) VALUES
('gender', '男', 1),
('gender', '女', 2),
('gender', '男/女', 3),
('gender', '儿童', 4)
ON CONFLICT (param_type, param_value) DO NOTHING;

-- 适用季节数据
INSERT INTO parameter_library (param_type, param_value, sort_order) VALUES
('applicable_season', '春季', 1),
('applicable_season', '夏季', 2),
('applicable_season', '秋季', 3),
('applicable_season', '冬季', 4),
('applicable_season', '四季通用', 5)
ON CONFLICT (param_type, param_value) DO NOTHING;

-- 闭合方式数据
INSERT INTO parameter_library (param_type, param_value, sort_order) VALUES
('closure_type', '系带', 1),
('closure_type', '魔术贴', 2),
('closure_type', '一脚蹬', 3),
('closure_type', '拉链', 4)
ON CONFLICT (param_type, param_value) DO NOTHING;

-- 常用科技
INSERT INTO parameter_library (param_type, param_value, sort_order) VALUES
('midsole_tech', '李宁䨻', 1),
('midsole_tech', '安踏氮科技', 2),
('midsole_tech', '特步动力巢', 3),
('midsole_tech', 'Zoom Air', 4),
('midsole_tech', 'Boost', 5),
('midsole_tech', 'PWRRUN PB', 6),
('midsole_tech', 'GEL', 7),
('midsole_tech', 'Fresh Foam', 8),
('upper_tech', '李宁䨻丝科技', 1),
('upper_tech', '工程网眼鞋面', 2),
('upper_tech', 'Flyknit', 3),
('upper_tech', 'Primeknit', 4)
ON CONFLICT (param_type, param_value) DO NOTHING;

-- =============================================
-- 完成
-- =============================================
