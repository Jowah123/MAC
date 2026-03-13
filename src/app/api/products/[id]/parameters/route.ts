import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/products/[id]/parameters - 获取产品参数列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    const { data, error } = await client
      .from('product_parameters')
      .select('*')
      .eq('product_id', id)
      .order('param_category', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching parameters:', error);
    return NextResponse.json({ error: '获取参数列表失败' }, { status: 500 });
  }
}

// POST /api/products/[id]/parameters - 创建产品参数
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await client
      .from('product_parameters')
      .insert({
        product_id: parseInt(id),
        param_name: body.param_name,
        param_value: body.param_value,
        param_unit: body.param_unit || null,
        param_category: body.param_category || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating parameter:', error);
    return NextResponse.json({ error: '创建参数失败' }, { status: 500 });
  }
}
