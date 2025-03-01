<template>
  <div class="container">
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <el-select v-model="selectedTerm" placeholder="选择学期" @change="handleTermChange">
          <el-option
            v-for="term in terms"
            :key="term.TermId"
            :label="term.TermName"
            :value="term.TermId"
          />
        </el-select>

        <el-cascader
          v-model="selectedClass"
          :options="classOptions"
          placeholder="选择班级"
          :props="{ expandTrigger: 'hover' }"
          @change="handleClassChange"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <el-switch
          v-model="isWeeklyView"
          active-text="整周课表"
          inactive-text="单日课表"
        />
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          @change="fetchData"
        />
      </div>
    </div>

    <div v-if="currentData" class="card">
      <DailyTimetable 
        v-if="!isWeeklyView" 
        :data="currentData" 
      />
      <WeeklyTimetable 
        v-else 
        :data="weeklyData" 
      />
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
      selectedClass: null,
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
      const { data } = await axios.get('https://kq.stjszx.net/api/Attendance/GetTerms');
      this.terms = data.Data.sort((a, b) => b.TermId - a.TermId);
      this.selectedTerm = this.terms[0]?.TermId;
      await this.fetchClasses();
    },
    async fetchClasses() {
      const { data } = await axios.get(`https://kq.stjszx.net/api/Attendance/GetClasses?termId=${this.selectedTerm}`);
      this.classes = data.Data;
    },
    handleTermChange() {
      this.selectedClass = null;
      this.fetchClasses();
    },
    async fetchData() {
      if (!this.selectedClass) return;
      
      if (this.isWeeklyView) {
        const weekDates = this.getWeekDates(this.selectedDate);
        this.weeklyData = await Promise.all(
          weekDates.map(date => this.fetchDailyData(date))
        );
      } else {
        this.currentData = await this.fetchDailyData(this.selectedDate);
      }
    },
    async fetchDailyData(date) {
      try {
        const { data } = await axios.get(
          `https://kq.stjszx.net/api/Attendance/GetCurriculumV2?attendanceDate=${date}&classId=${this.selectedClass}`
        );
        const validSections = data.Data.Sections.filter(section => 
          !['早读', '晚修'].some(t => section.SectionName.includes(t))
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