<template>
  <div class="home">
    {{banner}}
  </div>
</template>

<script>
import {getHomeAllData} from 'network/home'
import { onMounted, ref } from 'vue'

export default {
  name: 'Home',

  setup(){
    const banner = ref([]);

    onMounted(()=>{
      getHomeAllData().then(res=>{
        // console.log(res)
        banner.value = res.slides;
      }).catch(err=>{

      })
    });

    return{
      banner
    }

  },

  components: {
    
  }
}
</script>
