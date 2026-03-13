import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// PUT /api/parameter-library/[id] - 更新参数
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;
    const body = await request.json();

    // 如果更新了类型或值，检查是否与其他参数重复
    if (body.param_type || body.param_value) {
      const { data: existing } = await client
        .from('parameter_library')
        .select('id')
        .eq('param_type', body.param_type)
        .eq('param_value', body.param_value)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json({ error: '该参数已存在' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.param_type !== undefined) updateData.param_type = body.param_type;
    if (body.param_value !== undefined) updateData.param_value = body.param_value;
    if (body.param_code !== undefined) updateData.param_code = body.param_code;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await client
      .from('parameter_library')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: '参数不存在' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating parameter:', error);
    return NextResponse.json({ error: '更新参数失败' }, { status: 500 });
  }
}

// DELETE /api/parameter-library/[id] - 删除参数
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = getSupabaseClient();
    const { id } = await params;

    const { error } = await client
      .from('parameter_library')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting parameter:', error);
    return NextResponse.json({ error: '删除参数失败' }, { status: 500 });
  }
}
