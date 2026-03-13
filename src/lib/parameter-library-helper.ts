/**
 * 参数库帮助函数
 * 用于自动将产品参数保存到参数库
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 参数类型映射
 * 将产品字段名映射到参数库的参数类型
 */
const PARAM_FIELD_MAPPING: Record<string, string> = {
  brand: 'brand',
  category: 'category',
  color: 'color',
  gender: 'gender',
  features: 'features',
  upper_function: 'upper_function',
  midsole_function: 'midsole_function',
  outsole_function: 'outsole_function',
  upper_tech: 'upper_tech',
  midsole_tech: 'midsole_tech',
  outsole_tech: 'outsole_tech',
  upper_material: 'upper_material',
  midsole_material: 'midsole_material',
  outsole_material: 'outsole_material',
  applicable_venue: 'applicable_venue',
  recommended_scenario: 'recommended_scenario',
  applicable_season: 'applicable_season',
};

/**
 * 将参数值保存到参数库
 * 如果参数值已存在则跳过，否则创建新记录
 */
export async function saveParameterToLibrary(
  paramType: string,
  paramValue: string
): Promise<void> {
  if (!paramValue || paramValue.trim() === '') {
    return;
  }

  const client = getSupabaseClient();
  const trimmedValue = paramValue.trim();

  try {
    // 检查参数是否已存在（使用 maybeSingle 避免找不到记录时报错）
    const { data: existing, error: selectError } = await client
      .from('parameter_library')
      .select('id')
      .eq('param_type', paramType)
      .eq('param_value', trimmedValue)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking parameter existence:', selectError);
      return;
    }

    // 如果不存在则创建
    if (!existing) {
      const { error: insertError } = await client.from('parameter_library').insert({
        param_type: paramType,
        param_value: trimmedValue,
        is_active: 1,
      });

      if (insertError) {
        console.error('Error inserting parameter:', insertError);
      }
    }
  } catch (error) {
    console.error('Failed to save parameter to library:', error);
  }
}

/**
 * 批量保存产品参数到参数库
 * 自动提取产品的所有参数字段并保存到参数库
 */
export async function saveProductParametersToLibrary(
  productData: Record<string, unknown>
): Promise<void> {
  const promises: Promise<void>[] = [];

  for (const [field, paramType] of Object.entries(PARAM_FIELD_MAPPING)) {
    const value = productData[field];
    if (typeof value === 'string' && value.trim() !== '') {
      promises.push(saveParameterToLibrary(paramType, value));
    }
  }

  await Promise.all(promises);
}
