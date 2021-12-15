import {dict} from './dict';
import levenshtein from 'js-levenshtein';

// 汉字 -> 拼音索引 eg: 省 -> 'sheng xing'
const pinyin_map = new Map<string, string>();

const chinese_regex = /.*[\u4e00-\u9fa5]+.*$/;
const english_regex = /[a-zA-Z]/g;
const all_chinese_regex = /^[\u4e00-\u9fa5]+$/;

const all_pinyin = Object.keys(dict);

/** 多音节声母也应用于分词 */
const additional_pinyin_prefix = ['zh', 'ch', 'sh'];

/**
 * 所有拼音和拼音首字母
 * 用于分词和英文匹配
 * @deprecated 及二十六个字母
 */
const pinyin_prefix = new Set<string>([
    ...all_pinyin,
    ...additional_pinyin_prefix,
    ...all_pinyin.map((pinyin) => pinyin[0]),
    // ...Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i)),
]);

/**
 * 建立汉字 - 拼音索引 包含同个汉字的多发音pinyin_map
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
) {
    return pinyinFuzzySearchAdvance(word, list, options, false).result;
}

/**
 * 高级拼音模糊搜索，返回匹配位置等更多信息`性能消耗会增加`
 *
 * @param word - 搜索词
 * @param list - 在哪个数组中搜索
 * @param options - 搜索配置项
 */
export function pinyinFuzzySearchAdvance<T>(
    word: string,
    list: T[],
    options?: PinYinFuzzAdvanceSearchOption<T>,
    advance = true,
) {
    word = word.toLowerCase();
    options = _mergedDefaultOption(options);
    options.advance = advance;

    let result: T[] = [];

    if (pinyin_map.size === 0) create_pinyin_map();

    const string_list = list.map(options.textProvider!);

    const pinyin_list = getPinYinList(string_list);

    // 保存匹配词的位置，拼音先匹配的优先 如：sx -> 山西省 应排在 四川省 前面
    const match_weight_index: Record<number, number> = {};
    // 匹配词位置权重
    const match_weight: Map<T, number> = new Map();

    // 匹配词位置，用于高亮
    const match_position_index: number[][] = [];
    // 匹配词位置
    const match_position: Map<T, number[]> = new Map();

    // 连续词个数，优先匹配连续的词 eg: dsj -> 学大数据 应排在 大学数据 前面
    const consecutive_match_index: Record<number, number> = {};
    // 连续词个数权重
    const consecutive_match_weight: Map<T, number> = new Map();

    word.split(options.separator!).forEach((w) => {
        if (all_chinese_regex.test(w)) {
            // 全是中文，直接匹配
            // const index_arr: number[] = [];
            // string_list.forEach((str, index) => {
            //     if (str.includes(w)) {
            //         index_arr.push(index);
            //     }
            // });

            const index_arr = getMatchResult(
                string_list.map((str) => str.split('')),
                word,
                options!,
                [w],
                match_weight_index,
                match_position_index,
                consecutive_match_index,
                true,
            );

            let result_list = index_arr.map((index) => list[index]);

            Object.keys(match_weight_index).forEach((key, index) => {
                match_weight.set(
                    list[parseInt(key)],
                    match_weight_index[parseInt(key)],
                );
                consecutive_match_weight.set(
                    list[parseInt(key)],
                    consecutive_match_index[parseInt(key)],
                );
                match_position.set(
                    list[parseInt(key)],
                    match_position_index[index],
                );
            });

            result_list = sortResult(
                result_list,
                w,
                options!,
                match_weight,
                consecutive_match_weight,
            );

            [result, result_list] = intersectResult(
                result_list,
                result,
                options,
            );

            result.push(...result_list);
        } else if (chinese_regex.test(w)) {
            // 部分中文，中文转成拼音再查找

            const _w = w
                .toLowerCase()
                .split('')
                .map((c) => {
                    if (pinyin_map.has(c)) {
                        return pinyin_map.get(c)!.split(' ')[0];
                    }
                    return c;
                })
                .join('')
                .trim();

            let result_list = getResultList(
                pinyin_list,
                list,
                _w,
                options!,
                match_weight_index,
                match_weight,
                match_position_index,
                match_position,
                consecutive_match_index,
                consecutive_match_weight,
            );

            result_list = sortResult(
                result_list,
                w,
                options!,
                match_weight,
                consecutive_match_weight,
            );

            [result, result_list] = intersectResult(
                result_list,
                result,
                options,
            );

            result.push(...result_list);
        } else {
            // 全是英文，用拼音分词查找
            let result_list = getResultList(
                pinyin_list,
                list,
                w,
                options!,
                match_weight_index,
                match_weight,
                match_position_index,
                match_position,
                consecutive_match_index,
                consecutive_match_weight,
            );

            result_list = sortResult(
                result_list,
                w,
                options!,
                match_weight,
                consecutive_match_weight,
            );

            [result, result_list] = intersectResult(
                result_list,
                result,
                options,
            );

            result.push(...result_list);
        }
    });

    // RAW 需要无视分词排序
    if (options.sort === 'RAW') {
        return {
            result: getRawResult([...new Set(result)], list),
            position: match_position,
        };
    }

    return {
        result: [...new Set(result)],
        position: match_position,
    };
}

