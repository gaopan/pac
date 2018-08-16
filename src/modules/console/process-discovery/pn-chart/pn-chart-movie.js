import TypeChecker from '@/utils/type-checker.js'
import shared from "@/shared.js"
import Chart from '@/components/chart/Chart.vue'
import { PNMovie, PNMovieAdapter } from './pn-movie-lib'
import PNMovieData from './pn-movie-data.js'

var eventHub = shared.eventHub;

export default {
  name: 'pn-chart-movie',
  data() {
    return {
      isPlaying: false,
      data: null,
      container: null,
      movie: null,
      frames: null,
      currentFrameIndex: 0,
      currentFrameDate: {
        year: "70",
        month: "Jan",
        date: "1",
        day: "Mon",
        hour: "00",
        minute: "00",
        second: "00"
      },
      progress: "0%",
      controlPercent: 0.5,
      maxSpeed: 40,
      minSpeed: 2000,
      currentSpeed: 1020
    }
  },
  mounted: function() {
    var self = this;
    var data = PNMovieData;

    this.data = PNMovieAdapter.adaptData(data);
    this.container = this.$refs.container;
    if (!this.movie) {
      this.movie = new PNMovie(this.container)
        .speed(self.currentSpeed)
        .loaded(function(m) {
          self.frames = m._frames;
        })
        .playing(function(currentFrameIndex) {
          self.currentFrameIndex = currentFrameIndex;
          self.progress = self.currentFrameIndex / self.frames.length * 100 + "%";
          var dDate = new Date(self.frames[self.currentFrameIndex].date);
          var year = dDate.getFullYear(),
            month = dDate.getMonth(),
            date = dDate.getDate(),
            day = dDate.getDay(),
            hour = dDate.getHours(),
            minute = dDate.getMinutes(),
            second = dDate.getSeconds();
          var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          self.currentFrameDate.year = year.toString().substr(2);
          self.currentFrameDate.month = monthNames[month].substr(0, 3);
          self.currentFrameDate.date = date.toString();
          self.currentFrameDate.day = dayNames[day].substr(0, 3);
          self.currentFrameDate.hour = hour > 9 ? hour.toString() : ("0" + hour);
          self.currentFrameDate.minute = minute > 9 ? minute.toString() : ("0" + minute);
          self.currentFrameDate.second = second > 9 ? second.toString() : ("0" + second);
        })
        .played(function(currentFrameIndex) {
          self.currentFrameIndex = currentFrameIndex;
          self.progress = self.currentFrameIndex / self.frames.length * 100 + "%";
          self.isPlaying = false;
        }).data(this.data).init();
    } else {
      this.movie.init();
    }

    var speedSlider = this.speedSlider = this.$refs.speedSlider;
    var limitedWidth = speedSlider.parentNode.clientWidth;
    var speedPosX = limitedWidth * this.controlPercent;
    console.log(limitedWidth);
    speedSlider.style.left = speedPosX + "px";
    var maxSpeed = 40,
      minSpeed = 2000,
      startPos = { x: 0, y: 0 },
      dist = { x: 0, y: 0 },
      lastPos = { x: 0, y: 0 };
    var startControlSpeed = function(evt) {
      startPos.x = evt.clientX;
      startPos.y = evt.clientY;
      speedSlider.parentNode.addEventListener("mousemove", controlSpeed);
      speedSlider.parentNode.addEventListener("mouseleave", endControlSpeed);
      speedSlider.addEventListener("mouseup", endControlSpeed);

      evt.preventDefault();
      evt.stopPropagation();
    };
    var controlSpeed = function(evt) {
      dist.x = evt.clientX - startPos.x;
      dist.y = evt.clientY - startPos.y;
      var progress = dist.x / limitedWidth + self.controlPercent;
      if (progress > 1) {
        speedSlider.style.left = limitedWidth + "px";
      } else if(progress < 0){
        speedSlider.style.left = "0px";
      }else {
        speedSlider.style.left = (dist.x + speedPosX) + "px";
      }
      evt.preventDefault();
      evt.stopPropagation();
    };
    var endControlSpeed = function(evt) {
      dist.x = evt.clientX - startPos.x;
      dist.y = evt.clientY - startPos.y;
      var progress = dist.x / limitedWidth + self.controlPercent;
      if(progress > 1) {
        speedSlider.style.left = limitedWidth + "px";
        speedPosX = limitedWidth;
        self.controlPercent = 1;
      } else if(progress < 0) {
        speedSlider.style.left = "0px";
        self.controlPercent = 0;
        speedPosX = 0;
      } else {
        speedSlider.style.left = (dist.x + speedPosX) + "px";
        speedPosX = dist.x + speedPosX;
        self.controlPercent = speedPosX / limitedWidth;
      }
      speedPosX = dist.x + speedPosX;
      self.currentSpeed = Math.floor(self.controlPercent * (maxSpeed - minSpeed)) + minSpeed;
      self.movie.speed(self.currentSpeed);
      if (self.isPlaying) {
        self.movie.stop(true);
        self.movie.play();
      }
      startPos.x = startPos.y = dist.x = dist.y = 0;
      speedSlider.parentNode.removeEventListener("mousemove", controlSpeed);
      speedSlider.parentNode.removeEventListener("mouseleave", endControlSpeed);
      speedSlider.removeEventListener("mouseup", endControlSpeed);
      evt.preventDefault();
      evt.stopPropagation();
    };
    speedSlider.addEventListener("mousedown", startControlSpeed);
  },
  methods: {
    parseConf: function() {


    },
    // draw in the container
    draw: function() {
      var container = this.container;

    },
    togglePlay: function() {
      this.isPlaying = !this.isPlaying;
      if (this.movie) {
        if (this.isPlaying) {
          if (this.currentFrameIndex == this.frames.length) {
            this.movie.replay();
          } else {
            this.movie.play();
          }
        } else {
          this.movie.stop();
        }
      }
    },
    windowResized: function(args) {

    }
  },
  components: {
    Chart
  },
  beforeDestroy: function() {

  }
}
