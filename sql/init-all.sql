-- =============================================
-- 一键初始化脚本
-- 按顺序执行所有SQL脚本
-- 使用方法：psql -f init-all.sql
-- =============================================

\echo '=========================================='
\echo '开始执行数据库初始化...'
\echo '=========================================='

\echo ''
\echo '1. 执行清理脚本...'
\i drop-tables.sql

\echo ''
\echo '2. 创建表结构...'
\i schema.sql

\echo ''
\echo '3. 插入测试数据...'
\i seed-data.sql

\echo ''
\echo '4. 创建视图...'
\i views.sql

\echo ''
\echo '=========================================='
\echo '数据库初始化完成！'
\echo '=========================================='
\echo ''
\echo '表结构：'
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '参数库统计：'
SELECT param_type, COUNT(*) as count 
FROM parameter_library 
GROUP BY param_type 
ORDER BY param_type;

\echo ''
\echo '产品统计：'
SELECT COUNT(*) as total_products FROM products;
