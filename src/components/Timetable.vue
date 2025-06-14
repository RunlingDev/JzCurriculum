<template>
  <div class="main-container">
    <!-- 顶部加载圈动画和遮罩 -->
    <transition name="fade">
      <div v-if="isLoading" class="spinner-mask">
        <div class="spinner-overlay">
          <div class="spinner"></div>
          <span class="spinner-text">加载中…</span>
        </div>
      </div>
    </transition>
    <!-- 中央内容框 -->
    <div class="content-box">
      <!-- 学期选择区域 -->
      <div class="class-picker-section">
        <label class="section-comment">学期选择</label>
        <div class="term-controls">
          <!-- 学期选择框 -->
          <el-select v-model="selectedTerm" placeholder="选择学期" @change="handleTermChange">
          <el-option
            v-for="term in terms"
            :key="term.TermId"
            :label="term.TermName"
            :value="term.TermId"
          />
          </el-select>
        </div>
      </div>
      <!-- 班级选择区域 -->
      <div class="class-picker-section">
        <label class="section-comment">班级选择</label>
        <div class="term-controls">
          <!-- 班级选择框 -->
          <el-cascader
            v-model="selectedClass"
            :options="classOptions"
            placeholder="选择班级"
            :props="{ expandTrigger: 'hover' }"
            @change="fetchData"
          />
        </div>
      </div>
      <!-- 日期选择区域 -->
      <div class="date-picker-section">
        <label class="section-comment">日期选择</label>
        <div class="date-controls">
          <!-- 日期选择器 -->
          <div class="date-input">
            <el-date-picker
              v-model="selectedDate"
              editable=false        
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              @change="fetchData"
              @focus="datePickerReadonly"
            />
          </div>
          
          <!-- 视图切换 -->
          <div class="view-toggle">
            <el-switch
              v-model="isWeeklyView"
              active-text="周视图"
              inactive-text="日视图"
              @change="fetchData"
            />
          </div>
        </div>
      </div>

      <!-- 课表内容区 -->
      <div v-if="currentData" class="timetable-section">
        <DailyTimetable 
          v-if="!isWeeklyView" 
          :data="currentData" 
        />
        <WeeklyTimetable 
          v-else 
          :data="weeklyData" 
          selectedDate=selectedDate
        />
      </div>

      <!-- 页脚信息 -->
      <div class="footer-info">
        Latest Update: {{ new Date().toLocaleString() }}<br>
        <br>
          {{ dailyQuote }}<br>
        <br>
        Link exchange：<br>
          - <el-link type="primary" href="https://www.hayfrp.com">HayFrp - 免费、公益的内网穿透服务！</el-link><br>
        <br>
        Github Repo: <el-link type="primary" href="https://github.com/RunlingDev/JzCurriculum">RunlingDev/JzCurriculum</el-link><br>
        Contributor: <el-link type="success" href="https://github.com/RunlingDev"></el-link> <el-link type="success" href="https://github.com/66622a">Thehotday</el-link>
        Powered by <el-link type="primary" href="https://kq.stjszx.net/teacher/#/login">kq.stjszx.net</el-link>.<br>
        © 2025 Run, All Rights Reserved.
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';
import axios from 'axios';
import DailyTimetable from './DailyTimetable.vue';
import WeeklyTimetable from './WeeklyTimetable.vue';

const GRADE_ORDER = ['高一', '高二', '高三'];

