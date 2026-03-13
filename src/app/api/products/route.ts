import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { saveProductParametersToLibrary } from '@/lib/parameter-library-helper';

// GET /api/products - 获取产品列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const productNo = searchParams.get('product_no');

    let query = client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // 搜索条件
    if (search) {
      query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
    }

    // 货号搜索
    if (productNo) {
      query = query.ilike('product_no', `%${productNo}%`);
    }

    // 分类筛选
    if (category) {
      query = query.eq('category', category);
    }

    // 品牌筛选
    if (brand) {
      query = query.eq('brand', brand);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: '获取产品列表失败' }, { status: 500 });
  }
}

// POST /api/products - 创建产品
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { data, error } = await client
      .from('products')
      .insert({
        sku: body.sku || null,
        brand: body.brand || null,
        model: body.model || null,
        name: body.name,
        product_no: body.product_no || null,
        color: body.color || null,
        size: body.size || null,
        price: body.price || null,
        gender: body.gender || null,
        features: body.features || null,
        upper_function: body.upper_function || null,
        midsole_function: body.midsole_function || null,
        outsole_function: body.outsole_function || null,
        upper_tech: body.upper_tech || null,
        midsole_tech: body.midsole_tech || null,
        outsole_tech: body.outsole_tech || null,
        upper_material: body.upper_material || null,
        midsole_material: body.midsole_material || null,
        outsole_material: body.outsole_material || null,
        applicable_venue: body.applicable_venue || null,
        recommended_scenario: body.recommended_scenario || null,
        applicable_season: body.applicable_season || null,
        closure_type: body.closure_type || null,
        pace_distance: body.pace_distance || null,
        category: body.category || null,
        description: body.description || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 自动将参数保存到参数库（等待完成）
    await saveProductParametersToLibrary(body);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: '创建产品失败' }, { status: 500 });
  }
}
