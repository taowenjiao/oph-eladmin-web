import request from '@/utils/request'

export function getNotices(params) {
  return request({
    url: 'api/tbNotice',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/tbNotice',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/tbNotice/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/tbNotice',
    method: 'put',
    data
  })
}

export default { add, edit, del }
