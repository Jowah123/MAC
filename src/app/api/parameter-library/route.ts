import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/parameter-library - 获取参数库列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get('param_type');

    let query = client
      .from('parameter_library')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (paramType) {
      query = query.eq('param_type', paramType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching parameter library:', error);
    return NextResponse.json({ error: '获取参数库失败' }, { status: 500 });
  }
}

// POST /api/parameter-library - 创建新参数
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    // 验证必填字段
    if (!body.param_type || !body.param_value) {
      return NextResponse.json({ error: '参数类型和参数值不能为空' }, { status: 400 });
    }

    // 检查是否已存在相同的参数
    const { data: existing } = await client
      .from('parameter_library')
      .select('id')
      .eq('param_type', body.param_type)
      .eq('param_value', body.param_value)
      .single();

    if (existing) {
      return NextResponse.json({ error: '该参数已存在' }, { status: 400 });
    }

    const { data, error } = await client
      .from('parameter_library')
      .insert({
        param_type: body.param_type,
        param_value: body.param_value,
        param_code: body.param_code || null,
        description: body.description || null,
        sort_order: body.sort_order || 0,
        is_active: body.is_active ?? 1,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error creating parameter:', error);
    return NextResponse.json({ error: '创建参数失败' }, { status: 500 });
  }
}
