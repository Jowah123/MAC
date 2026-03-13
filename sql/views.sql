-- =============================================
-- 常用查询视图
-- =============================================

-- 1. 产品完整信息视图
CREATE OR REPLACE VIEW v_products_full AS
SELECT 
    p.id,
    p.sku,
    p.brand,
    p.model,
    p.name,
    p.product_no,
    p.color,
    p.size,
    p.price,
    p.gender,
    p.category,
    p.features,
    -- 功能
    p.upper_function,
    p.midsole_function,
    p.outsole_function,
    -- 科技
    p.upper_tech,
    p.midsole_tech,
    p.outsole_tech,
    -- 材质
    p.upper_material,
    p.midsole_material,
    p.outsole_material,
    -- 适用
    p.applicable_venue,
    p.recommended_scenario,
    p.applicable_season,
    p.closure_type,
    p.pace_distance,
    p.description,
    p.created_at,
    p.updated_at
FROM products p
ORDER BY p.created_at DESC;

-- 2. 参数库分组视图（按类型分组统计）
CREATE OR REPLACE VIEW v_parameter_library_stats AS
SELECT 
    param_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = 1) as active_count,
    MIN(created_at) as first_created,
    MAX(updated_at) as last_updated
FROM parameter_library
GROUP BY param_type
ORDER BY param_type;

-- 3. 品牌产品统计视图
CREATE OR REPLACE VIEW v_brand_stats AS
SELECT 
    brand,
    COUNT(*) as product_count,
    COUNT(DISTINCT model) as model_count,
    MIN(price) as min_price,
    MAX(price) as max_price,
    ROUND(AVG(price)::numeric, 2) as avg_price
FROM products
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY product_count DESC;

-- 4. 分类产品统计视图
CREATE OR REPLACE VIEW v_category_stats AS
SELECT 
    category,
    COUNT(*) as product_count,
    COUNT(DISTINCT brand) as brand_count,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products
WHERE category IS NOT NULL
GROUP BY category
ORDER BY product_count DESC;

-- 5. 产品参数展开视图
CREATE OR REPLACE VIEW v_product_parameters_pivot AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.brand,
    MAX(CASE WHEN pp.param_name = '重量' THEN pp.param_value END) as weight,
    MAX(CASE WHEN pp.param_name = '鞋底厚度' THEN pp.param_value END) as sole_thickness,
    MAX(CASE WHEN pp.param_name = '鞋帮高度' THEN pp.param_value END) as upper_height
FROM products p
LEFT JOIN product_parameters pp ON p.id = pp.product_id
GROUP BY p.id, p.name, p.brand;

-- 授权视图访问
GRANT SELECT ON v_products_full TO anon;
GRANT SELECT ON v_products_full TO authenticated;
GRANT SELECT ON v_parameter_library_stats TO anon;
GRANT SELECT ON v_parameter_library_stats TO authenticated;
GRANT SELECT ON v_brand_stats TO anon;
GRANT SELECT ON v_brand_stats TO authenticated;
GRANT SELECT ON v_category_stats TO anon;
GRANT SELECT ON v_category_stats TO authenticated;
GRANT SELECT ON v_product_parameters_pivot TO anon;
GRANT SELECT ON v_product_parameters_pivot TO authenticated;

-- 查询示例
-- SELECT * FROM v_products_full LIMIT 10;
-- SELECT * FROM v_parameter_library_stats;
-- SELECT * FROM v_brand_stats;
-- SELECT * FROM v_category_stats;
