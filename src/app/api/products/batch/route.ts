import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST /api/products/batch - 批量上传产品
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const products = body.products;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: '请提供产品数据数组' }, { status: 400 });
    }

    // 准备批量插入的数据
    const productsToInsert = products.map((p: Record<string, unknown>) => ({
      sku: p.sku || null,
      brand: p.brand || null,
      model: p.model || null,
      name: p.name || `未命名产品_${Date.now()}`,
      product_no: p.product_no || null,
      color: p.color || null,
      size: p.size || null,
      price: p.price || null,
      gender: p.gender || null,
      features: p.features || null,
      upper_function: p.upper_function || null,
      midsole_function: p.midsole_function || null,
      outsole_function: p.outsole_function || null,
      upper_tech: p.upper_tech || null,
      midsole_tech: p.midsole_tech || null,
      outsole_tech: p.outsole_tech || null,
      upper_material: p.upper_material || null,
      midsole_material: p.midsole_material || null,
      outsole_material: p.outsole_material || null,
      applicable_venue: p.applicable_venue || null,
      recommended_scenario: p.recommended_scenario || null,
      applicable_season: p.applicable_season || null,
      closure_type: p.closure_type || null,
      pace_distance: p.pace_distance || null,
      category: p.category || null,
      description: p.description || null,
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

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data
    }, { status: 201 });
  } catch (error) {
    console.error('Error batch uploading products:', error);
    return NextResponse.json({ error: '批量上传失败' }, { status: 500 });
  }
}
