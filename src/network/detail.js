// 请求商品详情数据
import {request} from './request'

export function getDetail(id){
  return request({
    url:'/api/goods/'+id
  })
}