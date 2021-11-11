/**
 * 支持拼音模糊搜索
 *
 * @param word - 搜索词
 * @param list - 在哪个数组中搜索
 * @param options - 搜索配置项
 */
export default function pinYinFuzzSearch<T>(
    word: string,
    list: T[],
    options?: PinYinFuzzSearchOption<T>,
): T[] {
    options = _mergedDefaultOption(options);

    console.log(word, list, options);
    return [];
}

/**
 * 设置默认配置项
 *
 * @param options - 用户提供的配置
 */
function _mergedDefaultOption<T>(
    options?: PinYinFuzzSearchOption<T>,
): PinYinFuzzSearchOption<T> {
    return {
        sort: options?.sort ?? true,
        multiple: options?.multiple ?? 'ALL',
        separator: options?.separator ?? ' ',
        /**
         * 由用户提供进行匹配的字符串字段
         *
         * @param item - 待搜索数组中的一项
         */
        textProvider: (item: T) => item as unknown as string,
    };
}

/**
 * 支持的配置项
 */
export interface PinYinFuzzSearchOption<T> {
    /** 是否将匹配后的结果按照匹配相似度排序，相信度越高，在结果数组中越靠前，默认 true，如果为 false，则按照用户传入的顺序 */
    sort?: boolean;

    /** 多词同时搜索时，搜索策略，ALL(需全部命中，默认值)、ANY(命中一个即可) */
    multiple?: 'ALL' | 'ANY';

    /** 多词同时搜索时，分隔符，默认空格 */
    separator?: string;

    /** 自定义提供要匹配的字段 */
    textProvider?: (item: T) => string;
}
