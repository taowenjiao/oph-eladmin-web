import request from '@/utils/request'

// 获取所有的Role
export function getAllAppMenus() {
  return request({
    url: 'api/tbAppMenu/all',
    method: 'get'
  })
}
export function add(data) {
  return request({
    url: 'api/tbAppMenu',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/tbAppMenu/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/tbAppMenu',
    method: 'put',
    data
  })
}

export default { add, edit, del, getAppMenus }
