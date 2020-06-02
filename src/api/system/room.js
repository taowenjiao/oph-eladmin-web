import request from '@/utils/request'

export function getAllRoom(deptId) {
  const params = {
    deptId,
    enabled: true,
    page: 0,
    size: 9999
  }
  return request({
    url: 'api/room',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/room',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/room',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/room',
    method: 'put',
    data
  })
}
export function getRoom(userId) {
  const params = {
    userId
  }
  return request({
    url: 'api/room',
    method: 'get',
    params
  })
}

export default { add, edit, del, getRoom }
