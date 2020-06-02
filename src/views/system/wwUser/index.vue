<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" style="width: 370px;" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" style="width: 370px;" show-password placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="公司编码" prop="companycode">
            <el-input v-model="form.companycode" style="width: 370px;" placeholder="请输入公司编码" />
          </el-form-item>
          <el-form-item label="平台编码" prop="platform">
            <el-input v-model="form.platform" style="width: 370px;" placeholder="请输入平台编码" />
          </el-form-item>
          <el-form-item
            label="养老院"
            prop="dept.id"
            :rules="rules.dept"
          >
            <treeselect
              v-model="form.dept.id"
              :options="depts"
              style="width: 370px"
              placeholder="选择养老院"
            />
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
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="projectcode" label="项目编码" />
        <el-table-column prop="companycode" label="公司编码" />
        <el-table-column prop="platform" label="平台编码" />
        <el-table-column prop="dept" label="所属养老院">
          <template slot-scope="scope">
            <div>{{ scope.row.deptSuperiorName ? scope.row.deptSuperiorName + ' / ' : '' }}{{ scope.row.dept.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','wwUser:edit','wwUser:del']" label="操作" width="150px" align="center">
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
import crudWwUser from '@/api/system/wwUser'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { getDepts } from '@/api/system/dept'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const defaultForm = { id: null, username: null, password: null, projectcode: null, companycode: 'alztest', platform: 80067, dept: { id: null }, isDelete: null, createTime: null }
export default {
  name: 'WwUser',
  components: { pagination, crudOperation, udOperation, Treeselect },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '无无账号', url: 'api/wwUser', sort: 'id,desc', crudMethod: { ...crudWwUser }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'wwUser:add'],
        edit: ['admin', 'wwUser:edit'],
        del: ['admin', 'wwUser:del']
      },
      depts: [],
      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ],
        companycode: [
          { required: true, message: '调用公司的编码不能为空', trigger: 'blur' }
        ],
        platform: [
          { required: true, message: '平台编码不能为空', trigger: 'blur' }
        ],
        dept: { required: true, message: '所属养老院不能为空', trigger: 'select' }
      }
    }
  },
  methods: {
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    }
  }
}
</script>

<style scoped>

</style>
