<template>
  <div class="tab-control">
    <div v-for="(item,index) in titles" 
         :key="index"
         @click="itemClick(index)"
         class="tab-control-item" 
         :class="{active:index == currentIndex}">
      <span>{{item}}</span>
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';

export default {
  name:'TabControl',
  props:{
    titles:{
      type:Array,
      default() {
        return []
      }
    }
  },
  setup(props,{emit}){
    let currentIndex = ref(0)
    const itemClick = (index) =>{
      currentIndex.value = index;
      emit('tabClick',index)
    }

    return{
      currentIndex,
      itemClick
    }
  }
}
</script>

<style scoped lang="scss">
.tab-control{
  display: flex;
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 14px;
  background-color: #fff;
  width: 100%;
  z-index: 30;

  position: sticky;
  top: 44px;

  .tab-control-item{
    flex: 1;
    span{
      padding: 6px;
    }
  }
  .active{
    color: var(--color-tint);
    span{
      border-bottom: 3px solid var(--color-tint);
    }
  }
}

</style>