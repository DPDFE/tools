<template>
    <div id="app">
        <div class="container">
            <input type="text" v-model="word" />
            <br />
            <select placeholder="sort" v-model="sort">
                <option value="ASC">ASC</option>
                <option value="DESC">DESC</option>
                <option value="AUTO">AUTO</option>
                <option value="RAW">RAW</option>
            </select>

            <select
                placeholder="sort"
                v-model="multiple"
                style="margin-left: 5px"
            >
                <option value="ALL">ALL</option>
                <option value="ANY">ANY</option>
            </select>

            <input
                placeholder="分隔符"
                style="width: 50px; margin-left: 5px"
                type="text"
                v-model="separator"
            />
            <br />
            <textarea
                style="margin-top: 5px; height: 120px; width: 300px"
                type="text"
                v-model="list"
            ></textarea>
            <br />
            <button @click="match">匹配</button>
            <br />
            <p>匹配结果：{{ result }}</p>
        </div>
    </div>
</template>

<script>
import pinYinFuzzSearch from '@/pinyin_search';

export default {
    methods: {
        match() {
            let list = this.list.replaceAll('，', ',').split(',');
            const result = pinYinFuzzSearch(this.word, list, {
                sort: this.sort,
                multiple: this.multiple,
                separator: this.separator,
            });
            this.result = result;
        },
    },
    data() {
        return {
            sort: 'ASC',
            multiple: 'ANY',
            separator: ',',
            word: 'bj',
            list: '北京市,天津市,河北省,山西省,内蒙古自治区,辽宁省,吉林省,黑龙江省,上海市,江苏省,浙江省,安徽省,福建省,江西省,山东省,河南省,湖北省,湖南省,广东省,广西壮族自治区,海南省,重庆市,四川省,贵州省,云南省,西藏自治区,陕西省,甘肃省,青海省,宁夏回族自治区,新疆维吾尔自治区',
            result: ['北京市'],
        };
    },
};
</script>

<style></style>
