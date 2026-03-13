import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { saveProductParametersToLibrary } from '@/lib/parameter-library-helper';

// GET /api/products/[id] - 获取单个产品详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    // 获取产品基本信息
    const { data: product, error: productError } = await client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 });
    }

    // 获取产品参数
    const { data: parameters, error: paramsError } = await client
      .from('product_parameters')
      .select('*')
      .eq('product_id', id)
      .order('param_category', { ascending: true });

    if (paramsError) {
      return NextResponse.json({ error: paramsError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...product,
        parameters: parameters || [],
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: '获取产品详情失败' }, { status: 500 });
  }
}

// PUT /api/products/[id] - 更新产品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 只更新提供的字段
    const fields = [
      'sku', 'brand', 'model', 'name', 'product_no', 'color', 'size', 'price', 'gender',
      'features', 'upper_function', 'midsole_function', 'outsole_function',
      'upper_tech', 'midsole_tech', 'outsole_tech',
      'upper_material', 'midsole_material', 'outsole_material',
      'applicable_venue', 'recommended_scenario', 'applicable_season',
      'closure_type', 'pace_distance', 'category', 'description'
    ];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field] || null;
      }
    }

    const { data, error } = await client
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 });
    }

    // 自动将参数保存到参数库（等待完成）
    await saveProductParametersToLibrary(body);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: '更新产品失败' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - 删除产品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: '删除产品失败' }, { status: 500 });
  }
}
