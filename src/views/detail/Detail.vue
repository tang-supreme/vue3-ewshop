<template>
  <div>
    <nav-bar>
      <template v-slot:default>商品详情:{{ id }}</template>
    </nav-bar>

    <van-image
      style="margin-top: 50px"
      width="100%"
      lazy-load
      :src="detail.cover_url"
    />

    <van-card
      style="text-align: left"
      :num="detail.stock"
      :price="detail.price + '.00'"
      :desc="detail.description"
      :title="detail.title"
    >
      <template #tags>
        <van-tag plain type="danger">新书</van-tag>
        <van-tag plain type="danger">推荐</van-tag>
      </template>
      <template #footer>
        <van-button type="warning" @click="handleAddCart">加入购物车</van-button>
        <van-button type="danger" @click="goToCart">立即购买</van-button>
      </template>
    </van-card>

    <van-tabs v-model="active">
      <van-tab title="概述">
        <div id="con1" v-html="detail.details"></div>
      </van-tab>
      <van-tab title="热评"> </van-tab>
      <van-tab title="相关图书">
        <goods-list :goods="like_goods"></goods-list>
      </van-tab>
    </van-tabs>

    <!-- <h1>这是商品详情部分</h1>
      <h4>我是商品{{ detail.title }}</h4> -->
  </div>
</template>

<script>
import NavBar from "components/common/navbar/NavBar";
import GoodsList from "components/content/goods/GoodsList";

import { onMounted, ref, reactive, toRefs } from "vue";

import { useRoute } from "vue-router";
import {useStore} from 'vuex';

import { getDetail } from "network/detail";
import { addCart } from "network/cart";
import {Toast} from 'vant';

export default {
  name: "Detail",
  setup() {
    const route = useRoute();
    const store = useStore();
    let active = ref(2)

    let id = ref(0);
    let book = reactive({
      detail: {},
      like_goods: [],
    });

    onMounted(() => {
      id.value = route.query.id;
      getDetail(id.value).then((res) => {
        book.detail = res.goods;
        book.like_goods = res.like_goods;
      });
    });

    // 添加购物车事件
    const handleAddCart = () =>{
      addCart({goods_id:book.detail.id,num:1}).then(res=>{
        // console.log(res);
        // 首次添加状态码为201；第二次添加状态码为204
        if(res.status == '204' || res.status == '201'){
          Toast.success('添加成功')
          // 设置store中的cartCount 异步修改数据
          store.dispatch('updateCart')
        }
      })
    }

    // 立即购买事件
    const goToCart = () =>{
      addCart({goods_id:book.detail.id,num:1}).then(res=>{
        if(res.status == '204' || rs.status == '201'){
        Toast.success('添加成功，显示在购物车')

        }
      })
    }

    return {
      id,
      ...toRefs(book),
      active,
      handleAddCart,
      goToCart,
    };
  },
  components: {
    NavBar,
    GoodsList,
  },
};
</script>

<style  scoped lang="scss">
#con1 {
  padding: 10px;
}
</style>