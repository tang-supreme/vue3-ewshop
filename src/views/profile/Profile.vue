<template>
  <div>
    <div id="box">
      <nav-bar class="nav-bar">
        <template v-slot:default>个人中心</template>
      </nav-bar>

      <!-- 个人中心主页面 -->
      <div class="user-box">
        <!-- 用户信息 -->
        <div class="user-info">
          <div class="info">
            <img :src="user.avatar_url" alt="">
            <div class="user-desc">
              <span>昵称：{{user.name}}</span>
              <span>登录名：{{user.email}}</span>
              <span class="name">个人签名：成就自己的只需要一套精品</span>
            </div>
          </div>
        </div>
        <!-- 用户列表 -->
        <ul class="user-list">
          <li class="van-hairline--bottom" @click="goTo('/collect')">
            <span>我的收藏</span>
            <van-icon name="arrow"></van-icon>
          </li>
          <li class="van-hairline--bottom" @click="goTo('/order')">
            <span>我的订单</span>
            <van-icon name="arrow"></van-icon>
          </li>
          <li class="van-hairline--bottom" @click="goTo('/setting')">
            <span>账号管理</span>
            <van-icon name="arrow"></van-icon>
          </li>
          <li class="van-hairline--bottom" @click="goTo('/address')">
            <span>地址管理</span>
            <van-icon name="arrow"></van-icon>
          </li>
          <li class="van-hairline--bottom" @click="goTo('/about')">
            <span>关于我们</span>
            <van-icon name="arrow"></van-icon>
          </li>
        </ul>
      </div>

      <!-- 退出按钮 -->
      <div style="margin: 16px">
        <van-button round block color="#42b983" @click="tologout"
          >退出登录</van-button>
      </div>
    </div>
  </div>
</template>

<script>
import {ref, reactive, toRefs, onMounted} from 'vue';
import NavBar from "components/common/navbar/NavBar";
import {useRouter} from 'vue-router';
import {useStore} from 'vuex';
import {logout, getUser} from 'network/user'
import { Toast } from 'vant';
export default {
  name: "Profile",
  setup(){
    const router = useRouter()
    const store = useStore();

    //定义用户信息
    const state = reactive({
      user:{}
    }) 

    // 请求用户数据
    onMounted(()=>{
      getUser().then(res=>{
        console.log(res);
        state.user = res
      })
    })

    const tologout = () =>{
      logout().then(res=>{
        // console.log(res);
        if(res.status == '204'){
          Toast.success('退出成功');
          // 清除token
          window.localStorage.setItem('token','')
          store.commit('setIsLogin', false);

          // 跳转
          setTimeout(()=>{
            router.push({path:'/login'})
          },500)
        }
      })
    }

    // 跳转
    const goTo = (path,query) =>{
      router.push({path,query:query || {}})
    }

    return{
      ...toRefs(state),
      router,
      tologout,
      goTo
    }
  },
  components: {
    NavBar,
  },
};
</script>

<style scoped lang='scss'>
#box{
  background-color: #fcfcfc;
  height: 100vh;
}
.user-box{
  margin-top: 65px;
  .user-info{
    width: 94%;
    margin: 10px;
    height: 115px;
    background: linear-gradient(90deg, #31c7A7, #A1c7c7);
    box-shadow: 0 2px 5px #269090;
    border-radius: 6px;
    margin-top: 50px;
    text-align: left;
    .info{
      position: relative;
      display: flex;
      width: 100%;
      height: 100%;
      padding: 25px 20px;
      img{
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-top: 4px;
      }
      .user-desc{
        display: flex;
        flex-direction: column;
        margin-left: 10px;
        line-height: 20px;
        font-size: 14px;
        color: #fff;
        span{
          color:#fff;
          font-size: 14px;
          padding: 2px 0;
        }
      }
    }
  }
  .user-list{
    // background-color: red;
    padding: 0 8px;
    margin-top: 20px;
    .van-hairline--bottom{
      display: flex;
      justify-content: space-between;
      padding-left: 5px;
      padding-right: 5px;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      background: #ffffff;
      border-radius: 3px;
      margin: 20px 0;
      .van-icon-arrow{
        margin-top: 13px;
      }
    }
  }
}
</style>