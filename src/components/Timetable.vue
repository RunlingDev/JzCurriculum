<template>
  <div class="main-container">
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
        生活就像海洋，只有意志坚强的人才能到达彼岸。<br>
        Link exchange：<br>
          - <a href="https://www.hayfrp.com">HayFrp - 免费、公益的内网穿透服务！</a><br>
        <br>
        Github Repo: <a href="https://github.com/RunlingDev/JzCurriculum">RunlingDev/JzCurriculum</a><br>        
        Powered by <a href="https://jzkq.runling.fun/teacher/#/login">jzkq.runling.fun</a>.<a href="https://jzkq.runling.fun/teacher/#/login">jzkq.runling.fun</a>是<a href="https://kq.stjszx.net/teacher/#/login">kq.stjszx.net</a>的代理转发。<br>
        © 2025 Run, All Rights Reserved.
      </div>
    </div>
  </div>
</template>

<script>
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
      weeklyData: []
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
  },
  methods: {
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
    datePickerReadonly(){
      this.$nextTick(() => {
          let els = document.querySelectorAll('.el-input__inner');
        for(var i = 0; i <= els.length-1 ; i++){
          els[i].setAttribute('readonly','readonly');
        }
        })
    },
    async fetchData() {
      if (!this.selectedClass[1]) return;
      
      if (this.isWeeklyView) {
        const weekDates = this.getWeekDates(this.selectedDate);
        this.weeklyData = await Promise.all(
          weekDates.map(date => this.fetchDailyData(date))
        );
        this.currentData = 1;// Issue #3
      } else {
        this.currentData = await this.fetchDailyData(this.selectedDate);
      }
    },
    async fetchDailyData(date) {
      try {
        if (!this.selectedClass || this.selectedClass.length < 2) {
          this.$alert('请先选择班级', '提示');
          return null;
        }
        const { data } = await axios.get(
          `https://jzkq.runling.fun/api/Attendance/GetCurriculumV2?attendanceDate=${date}&classId=${this.selectedClass[1]}`
        );
        const validSections = data.Data.Sections.filter(section => 
          !['早读', '第9节课', '第10节课', '第11节课' ].some(t => section.SectionName.includes(t))
        );
        return { ...data.Data, Sections: validSections };
      } catch (error) {
        this.$alert('该日期无课表数据', '提示');
        return null;
      }
    },
    getWeekDates(dateStr) {
      const date = new Date(dateStr);
      const day = date.getDay();
      const start = new Date(date);
      start.setDate(date.getDate() - day);
      
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