-- =============================================
-- 清理脚本 - 删除所有表
-- 警告：此操作会删除所有数据！
-- =============================================

-- 删除触发器
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_product_parameters_updated_at ON product_parameters;
DROP TRIGGER IF EXISTS update_parameter_library_updated_at ON parameter_library;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 删除表（按依赖顺序）
DROP TABLE IF EXISTS product_parameters CASCADE;
DROP TABLE IF EXISTS parameter_library CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- 确认删除
SELECT 'All tables dropped successfully' as result;
