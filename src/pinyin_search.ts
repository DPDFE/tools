import {dict} from './dict';
import levenshtein from 'js-levenshtein';

// 汉字 -> 拼音索引
const pinyin_map = new Map<string, string>();

const chinese_regex = /.*[\u4e00-\u9fa5]+.*$/;
const english_regex = /[a-zA-Z]/g;
const all_chinese_regex = /^[\u4e00-\u9fa5]+$/;

const all_pinyin = Object.keys(dict);

// 所有拼音及拼音首字母，用于分词
const pinyin_prefix = new Set<string>([
    ...all_pinyin,
    ...all_pinyin.map((w) => w[0]),
]);

/**
 * 建立汉字 - 拼音索引 包含同个汉字的多发音
 */
function create_pinyin_map() {
    for (const [key, characters] of Object.entries(dict)) {
        for (const character of characters) {
            if (pinyin_map.has(character)) {
                pinyin_map.set(
                    character,
                    pinyin_map.get(character) + ` ${key}`,
                );
            } else {
                pinyin_map.set(character, key);
            }
        }
    }
}

const options: PinYinFuzzSearchOption<string> = {sort: 'RAW'};

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
    let result: T[] = [];

    if (pinyin_map.size === 0) create_pinyin_map();

    const string_list = list.map(options.textProvider!);

    const pinyin_list = getPinYinList(string_list);

    word.split(options.separator!).forEach((w) => {
        if (chinese_regex.test(w)) {
            // 中文转成拼音，再搜索

            const _w = w
                .split('')
                .map((c) => {
                    if (pinyin_map.has(c)) {
                        return pinyin_map.get(c)!.split(' ')[0];
                    }
                    return c;
                })
                .join('')
                .trim();

            const break_list = getAllPinyinBreak(0, _w);

            const index_arr = getMatchResult(
                pinyin_list,
                break_list,
                options as unknown as any,
            );

            let result_list = index_arr.map((index) => list[index]);

            result_list = sortResult(result_list, w, options!);

            if (
                options?.multiple === 'ALL' &&
                result.length !== 0 &&
                result_list.length !== 0
            ) {
                result_list = result_list.filter((r) => result.includes(r));
                result = result.filter((r) => result_list.includes(r));
            }

            result.push(...result_list);
        } else {
            // 无中文时，用拼音分词查找
            const break_list = getAllPinyinBreak(0, w);

            const index_arr = getMatchResult(
                pinyin_list,
                break_list,
                options as unknown as any,
            );

            let result_list = index_arr.map((index) => list[index]);

            result_list = sortResult(result_list, w, options!);

            if (
                options?.multiple === 'ALL' &&
                result.length !== 0 &&
                result_list.length !== 0
            ) {
                result_list = result_list.filter((r) => result.includes(r));
                result = result.filter((r) => result_list.includes(r));
            }

            result.push(...result_list);
        }
    });

    return [...new Set(result)];
}

/**
 * 对返回结果排序
 *
 * @param result - 返回结果
 * @param word - 带匹配单词
 * @param options - 选项
 */
function sortResult<T>(
    result: T[],
    word: string,
    options: PinYinFuzzSearchOption<T>,
) {
    switch (options!.sort) {
        case 'RAW':
            return result;
            break;
        case 'ASC':
            return result.sort((a, b) =>
                options!.textProvider!(a).localeCompare(
                    options!.textProvider!(b),
                ),
            );
            break;
        case 'DESC':
            return result.sort((a, b) =>
                options!.textProvider!(b).localeCompare(
                    options!.textProvider!(a),
                ),
            );
            break;
        case 'AUTO':
            return result
                .sort((a, b) =>
                    options!.textProvider!(a).localeCompare(
                        options!.textProvider!(b),
                    ),
                )
                .sort(
                    (a, b) =>
                        levenshtein(word, options!.textProvider!(a)) -
                        levenshtein(word, options!.textProvider!(b)),
                );
            break;
        default:
            return result;
            break;
    }
}
/**
 * 获取拼音转换后的list
 *
 * @param list - 在哪个数组中搜索
 */
function getPinYinList(list: string[]) {
    const pinyin_list = (list as unknown as string[]).map((words) => {
        const pinyin_arr: string[] = [];

        for (const character of words) {
            pinyin_arr.push(pinyin_map.get(character) ?? character);
        }

        return pinyin_arr;
    });

    return pinyin_list;
}

/**
 * 返回拼音的所有分词
 *
 * @param begin - 开始位置
 * @param word - 需要分词的[拼音] 不要输入汉字
 * @param result - 递归用
 * @returns
 */
function getAllPinyinBreak(begin: number, word: string, result: string[] = []) {
    if (begin === word.length) {
        return [result.join(' ')];
    }

    let word_break: string[] = [];

    for (let i = begin; i < word.length; i++) {
        const s_word = word.substring(begin, i + 1);

        if (pinyin_prefix.has(s_word)) {
            result.push(s_word);
            word_break = getAllPinyinBreak(i + 1, word, result);
            result.pop();
        }
    }

    return word_break;
}

/**
 * 获取匹配结果
 *
 * @param pinyin_list - 拼音化的list
 * @param word_break - 分词后的word
 * @param list - 原list
 * @returns
 */
function getMatchResult(
    pinyin_list: string[][],
    word_break: string[],
    options: PinYinFuzzSearchOption<string>,
) {
    const res: number[] = [];

    pinyin_list.forEach((list_word: string[], index) => {
        word_break.forEach((word) => {
            let l_index = 0,
                s_index = 0;
            const single_word = word.split(' ');

            while (l_index < list_word.length && s_index < single_word.length) {
                if (
                    list_word[l_index]
                        .split(' ')
                        .find((s) => s.startsWith(single_word[s_index]))
                ) {
                    l_index++;
                    s_index++;
                } else {
                    l_index++;
                }

                if (s_index === single_word.length) {
                    // if (options?.multiple === 'ANY') {
                    res.push(index);
                    // s_index === l_index 时为严格匹配
                    // } else if (s_index === l_index) {
                    //     res.push(index);
                    // }
                }
            }
        });
    });
    return res;
}
/**
 * 设置默认配置项
 *
 * @param options - 用户提供的配置
 */
function _mergedDefaultOption<T>(
    options?: PinYinFuzzSearchOption<T>,
): Required<PinYinFuzzSearchOption<T>> {
    return {
        sort: options?.sort ?? 'AUTO',
        multiple: options?.multiple ?? 'ALL',
        separator: options?.separator ?? ' ',
        /**
         * 由用户提供进行匹配的字符串字段
         *
         * @param item - 待搜索数组中的一项
         */
        textProvider:
            options?.textProvider ?? ((item: T) => item as unknown as string),
    };
}

/**
 * 支持的配置项
 */
export interface PinYinFuzzSearchOption<T> {
    /** auto: 是否将匹配后的结果按照匹配相似度排序，相信度越高，在结果数组中越靠前，如果相似度相同，则按照字母升序，默认 auto。如果为 raw，则按照用户传入的顺序 */
    sort?: 'ASC' | 'DESC' | 'AUTO' | 'RAW';

    /** 多词同时搜索时，搜索策略，ALL(需全部命中，默认值)、ANY(命中一个即可) */
    multiple?: 'ALL' | 'ANY';

    /** 多词同时搜索时，分隔符，默认空格 */
    separator?: string;

    /** 自定义提供要匹配的字段 */
    textProvider?: (item: T) => string;
}
