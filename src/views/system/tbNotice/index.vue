<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.title" clearable placeholder="输入通知标题" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-date-picker
          v-model="query.sendTime"
          :default-time="['00:00:00','23:59:59']"
          type="daterange"
          range-separator=":"
          size="small"
          class="date-item"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="发送开始时间"
          end-placeholder="结束时间"
        />
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
          <el-form-item label="目标平台" prop="platformType">
            <el-radio-group v-model="form.platformType" size="mini" style="width: 300px">
              <el-radio-button v-for="item in dict.notice_platformType_status" :key="item.id" v-model="form.platformType" :label="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="通知标题" prop="title">
            <el-input v-model="form.title" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="通知内容" prop="notification">
            <el-input v-model="form.notification" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="养老院" prop="dept.id">
            <treeselect
              v-model="form.dept.id"
              :options="depts"
              placeholder="选择养老院"
              @select="selectFun"
            />
          </el-form-item>
          <el-form-item label="发送时间" prop="sendType">
            <el-radio-group v-model="form.sendType" size="mini" style="width: 300px">
              <el-radio-button v-for="item in dict.notice_sendTime_status" :key="item.id" v-model="form.sendType" :label="item.value">{{ item.label }}</el-radio-button>
            </el-radio-group>
            <div v-show="form.sendType.toString() === '2'" class="block">
              <el-date-picker
                v-model="form.sendTime"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
                placeholder="发送日期时间"
                :picker-options="pickerOptions0"
              />
            </div>
          </el-form-item>
          <!--目标人员-->
          <el-form-item label="发送目标" prop="targetType">
            <el-radio-group v-model="form.targetType">
              <el-radio-button
                v-for="item in dict.notice_target_type"
                :key="item.id"
                v-model="form.targetType"
                :label="item.value"
              >
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <!--点击选择用户人群时在显示-->
          <el-table
            v-show="form.targetType.toString() === '4'"
            ref="multipleTable"
            height="400px"
            :data="userList"
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="45"
            />
            <el-table-column align="center" label="序号" width="50">
              <template slot-scope="scope">
                {{ scope.$index+1 }}
              </template>
            </el-table-column>
            <el-table-column
              label="名称"
              width="90"
            >
              <template slot-scope="scope">{{ scope.row.nickName }}</template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" width="140" prop="dept" label="养老院 / 角色">
              <template slot-scope="scope">
                <div>{{ scope.row.dept.name }} / {{ scope.row.job.name }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="phone"
              label="手机号"
              show-overflow-tooltip
            />
          </el-table>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="通知标题" />
        <el-table-column prop="notification" label="通知内容" width="350px" />
        <el-table-column prop="dept" label="所属养老院">
          <template slot-scope="scope">
            <div>{{ scope.row.deptSuperiorName ? scope.row.deptSuperiorName + ' / ' : '' }}{{ scope.row.dept.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="发送目标">
          <template slot-scope="scope">
            {{ dict.label.notice_target_type[scope.row.targetType] }}
          </template>
        </el-table-column>
        <el-table-column prop="platformType" label="目标平台">
          <template slot-scope="scope">
            {{ dict.label.notice_platformType_status[scope.row.platformType] }}
          </template>
        </el-table-column>
        <el-table-column prop="sendType" label="发送状态">
          <template slot-scope="scope">
            {{ dict.label.notice_sendTime_status[scope.row.sendType] }}
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.sendTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','tbNotice:edit','tbNotice:del']" label="操作" width="150px" align="center">
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
import crudTbNotice from '@/api/system/tbNotice'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { formatDate } from '@/utils/util'
import { getUsers } from '@/api/system/user'
import { getDepts } from '@/api/system/dept'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

const defaultForm = { id: null, title: null, notification: null, targetType: 1, platformType: 1,
  targetPopulation: null, sendType: 1, sendTime: null, multipleUsers: [], userIds: null, dept: { id: null }}
export default {
  name: 'TbNotice',
  components: { Treeselect, pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['notice_platformType_status', 'notice_sendTime_status', 'notice_target_type'],
  cruds() {
    return CRUD({ title: '通知', url: 'api/tbNotice', crudMethod: { ...crudTbNotice }})
  },
  data() {
    return {
      userList: [], depts: [],
      notices: [],
      multipleUsers: [],
      permission: {
        add: ['admin', 'tbNotice:add'],
        edit: ['admin', 'tbNotice:edit'],
        del: ['admin', 'tbNotice:del']
      },
      rules: {
        title: [
          { required: true, message: '通知标题不能为空', trigger: 'blur' }
        ],
        notification: [
          { required: true, message: '通知内容不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'title', display_name: '通知标题' },
        { key: 'notification', display_name: '通知内容' },
        { key: 'targetType', display_name: '目标类型1所有人、2家属、3老人、4自定义' },
        { key: 'platformType', display_name: '发送平台类型1android、2ios、3WinPhone' },
        { key: 'sendType', display_name: '发送状态/1立即、2定时' }
      ],
      // 设置只能选择当前日期及之后的日期
      pickerOptions0: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7 // 如果没有后面的-8.64e7就是不可以选择今天的
        }
      }
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU]() {
      this.multipleUsers = [] // 将之前选择的多个用户清除
      // 获取改养老院下所有用户
      this.getDepts()
      if (this.form.dept.id !== null) {
        this.getUsers(this.form.dept.id)
      }
      crudTbNotice.getNotices().then(res => {
        this.notices = res.content
      })
    },
    // 获取数据前设置好接口地址
    [CRUD.HOOK.beforeRefresh]() {
      const query = this.query
      if (query.type && query.value) {
        this.crud.params[query.type] = query.value
      }
      return true
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (!crud.form.dept.id) {
        this.$message({
          message: '养老院不能为空',
          type: 'warning'
        })
        return false
      } else if (crud.form.dept.id && !crud.form.userIds && crud.form.targetType === '4') {
        this.$message({
          message: '请选择发送的用户',
          type: 'warning'
        })
        return false
      }
      if (this.form.sendType === '2') {
        if (this.form.sendTime < formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')) {
          this.$message({
            message: '发送时间不可小于当前时间',
            type: 'warning'
          })
          return false
        }
        if (!crud.form.sendTime) {
          this.$message({
            message: '定时发送时间不可为空',
            type: 'warning'
          })
          return false
        }
      }
      return true
    },
    selectFun(node, instanceId) { // 点击养老院时
      this.getUsers(node.id)
    },
    verifyOph() {
      if (!this.form.dept.id) {
        this.$message({
          message: '养老院不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    getUsers(id) { // 获取弹窗内养老院用户数据
      getUsers({ enabled: true, deptId: id }).then(res => {
        this.userList = res.content
      })
    },
    // 获取弹窗内养老院数据
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    },
    handleSelectionChange(val) {
      var vm = this
      this.multipleUsers = val
      var ids = this.multipleUsers.map(item => item.id).join()
      vm.form.userIds = ids
    }
  }
}
</script>

<style scoped>

</style>
