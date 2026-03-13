import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { saveProductParametersToLibrary } from '@/lib/parameter-library-helper';
import * as XLSX from 'xlsx';

// 中文字段映射表
const FIELD_MAP: Record<string, string> = {
  'SKU': 'sku',
  '品牌': 'brand',
  '型号': 'model',
  '名称': 'name',
  '货号': 'product_no',
  '配色': 'color',
  '尺码': 'size',
  '吊牌价': 'price',
  '性别': 'gender',
  '功能': 'features',
  '鞋面功能': 'upper_function',
  '中底功能': 'midsole_function',
  '外底功能': 'outsole_function',
  '鞋面科技': 'upper_tech',
  '中底科技': 'midsole_tech',
  '外底科技': 'outsole_tech',
  '鞋面材质': 'upper_material',
  '中底材质': 'midsole_material',
  '外底材质': 'outsole_material',
  '适用场地': 'applicable_venue',
  '推荐场景': 'recommended_scenario',
  '适用季节': 'applicable_season',
  '闭合方式': 'closure_type',
  '配速/距离': 'pace_distance',
  '分类': 'category',
  '描述': 'description',
};

// 解析Excel文件
function parseExcelFile(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // 转换为JSON数组
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
  
  if (jsonData.length === 0) {
    throw new Error('Excel文件中没有数据');
  }

  // 映射字段名
  return jsonData.map((row) => {
    const mappedRow: Record<string, unknown> = {};
    
    Object.entries(row).forEach(([key, value]) => {
      const trimmedKey = key.toString().trim();
      const fieldName = FIELD_MAP[trimmedKey] || trimmedKey;
      
      // 处理空值
      if (value === '' || value === null || value === undefined) {
        mappedRow[fieldName] = null;
      } else {
        mappedRow[fieldName] = value;
      }
    });
    
    return mappedRow;
  });
}

// POST /api/products/upload - 批量上传产品（支持Excel和CSV文件）
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    
    // 获取FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: '请上传文件' }, { status: 400 });
    }

    // 检查文件类型
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isText = fileName.endsWith('.txt') || fileName.endsWith('.csv');
    
    if (!isExcel && !isText) {
      return NextResponse.json({ 
        error: '不支持的文件格式，请上传 Excel (.xlsx/.xls) 或 文本文件 (.txt/.csv)' 
      }, { status: 400 });
    }

    let products: Record<string, unknown>[] = [];

    if (isExcel) {
      // 解析Excel文件
      const buffer = Buffer.from(await file.arrayBuffer());
      products = parseExcelFile(buffer);
    } else {
      // 解析文本文件（制表符分隔）
      const text = await file.text();
      const lines = text.trim().split('\n');
      
      if (lines.length < 2) {
        return NextResponse.json({ error: '文件至少需要包含表头和一行数据' }, { status: 400 });
      }

      const headers = lines[0].split('\t').map(h => h.trim().replace(/"/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t').map(v => v.trim().replace(/"/g, ''));
        if (values.length !== headers.length) continue;

        const product: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          const fieldName = FIELD_MAP[header] || header;
          product[fieldName] = values[index] || null;
        });
        products.push(product);
      }
    }

    if (products.length === 0) {
      return NextResponse.json({ error: '没有有效的产品数据' }, { status: 400 });
    }

    // 准备批量插入的数据
    const productsToInsert = products.map((p) => ({
      sku: p.sku?.toString() || null,
      brand: p.brand?.toString() || null,
      model: p.model?.toString() || null,
      name: p.name?.toString() || `未命名产品_${Date.now()}`,
      product_no: p.product_no?.toString() || null,
      color: p.color?.toString() || null,
      size: p.size?.toString() || null,
      price: p.price?.toString() || null,
      gender: p.gender?.toString() || null,
      features: p.features?.toString() || null,
      upper_function: p.upper_function?.toString() || null,
      midsole_function: p.midsole_function?.toString() || null,
      outsole_function: p.outsole_function?.toString() || null,
      upper_tech: p.upper_tech?.toString() || null,
      midsole_tech: p.midsole_tech?.toString() || null,
      outsole_tech: p.outsole_tech?.toString() || null,
      upper_material: p.upper_material?.toString() || null,
      midsole_material: p.midsole_material?.toString() || null,
      outsole_material: p.outsole_material?.toString() || null,
      applicable_venue: p.applicable_venue?.toString() || null,
      recommended_scenario: p.recommended_scenario?.toString() || null,
      applicable_season: p.applicable_season?.toString() || null,
      closure_type: p.closure_type?.toString() || null,
      pace_distance: p.pace_distance?.toString() || null,
      category: p.category?.toString() || null,
      description: p.description?.toString() || null,
    }));

    // 批量插入
    const { data, error } = await client
      .from('products')
      .insert(productsToInsert)
      .select();

    if (error) {
      console.error('Batch insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 批量将参数保存到参数库（等待完成）
    await Promise.all(
      products.map(product => saveProductParametersToLibrary(product))
    );

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading products:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '上传失败' 
    }, { status: 500 });
  }
}
