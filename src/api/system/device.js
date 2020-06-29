import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/device',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/device/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/device',
    method: 'put',
    data
  })
}

export default { add, edit, del }