/**
 * 获取拼音分词后的匹配结果
 *
 * @param pinyin_list - 拼音化的带匹配词
 * @param list - 原始list
 * @param word - 待匹配词
 * @param options - 配置
 * @param match_weight_index - 匹配词权重array
 * @param match_weight - 匹配词权重map
 * @param match_position_index - 匹配词位置array
 * @param match_position - 匹配词位置map
 * @param consecutive_match_index - 连续匹配array
 * @param consecutive_match_weight - 连续匹配权重map
 * @returns
 */
function getResultList<T>(
    pinyin_list: string[][],
    list: T[],
    word: string,
    options: PinYinFuzzAdvanceSearchOption<T>,
    match_weight_index: Record<number, number>,
    match_weight: Map<T, number>,
    match_position_index: number[][],
    match_position: Map<T, number[]>,
    consecutive_match_index: Record<number, number>,
    consecutive_match_weight: Map<T, number>,
) {
    // 对搜索input拼音分词
    const break_list = getAllPinyinBreak(0, word.toLowerCase());

    // 待匹配的拼音list
    let _pinyin_list = pinyin_list;

    // 源格式的list
    let _list = list;

    // 拼音分词后长度过长，会增加匹配复杂度，先查找一次限定待匹配list的长度
    if (break_list.length * _pinyin_list.length > 10000) {
        const _break_list = getAllPinyinBreak(
            0,
            word.toLowerCase().substring(0, 5),
        );

        const index_arr = getMatchResult(
            _pinyin_list,
            word,
            options,
            _break_list,
            match_weight_index,
            match_position_index,
            consecutive_match_index,
        );

        _pinyin_list = index_arr.map((index) => _pinyin_list[index]);
        _list = index_arr.map((index) => _list[index]);
    }

    const index_arr = getMatchResult(
        _pinyin_list,
        word,
        options,
        break_list,
        match_weight_index,
        match_position_index,
        consecutive_match_index,
    );

    Object.keys(match_weight_index).forEach((key, index) => {
        match_weight.set(
            list[parseInt(key)],
            match_weight_index[parseInt(key)],
        );
        consecutive_match_weight.set(
            list[parseInt(key)],
            consecutive_match_index[parseInt(key)],
        );
        match_position.set(list[parseInt(key)], match_position_index[index]);
    });

    const result_list = index_arr.map((index) => _list[index]);

    return result_list;
}

/**
 * 对结果求并集
 *
 * @param result_list - 当前的结果
 * @param result - 上次的结果
 * @param options - option
 */
function intersectResult<T>(
    result_list: T[],
    result: T[],
    options?: PinYinFuzzSearchOption<T>,
) {
    if (
        options?.multiple === 'ALL' &&
        result.length !== 0 &&
        result_list.length !== 0
    ) {
        result_list = result_list.filter((r) => result.includes(r));
        result = result.filter((r) => result_list.includes(r));
    }

    return [result, result_list];
}

/**
 * 对返回结果排序
 *
 * @param result - 返回结果
 * @param word - 带匹配词
 * @param options - 选项
 * @param match_weight - 匹配位置权重
 * @param consecutive_match_weight - 连续词权重
 * @returns
 */
function sortResult<T>(
    result: T[],
    word: string,
    options: PinYinFuzzSearchOption<T>,
    match_weight: Map<T, number>,
    consecutive_match_weight: Map<T, number>,
) {
    const toText = options!.textProvider!;

    switch (options!.sort) {
        case 'RAW':
            // RAW不在这处理
            return result;
        case 'DESC':
            return result.sort((a, b) => toText(b).localeCompare(toText(a)));
        case 'ASC':
            return result.sort((a, b) => toText(a).localeCompare(toText(b)));
        case 'AUTO':
            // levenshtein -> 搜索词顺序 -> 结果词长度 -> 字母升序 -> 匹配词位置 -> 连续词长度
            return result.sort((a, b) => {
                const consecutive_weight =
                    consecutive_match_weight.get(b)! -
                    consecutive_match_weight.get(a)!;

                if (
                    consecutive_match_weight.get(b)! ===
                    consecutive_match_weight.get(a)!
                ) {
                    const position =
                        match_weight.get(a)! - match_weight.get(b)!;

                    if (position === 0) {
                        const comp = toText(a).localeCompare(toText(b));
                        if (!comp) {
                            const len = toText(a).length - toText(b).length;
                            if (!len) {
                                return (
                                    levenshtein(word, toText(a)) -
                                    levenshtein(word, toText(b))
                                );
                            }
                            return len;
                        }
                        return comp;
                    }
                    return position;
                }
                return consecutive_weight;
            });

        default:
            return result;
    }
}

