<template>
  <div class="address-edit-box">
    <nav-bar class="nav-bar">
      <template v-slot:default>
        {{ title }}
      </template>
    </nav-bar>

    <van-address-edit
      class="edit"
      :area-list="areaList"
      :address-info="addressInfo"
      :show-delete="type == 'edit'"
      show-set-default
      show-search-result
      :search-result="searchResult"
      :area-columns-placeholder="['请选择', '请选择', '请选择']"
      @save="onSave"
      @delete="onDelete"
    />
  </div>
</template>

<script>
import NavBar from "components/common/navbar/NavBar";
import { reactive, onMounted, toRefs, computed } from "vue";
import { Toast } from "vant";
import {
  addAddress,
  EditAddress,
  DeleteAddress,
  getAddressDetail,
} from "network/address";
import { tdist } from "utils/address";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "AddressEdit",
  components: {
    NavBar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 定义数据模型
    const state = reactive({
      type: "add", //类型
      addressId: "", //传递过来地址id
      title: "", //导航标题
      areaList: {
        province_list: {},
        city_list: {},
        county_list: {},
      },
      searchResult: [],
      addressInfo:{},
    });

    // onMounted事件
    onMounted(() => {
      // 接收参数
      const { type, addressId } = route.query;
      state.type = type;
      state.addressId = addressId;

      // 省市区 列表 构造出来
      let _province_list = {};
      let _city_list = {};
      let _county_list = {};
      tdist.getLev1().forEach((p) => {
        //省
        _province_list[p.id] = p.text;
        tdist.getLev2(p.id).forEach((c) => {
          //市
          _city_list[c.id] = c.text;
          tdist.getLev3(c.id).forEach((q) => {
            //区
            _county_list[q.id] = q.text;
          });
        });
      });
      state.areaList.province_list = _province_list;
      state.areaList.city_list = _city_list;
      state.areaList.county_list = _county_list;

      // 如果是编辑页面，通过点击进来的id获取地址详情，在将地址重新赋值给表单
      if (type == "edit") {
        getAddressDetail(addressId).then((res) => {
          console.log(res); //打印传递的参数
          const addressDetail = res;
          // 处理地址
          let _areaCode = "";
          const province = tdist.getLev1();
          Object.entries(state.areaList.county_list).forEach(([id, text]) => {
            // 先找出当前对应的区
            if (text == addressDetail.county) {
              // 找到区对应的几个省份
              const provinceIndex = province.findIndex(
                (item) => item.id.substr(0, 2) == id.substr(0, 2)
              );
              // 找到区对应的几个市区
              // eslint-disable-next-line no-unused-vars
              const cityItem = Object.entries(state.areaList.city_list).filter(
                ([cityId, city]) => cityId.substr(0, 4) == id.substr(0, 4)
              )[0];
              // 对比找到的省份和接口返回的省份是否相等，因为有一些区会重名
              if (
                province[provinceIndex].text == addressDetail.province &&
                cityItem[1] == addressDetail.city
              ) {
                _areaCode = id;
              }
            }
          });
          // 将传过来的地址整理 赋值给state.addressInfo
          state.addressInfo = {
            name:addressDetail.name,
            tel:addressDetail.phone,
            province: addressDetail.province,
            city:addressDetail.city,
            county:addressDetail.county,
            areaCode:_areaCode,
            addressDetail:addressDetail.address,
            isDefault: !!addressDetail.is_default
          }

        });
      }
    });

    // 导航根据参数判断是 新增地址 还是 编辑地址
    const title = computed(() => {
      return state.type == "add" ? "新增地址" : "编辑地址";
    });

    // 保存新增提交
    const onSave = (content) => {
      console.log(content);
      // 将填写的数据根据提交字段赋值给params
      const params = {
        name: content.name,
        phone: content.tel,
        province: content.province,
        city: content.city,
        county: content.county,
        address: content.addressDetail,
        is_default: content.isDefault ? 1 : 0,
      };
      // 根据type是 edit、add判断是 修改数据 还是 添加数据
      if(state.type == 'edit'){
        // 修改
        EditAddress(state.addressId,params)
      }else if(state.type == 'add'){
        // 调用接口，将params参数传递添加数据
        addAddress(params);
      }
      // 提示,返回
      Toast("保存成功");
      setTimeout(() => {
        router.back();
      }, 1000);
    };

    // 删除地址信息
    const onDelete = () => {
      DeleteAddress(state.addressId)
      // 提示返回
      Toast('删除成功')
      setTimeout(()=>{
        router.back()
      },1000)
    }

    return {
      ...toRefs(state),
      title,
      onSave,
      onDelete
    };
  },
};
</script>

<style lang="scss">
.edit {
  .van-field__body {
    textarea {
      height: 26px !important;
    }
  }
}
.address-edit-box {
  margin-top: 44px;
  .van-address-edit {
    .van-button--danger {
      background: var(--color-tint);
      border-color: var(--color-tint);
    }
    .van-switch--on {
      background: var(--color-tint);
    }
  }
}
</style>
