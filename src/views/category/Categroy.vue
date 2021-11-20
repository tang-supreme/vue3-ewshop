<template>
  <div>
    <div id="home">
      <nav-bar>
        <template v-slot:default>商品分类</template>
      </nav-bar>

      <div id="mainbox">

        <div class="ordertab">
          <van-tabs v-model="active" @click="tabClick">
            <van-tab title="销量排序"></van-tab>
            <van-tab title="价格排序"></van-tab>
            <van-tab title="评论排序"></van-tab>
          </van-tabs>
        </div>

        <!-- 商品分类左侧部分 -->
        <van-sidebar class="leftmenu" v-model="activeKey">
          <van-collapse v-model="activeName" accordion>
            <van-collapse-item v-for="item in categories" :key="item.id"
                               :title="item.name"
                               :name="item.name">

              <van-sidebar-item v-for="sub in item.children" :key="sub.id"
                                :title="sub.name"
                                @click="getGoods(sub.id)"
                                />
            </van-collapse-item>
          </van-collapse>
        </van-sidebar>

        <div class="goodslist">
          <div class="content">
            <van-card v-for="item in showGoods" :key="item.id"
              @click="itemClick(item.id)"
              :num="item.comments_count"
              :tag="item.comments_count >= 0 ? '流行' : '标签'"
              :price="item.price"
              desc="这个是描述信息..."
              :title="item.title"
              :thumb="item.cover_url"
              :lazy-load="true"
            />
          </div>
        </div>

      </div>
    </div>
    <back-top @bTop="bTop" v-show="isShowBackTop"></back-top>
  </div>
</template>

<script>
import NavBar from "components/common/navbar/NavBar";
import BackTop from "components/common/backtop/BackTop"

import { computed, onMounted, reactive, ref ,watchEffect, nextTick} from "vue";
import { useRouter } from 'vue-router';

import { getCategory, getCategoryGoods } from "network/category";

import BScroll from 'better-scroll';

export default {
  name: "Categroy",
  setup() {
    const router = useRouter()
    const active = ref(1);
    const activeName = ref(1);
    const activeKey = ref(0)
    let categories = ref([]);
    let isShowBackTop = ref(false);

    let bscroll = reactive({});

    // 当前排序条件
    let currentOrder = ref('sales');
    // 当前的分类ID
    let currentCid = ref(0)
    // 设置一个数据模型
    const goods = reactive({
      sales:{page:0, list:[]},
      price:{page:0, list:[]},
      comments_count:{page:0, list:[]}
    })

    // 设置一个计算属性
    const showGoods = computed(()=>{
      return goods[currentOrder.value].list
    })

    // 获取数据
    const init = () =>{
      getCategoryGoods('sales',currentCid.value).then(res=>{
        goods.sales.list = res.goods.data
      })
      
      getCategoryGoods('price',currentCid.value).then(res=>{
        goods.price.list = res.goods.data
      })

      getCategoryGoods('comments_count',currentCid.value).then(res=>{
        goods.comments_count.list = res.goods.data
      })
    }

    onMounted(() => {
      getCategory().then((res) => {
        categories.value = res.categories;
      });

      // 调用init方法
      init()

      // 创建BetterScroll对象
      bscroll = new BScroll(document.querySelector('.goodslist'), {
        observeDOM: true,
        observeImage: true, // 开启 observe-image
        probeType: 3,  // 0, 1, 2, 3, 3 只要在运运就触发scroll事件
        click: true, // 是否允许点击
        pullUpLoad: true //上拉加载更多， 默认是false
      });

      // 注册滚动事件
      bscroll.on('scroll', (position)=>{
        // console.log(position);
        
        isShowBackTop.value = (-position.y) > 300
      })

      // 上拉加载数据,触发pullingUp
      bscroll.on("pullingUp", ()=>{
        console.log('上拉加载更多.....')
        const page = goods[currentOrder.value].page + 1;
        getCategoryGoods(currentOrder.value, currentCid.value).then(res=>{
          goods[currentOrder.value].list.push(...res.goods.data);
          goods[currentOrder.value].page +=1;
        })
        // 完成上拉， 等数据请求完成， 要将新数据展示出来
        bscroll.finishPullUp();
        //重新计算高度
        nextTick(()=>{
        // 重新计算高度
          bscroll &&  bscroll.refresh();
        })
        // console.log("contentheight:"+document.querySelector('.content').clientHeight);
        // console.log("当前类型:"+currentOrder.value+",当前页："+page);
      })

    });

    // 排序选项卡
    const tabClick = (index) =>{
      console.log(index);
      let orders = ['sales', 'price', 'comments_count']
      currentOrder.value = orders[index]

      getCategoryGoods(currentOrder.value,currentCid.value).then(res=>{
        goods[currentOrder.value].list = res.goods.data
        nextTick(()=>{
          // 重新计算高度
          bscroll &&  bscroll.refresh();
        })
      })
    }

    // 通过分类get商品
    const getGoods = (cid) =>{
      currentCid.value = cid;
      init()
    }

    // 监听 任何一个变量有变量
    watchEffect(()=>{
        nextTick(()=>{
           // 重新计算高度
            bscroll &&  bscroll.refresh();
        })
    })

    // 返回到顶部
    const bTop = ()=>{
      bscroll.scrollTo(0, 0, 300);
    }

    

    return {
      bscroll,
      active,
      activeName,
      activeKey,
      categories,
      currentOrder,
      currentCid,
      goods,
      init,
      showGoods,
      isShowBackTop,
      tabClick,
      getGoods,
      bTop,
      itemClick:(id)=>{
        console.log(id)
        router.push({path:'/detail',query:{id}})
      }
    };
  },
  components: {
    NavBar,
    BackTop
  },
};
</script>

<style scoped lang="scss">
#mainbox {
  margin-top: 45px;
  display: flex;
  .ordertab {
    flex: 1;
    // background-color: red;
    float: left;
    position: fixed;
    right: 0;
    top: 45px;
    left: 130px;
    z-index: 9;
    height: 50px;
    // width: 100%;
  }
  .leftmenu {
    // background-color: yellow;
    position: fixed;
    top: 95px;
    left: 0;
    width: 130px;
    // height: 400px;
  }
  .goodslist {
    // background-color: blue;
    position: absolute;
    top: 100px;
    left: 130px;
    height: 100vh;
    padding: 10px;
    text-align: left !important;
    // width: 240px;
  }
}
</style>