/**
 * Raw 排序 完全按照输入顺序来排
 *
 * @param - 返回结果
 * @param - 原list
 */
function getRawResult<T>(result: T[], list: T[]) {
    const list_map = new Map<T, number>();

    list.forEach((item, index) => {
        list_map.set(item, index);
    });

    return result.sort((a, b) => list_map.get(a)! - list_map.get(b)!);
}

/**
 * 获取拼音转换后的list
 *
 * @param list - 在哪个数组中搜索
 */
function getPinYinList(list: string[]) {
    const pinyin_list = list.map((words) => {
        const pinyin_arr: string[] = [];

        for (const character of words.toString()) {
            pinyin_arr.push(
                pinyin_map.get(character.toLowerCase()) ??
                    character.toLowerCase(),
            );
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
        const s_word = word.substring(begin, i + 1).toLowerCase();

        if (pinyin_prefix.has(s_word)) {
            result.push(s_word);
            word_break.push(...getAllPinyinBreak(i + 1, word, result));
            result.pop();
        } else if (!isNaN(Number(s_word))) {
            result.push(s_word);
            word_break.push(...getAllPinyinBreak(i + 1, word, result));
            result.pop();
        }
    }

    return word_break;
}

/**
 * 获取匹配结果
 *
 * @param pinyin_list - 拼音化的list
 * @param word - word
 * @param options - 选项
 * @param word_break - 分词后的word
 * @param match_weight_index - 匹配权重
 * @param match_position_index - 匹配位置
 * @param consecutive_match_index - 连续匹配权重
 * @param is_character - 是否是匹配汉字
 * @returns
 */
function getMatchResult<T>(
    pinyin_list: string[][],
    word: string,
    options: PinYinFuzzAdvanceSearchOption<T>,
    word_break: string[],
    match_weight_index: Record<string, number>,
    match_position_index: number[][],
    consecutive_match_index: Record<string, number>,
    is_character = false,
) {
    const res: number[] = [];
    const single_word_map: Record<string, Array<string>> = {};

    if (!is_character) {
        word_break.forEach((word) => {
            single_word_map[word] = word.split(' ');
        });
    }

    pinyin_list.forEach((list_word: string[], index) => {
        const original_word = list_word.join('');
        const original_index = original_word.indexOf(word);
        // 首次匹配位置，用来记录最长匹配长度
        let first_match_position = 0;
        // 上次匹配位置，用来记录最长匹配长度
        let last_match_position = 0;
        // 最大匹配长度
        let max_consecutive_match_len = 0;

        consecutive_match_index[index] = max_consecutive_match_len;

        // 提前进行一次不间隔非模糊匹配，降低匹配复杂度
        if (
            original_index !== -1 &&
            !(options.advance && !all_chinese_regex.test(word))
        ) {
            res.push(index);
            match_weight_index[index] = original_index;

            consecutive_match_index[index] = Infinity;

            match_position_index.push(
                Array.from({length: word.length}, (_, i) => original_index + i),
            );

            return;
        }

        word_break.forEach((word) => {
            // list_index, single_word_index
            let l_index = 0,
                s_index = 0;

            let single_word: string | string[] = word;
            const tmp_position: number[] = [];

            if (!is_character) {
                single_word = single_word_map[word];
            }

            if (single_word.length > list_word.length) {
                // 若拼音分词后长度大于带匹配词的长度，直接退出
                return;
            }

            while (l_index < list_word.length && s_index < single_word.length) {
                if (
                    list_word[l_index]
                        .split(' ')
                        .find((s) => s.startsWith(single_word[s_index]))
                ) {
                    if (l_index - last_match_position > 0) {
                        last_match_position++;
                        if (
                            last_match_position - first_match_position >
                            max_consecutive_match_len
                        ) {
                            max_consecutive_match_len =
                                last_match_position - first_match_position;
                        }
                    } else {
                        first_match_position = l_index;
                        last_match_position = l_index;
                    }

                    tmp_position.push(l_index);
                    l_index++;
                    s_index++;
                } else {
                    l_index++;
                    last_match_position = l_index;
                }

                if (s_index === single_word.length) {
                    match_position_index.push(tmp_position);

                    // if (l_index - last_match_position === 1) {
                    //     last_match_position = l_index;
                    // } else {
                    //     last_match_position = index + 1;
                    // }

                    res.push(index);
                    match_weight_index[index] = l_index;
                    return;
                }
            }
        });
        if (consecutive_match_index[index] < max_consecutive_match_len) {
            consecutive_match_index[index] = max_consecutive_match_len;
        }
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

/**
 * 高级配置，扩充了advance选项
 */
interface PinYinFuzzAdvanceSearchOption<T> extends PinYinFuzzSearchOption<T> {
    advance?: boolean;
}