export default {
  components: { DailyTimetable, WeeklyTimetable },
  data() {
    return {
      terms: [],
      selectedTerm: null,
      classes: [],
      selectedClass: [],
      isWeeklyView: false,
      selectedDate: new Date().toISOString().split('T')[0],
      currentData: null,
      weeklyData: [],
      dailyQuote: '',
      isLoading: false // 新增加载状态
    };
  },
  computed: {
    classOptions() {
      const grouped = this.classes.reduce((acc, curr) => {
        if (!acc[curr.Grade]) acc[curr.Grade] = [];
        acc[curr.Grade].push({
          value: curr.ClassId,
          label: `${curr.ClassName} - ${curr.TeacherName}`
        });
        return acc;
      }, {});
      return GRADE_ORDER.map(grade => ({
        value: grade,
        label: grade,
        children: grouped[grade] || []
      }));
    }
  },
  async created() {
      await this.fetchTerms();
      // 尝试从 cookie 中读取 selectedClass
      const savedClass = Cookies.get('selectedClass');
      if (savedClass) {
        try {
          this.selectedClass = JSON.parse(savedClass);
          // 如果cookie中有班级，直接获取课表数据
          this.$nextTick(() => {
            this.fetchData();
          });
        } catch (e) {
          console.error('解析 cookie 中的 selectedClass 失败：', e);
        }
      }
    },
  mounted: async function() {
    // 在组件挂载时获取每日一言
    await this.fetchDailyQuote();
  },
  watch: {
    selectedClass(newVal) {
      // 保存选中的班级到 cookie，15 天后过期
      Cookies.set('selectedClass', JSON.stringify(newVal), { expires: 15 });
    }
  },
  methods: {
    async fetchDailyQuote() {
      try {
        const response = await axios.get('https://v1.hitokoto.cn?encode=json&c=a&c=b&c=d');
        const data = response.data;
        this.dailyQuote = data.hitokoto;
        // 如果有 from_who 则显示“—— from_who 《from》”，否则仅显示 from
        if (data.from_who) {
          this.dailyQuoteSource = `—— ${data.from_who} 《${data.from}》`;
        } else {
          this.dailyQuoteSource = data.from ? `—— ${data.from}` : '';
        }
      } catch (error) {
        console.error('获取每日一言失败：', error);
        this.dailyQuote = '生活就像海洋，只有意志坚强的人才能到达彼岸。';
        this.dailyQuoteSource = '';
      }
    },
    async fetchTerms() {
      const { data } = await axios.get('https://jzkq.runling.fun/api/Attendance/GetTerms');
      this.terms = data.Data.sort((a, b) => b.TermId - a.TermId);
      this.selectedTerm = this.terms[0]?.TermId;
      await this.fetchClasses();
    },
    async fetchClasses() {
      const { data } = await axios.get(`https://jzkq.runling.fun/api/Attendance/GetClasses?termId=${this.selectedTerm}`);
      this.classes = data.Data;
    },
    handleTermChange() {
      this.selectedClass = null;
      this.fetchClasses();
    },
    datePickerReadonly() {
      this.$nextTick(() => {
        let els = document.querySelectorAll('.el-input__inner');
        for (var i = 0; i <= els.length - 1; i++) {
          els[i].setAttribute('readonly', 'readonly');
        }
      });
    },
    async fetchData() {
      this.isLoading = true;
      try {
        if (!this.selectedClass[1]) {
          this.isLoading = false;
          return;
        }
        if (this.isWeeklyView) {
          const weekDates = this.getWeekDates(this.selectedDate);
          const results = await Promise.all(
            weekDates.map(date => this.fetchDailyData(date))
          );
          // 只在全部都无数据时弹窗
          if (results.every(item => !item)) {
            this.$alert('该周无课表数据', '提示');
          }
          this.weeklyData = results;
          this.currentData = 1;
        } else {
          const result = await this.fetchDailyData(this.selectedDate);
          if (!result) {
            this.$alert('该日期无课表数据', '提示');
          }
          this.currentData = result;
        }
      } finally {
        this.isLoading = false;
      }
    },
    async fetchDailyData(date) {
      // 日期无效直接返回，不弹窗
      if (!date) return null;
      try {
        if (!this.selectedClass || this.selectedClass.length < 2) {
          return null;
        }
        const { data } = await axios.get(
          `https://jzkq.runling.fun/api/Attendance/GetCurriculumV2?attendanceDate=${date}&classId=${this.selectedClass[1]}`
        );
        const validSections = data.Data.Sections.filter(section =>
          !['早读', '第9节课', '第10节课', '第11节课'].some(t => section.SectionName.includes(t))
        );
        return { ...data.Data, Sections: validSections };
      } catch (error) {
        return null;
      }
    },
    getWeekDates(dateStr) {
      // 直接从该周周日（星期天）开始
      const date = new Date(dateStr);
      const day = date.getDay(); 
      const start = new Date(date);
      start.setDate(date.getDate() - day); // 回到本周周日
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d.toISOString().split('T')[0];
      });
    }
  }
};
</script>


<style>
/* 基础布局 */
.main-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-box {
  width: 90%;
  max-width: 900px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  padding: 24px;
  margin: 20px auto;
}

/* 区块间距 */
.date-picker-section,
.timetable-section {
  margin-bottom: 32px;
}

/* 日期选择区域 */
.date-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.date-input {
  flex: 1;
  min-width: 280px;
}

.view-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 注释标签样式 */
.section-comment {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
  margin-bottom: 8px;
}

/* 课表区块 */
.timetable-section > div {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
}

/* 页脚样式 */
.footer-info {
  border-top: 1px solid #dee2e6;
  padding-top: 16px;
  color: #6c757d;
  font-size: 0.875rem;
}

/* 顶部加载圈动画遮罩 */
.spinner-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 3.5rem;
  z-index: 9998;
  background: rgba(255,255,255,0.7);
  pointer-events: all;
}

/* 顶部加载圈动画样式 */
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 3.5rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  pointer-events: none;
  background: transparent;
  padding-left: 1.5rem;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  background: transparent;
}

.spinner-text {
  margin-left: 12px;
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  letter-spacing: 1px;
  user-select: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .main-container {
    background-color: #18181c;
  }
  .content-box {
    background: #23232a;
    color: #e6e6e6;
    box-shadow: 0 2px 12px rgba(0,0,0,0.5);
  }
  .section-comment,
  .footer-info {
    color: #a0a0b0;
  }
  .timetable-section > div {
    background: #23232a;
    border-color: #33364a;
  }
  .spinner-mask {
    background: rgba(24,24,28,0.7);
  }
  .spinner-text {
    color: #e6e6e6;
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .content-box {
    width: 95%;
    padding: 16px;
  }

  .date-controls {
    flex-direction: column;
  }
  
  .date-input {
    width: 100%;
  }
}

/* Element Plus 组件覆盖 */
.el-date-editor.el-input {
  width: 100%;
}

.el-switch {
  margin: 0 4px;
}
</style>