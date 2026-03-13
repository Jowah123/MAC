-- =============================================
-- 测试数据脚本
-- 用于开发和测试环境
-- =============================================

-- 插入测试产品
INSERT INTO products (
    sku, brand, model, name, product_no, color, size, price, gender,
    features, upper_function, midsole_function, outsole_function,
    upper_tech, midsole_tech, outsole_tech,
    upper_material, midsole_material, outsole_material,
    applicable_venue, recommended_scenario, applicable_season,
    closure_type, pace_distance, category, description
) VALUES 
(
    'TEST-001', '测试品牌', '测试型号', '测试跑步鞋', 'TN-001',
    '黑色/白色', '39-44', 599.00, '男',
    '透气 轻便 耐磨', '透气', '缓震', '耐磨',
    '网眼面料', 'EVA发泡', '橡胶大底',
    '网布', 'EVA', '橡胶',
    '跑道 公路', '日常训练 健身跑步', '四季通用',
    '系带', '5-6分配', '跑步鞋',
    '这是一款专为日常训练设计的跑步鞋，具有良好的缓震性能和透气性。'
),
(
    'TEST-002', '测试品牌', '测试型号', '测试篮球鞋', 'TN-002',
    '红色', '40-45', 799.00, '男',
    '包裹性 支撑 缓震', '包裹', '回弹', '防滑',
    '合成革', '气垫', '耐磨橡胶',
    '合成革', '气垫', '橡胶',
    '室内地板 室外水泥', '篮球比赛 日常训练', '四季通用',
    '系带', NULL, '篮球鞋',
    '专业篮球鞋，提供出色的包裹性和缓震效果。'
),
(
    'TEST-003', '测试品牌2', '休闲系列', '测试休闲鞋', 'TN-003',
    '灰色', '36-42', 399.00, '女',
    '舒适 时尚', '透气', '柔软', '防滑',
    '纺织面料', '记忆海绵', 'TPR大底',
    '织物', '记忆海绵', 'TPR',
    '日常通勤 逛街', '日常穿着 休闲出行', '春夏秋',
    '一脚蹬', NULL, '休闲鞋',
    '时尚舒适的休闲鞋，适合日常穿着。'
);

-- 插入测试产品参数
INSERT INTO product_parameters (product_id, param_name, param_value, param_unit, param_category)
SELECT 
    p.id,
    unnest(ARRAY['重量', '鞋底厚度', '鞋帮高度']),
    unnest(ARRAY['280', '25', '8']),
    unnest(ARRAY['克', '毫米', '厘米']),
    unnest(ARRAY['基础参数', '基础参数', '基础参数'])
FROM products p
WHERE p.sku = 'TEST-001';

-- 查询验证
SELECT 'Products inserted: ' || COUNT(*)::text as result FROM products;
SELECT 'Parameters inserted: ' || COUNT(*)::text as result FROM product_parameters;
SELECT 'Library entries: ' || COUNT(*)::text as result FROM parameter_library;
