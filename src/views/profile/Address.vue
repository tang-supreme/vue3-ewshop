<template>
  <div class="address-box">
    <nav-bar class="nav-bar">
      <template v-slot:default> 地址管理 </template>
    </nav-bar>

    <div v-show="list.length == 0" class="address-empty">
      还没有地址信息，去添加吧！
    </div>

    <div class="address-item">
      <van-address-list
        v-model="chosenAddressId"
        :list="list"
        default-tag-text="默认"
        @add="onAdd"
        @edit="onEdit"
      />
    </div>

  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import NavBar from "components/common/navbar/NavBar";
import { getAddressList } from "network/address";
import { useRouter } from "vue-router";
export default {
  name: "Address",
  components: {
    NavBar,
  },
  setup(){
    const router = useRouter()
    // 定义数据
    const state = reactive({
      chosenAddressId:'1',
      list:[]
    })

    // 获取数据
    onMounted(()=>{
      getAddressList().then(res=>{
        console.log(res);
        // 如果地址里面数据为0，则返回空数组
        if(res.data.length == 0){
          state.list = []
          return
        }
        // 将获取到的数据进行筛选，添加至state.list
        state.list = res.data.map(item=>{
          return{
            id:item.id,
            name:item.name,
            tel:item.phone,
            address:`${item.province}-${item.city}-${item.county}-${item.address}`,
            isDefault: !!item.is_default
          }
        })
      })
    })

    // 跳转至添加地址
    const onAdd = () => {
      // console.log('我是添加');
      router.push({path:'/addressedit',query:{type:'add'}})
    }
    
    // 跳转至编辑地址
    const onEdit = (item) =>{
      // console.log('我是编辑');
      router.push({path:'/addressedit',query:{type:'edit',addressId:item.id}})
    }
    
    return{
      ...toRefs(state),
      onAdd,
      onEdit
    }
  }
};
</script>

<style lang="scss">
.address-box {
  height: 300px;
  .van-radio__icon {
    display: none;
  }
  .address-item {
    margin-top: 45px;
    .van-button {
      background: var(--color-tint);
      border-color: var(--color-tint);
    }
  }
}
.address-empty{
  margin-top:200px;
  text-align: center;
}
.van-address-list__bottom {
  bottom: 100px !important;
}
</style>