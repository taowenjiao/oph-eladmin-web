<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.deviceId" clearable placeholder="输入设备id" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-date-picker
          v-model="query.createTime"
          :default-time="['00:00:00','23:59:59']"
          type="daterange"
          range-separator=":"
          size="small"
          class="date-item"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="设备id" prop="deviceId">
            <el-input v-model="form.deviceId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户id" prop="userId">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker v-model="form.createTime" type="datetime" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="deviceId" label="设备id" />
        <el-table-column prop="userId" label="用户id" />
        <el-table-column prop="user" label="用户名称">
          <template slot-scope="scope">
            <div v-if="scope.row.user !== null">{{ scope.row.user.nickName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="手机号">
          <template slot-scope="scope">
            <div v-if="scope.row.user !== null">{{ scope.row.user.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="养老院">
          <template slot-scope="scope">
            <div>{{ scope.row.deptSuperiorName ? scope.row.deptSuperiorName + ' / ' : '' }}{{ scope.row.user.dept.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="角色">
          <template slot-scope="scope">
            <div v-if="scope.row.user !== null">{{ scope.row.user.job.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','device:edit','device:del']" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudDevice from '@/api/system/device'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { deviceId: null, userId: null, createTime: null, id: null }
export default {
  name: 'Device',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '设备', url: 'api/device', sort: 'id,desc', crudMethod: { ...crudDevice }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'device:add'],
        edit: ['admin', 'device:edit'],
        del: ['admin', 'device:del']
      },
      rules: {
        deviceId: [
          { required: true, message: '设备id不能为空', trigger: 'blur' }
        ],
        userId: [
          { required: true, message: '用户id不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'deviceId', display_name: '设备id' },
        { key: 'userId', display_name: '用户id' }
      ]
    }
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    }
  }
}
</script>

<style scoped>

</style>
