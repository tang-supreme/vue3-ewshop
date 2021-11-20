<template>
  <div id="home">
    <!-- 这是导航 -->
    <nav-bar>
      <template v-slot:default>图书兄弟</template>
    </nav-bar>

    <tab-control v-show="isTabFixed" @tabClick="tabClick" :titles="['畅销', '新书', '精选']"></tab-control>

    <div class="wrapper">
      <div class="content">
        <!-- banner -->
        <div ref="banref">
          <home-swiper :banners='banners'></home-swiper>
          <!-- 推荐部分 -->
          <recommend-view :recommends="recommends"></recommend-view>
        </div>
        
        <!-- 首页选项卡 -->
        <tab-control @tabClick="tabClick" :titles="['畅销', '新书', '精选']"></tab-control>
        <!-- 商品列表 -->
        <goods-list :goods="showGoods"></goods-list>
      </div>
    </div>

    <back-top @bTop="bTop" v-show="isShowBackTop"></back-top>
  </div>
</template>

<script>
import HomeSwiper from "./ChildComps/HomeSwiper";
import NavBar from "components/common/navbar/NavBar";
import RecommendView from "./ChildComps/RecommendView";
import TabControl from "components/content/tabControl/TabControl";
import GoodsList from "components/content/goods/GoodsList";
import BackTop from "components/common/backtop/BackTop";

import { getHomeAllData, getHomeGoods } from "network/home";
import { ref, reactive, onMounted, computed, watchEffect, nextTick } from "vue";

import BScroll from "better-scroll";

export default {
  name: "Home",
  setup() {
    // 定义数据
    let isTabFixed = ref(false);
    let isShowBackTop = ref(false);
    let bscroll = reactive({});
    let banref = ref(null);
    let banners = ref([])
    const recommends = ref([]);
    let currentType = ref("sales");
    const goods = reactive({
      sales: { page: 1, list: [] },
      new: { page: 1, list: [] },
      recommend: { page: 1, list: [] },
    });

    // 计算属性
    const showGoods = computed(() => {
      return goods[currentType.value].list;
    });

    // 请求数据
    onMounted(() => {
      // 首页数据
      getHomeAllData().then((res) => {
        // console.log(res);
        recommends.value = res.goods.data;
        banners.value = res.slides
      });

      // 请求选项卡各项数据
      getHomeGoods("sales").then((res) => {
        goods.sales.list = res.goods.data;
      });
      getHomeGoods("recommend").then((res) => {
        goods.recommend.list = res.goods.data;
      });
      getHomeGoods("new").then((res) => {
        goods.new.list = res.goods.data;
      });

      // 创建betterscroll对象
      bscroll = new BScroll(document.querySelector(".wrapper"), {
        observeDOM: true,
        observeImage: true, // 开启 observe-image 
        probeType:3,
        click: true, //是否允许点击
        pullUpLoad: true // 上拉加载更多，默认是false
      });

      // 触发滚动事件
      bscroll.on('scroll',(position)=>{
        // console.log(banref.value.offsetHeight);
        // console.log("y的值"+-position.y)
        isShowBackTop.value = isTabFixed.value = (-position.y) > banref.value.offsetHeight
      })

      // 上拉加载数据,触发pullingUp
      bscroll.on('pullingUp',()=>{
        console.log('上拉加载更多');

        const page = goods[currentType.value].page + 1
        console.log(page);
        getHomeGoods(currentType.value,page).then(res=>{
          goods[currentType.value].list.push(...res.goods.data)
          goods[currentType.value].page += 1
        })

        // 完成上拉，等数据请求完成，要将新数据展示出来
        bscroll.finishPullUp();

        // 重新计算高度
        bscroll.refresh()
        
        
      })
    });

    // tabcontrol传递过来的选项卡
    const tabClick = (index) => {
      let types = ["sales", "new", "recommend"];
      currentType.value = types[index];
    };

    // 监听任何一个变量有变量
    watchEffect(()=>{
      nextTick(()=>{
        // 重新计算高度
        bscroll && bscroll.refresh()
      })
    })

    // 滚回到顶部
    const bTop = () =>{
      bscroll.scrollTo(0,0,500)
    }

    return {
      recommends,
      currentType,
      goods,
      showGoods,
      isTabFixed,
      tabClick,
      banref,
      banners,
      isShowBackTop,
      bTop
    };
  },
  components: {
    HomeSwiper,
    NavBar,
    RecommendView,
    TabControl,
    GoodsList,
    BackTop
  },
};
</script>

<style scoped>
.banner img {
  width: 100%;
  height: auto;
  /* margin-top: 45px; */
}
#home{
  height: 100vh;
  position: relative;
}
.wrapper{
  position:absolute;
  top: 45px;
  bottom: 45px;
  left: 0;
  right: 0;
  overflow: hidden;
}
</style>