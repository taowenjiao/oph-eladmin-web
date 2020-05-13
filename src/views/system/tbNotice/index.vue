<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.value" clearable placeholder="输入搜索内容" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <el-select v-model="query.type" clearable placeholder="类型" class="filter-item" style="width: 130px">
          <el-option v-for="item in queryTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
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
              />
            </div>
          </el-form-item>
          <!--<el-form-item label="4、自定义目标人群的id">
            <el-input v-model="form.userIds" style="width: 370px;" />
          </el-form-item>-->
          <!--目标人员-->
          <el-form-item label="发送目标" prop="targetType">
            <el-radio-group v-model="form.targetType">
              <el-radio :label="1">所有人</el-radio>
              <el-radio :label="2">老人</el-radio>
              <el-radio :label="3">家属</el-radio>
              <el-radio :label="4">自定义</el-radio>
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
              width="55"
            />
            <el-table-column align="center" label="序号" width="95">
              <template slot-scope="scope">
                {{ scope.$index+1 }}
              </template>
            </el-table-column>
            <el-table-column
              label="名称"
              width="120"
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
        <el-table-column prop="notification" label="通知内容" />
        <el-table-column prop="targetType" label="发送目标" />
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
        <el-table-column prop="userIds" label="自定义目标人群" />
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

const defaultForm = { id: null, title: null, notification: null, targetType: 1, platformType: 1,
  targetPopulation: null, sendType: 1, sendTime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'), multipleUsers: [], userIds: null, dept: { id: null }}
export default {
  name: 'TbNotice',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['notice_platformType_status', 'notice_sendTime_status'],
  cruds() {
    return CRUD({ title: '通知', url: 'api/tbNotice', crudMethod: { ...crudTbNotice }})
  },
  data() {
    return {
      userList: [],
      notices: [],
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
      ]
    }
  },
  methods: {
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU]() {
      // 获取改养老院下所有用户
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
    handleSelectionChange(val) {
      this.from.multipleUsers = val
      var ids = this.from.multipleUsers.map(item => item.id).join()
      this.from.userIds = ids
    }
  }
}
</script>

<style scoped>

</style>
