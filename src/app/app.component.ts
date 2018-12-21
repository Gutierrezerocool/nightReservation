import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Heroe } from '../app/heroe.interface';
import * as moment from 'moment';
import * as _ from 'lodash';

export interface CalendarDate {
  mDate: moment.Moment;
  selected?: boolean;
  today?: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements  OnInit, OnChanges {
  currentDate = moment();
  dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  weeks: CalendarDate[][] = [];
  sortedDates: CalendarDate[] = [];
  selectedDate: string;
  selectedOcupied: boolean;
  selectedClient: string;
  selectedPayment: string;
  ocupied = false;
  clicked = false;
  calendaryDays = [
    {
      date: '12/02/2018',
      ocupied: true,
      client: 'Robert Neville',
      payment: 'cash'
    },
    {
      date: '12/06/2018',
      ocupied: true,
      client: 'Jhon Smith',
      payment: 'credit card'
    }
  ];

  heroe: Heroe = {
    client: '',
    payment: '',
    date: '',
    ocupied: true
  };
  array = [];
  available: boolean;

  @Input() selectedDates: CalendarDate[] = [];
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectDate = new EventEmitter<CalendarDate>();

  constructor() {}

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedDates &&
        changes.selectedDates.currentValue &&
        changes.selectedDates.currentValue.length  > 1) {
      // sort on date changes for better performance when range checking
      this.sortedDates = _.sortBy(changes.selectedDates.currentValue, (m: CalendarDate) => m.mDate.valueOf());
      this.generateCalendar();
    }
  }

  guardar() {
    this.calendaryDays.push(this.heroe);
    sessionStorage.setItem('datos', JSON.stringify(this.calendaryDays));
    location.reload();
  }

  // date checkers

  isToday(date: moment.Moment): boolean {
    return moment().isSame(moment(date), 'day');
  }

  isSelected(date: moment.Moment): boolean {
    return _.findIndex(this.selectedDates, (selectedDate) => {
      return moment(date).isSame(selectedDate.mDate, 'day');
    }) > -1;
  }

  isSelectedMonth(date: moment.Moment): boolean {
    return moment(date).isSame(this.currentDate, 'month');
  }

  selectDate(date: CalendarDate): void {
    this.clicked = true;
    this.ocupied = false;
    this.onSelectDate.emit(date);
    this.array.forEach(element => {
      if (date.mDate.format('L') === element.date) {
        this.selectedDate = element.date;
        this.selectedOcupied = element.ocupied;
        this.selectedClient = element.client;
        this.selectedPayment = element.payment;
        return this.ocupied = true;
      }
    });
    this.heroe.date = date.mDate.format('L');
  }

  // actions from calendar

  prevMonth(): void {
    this.currentDate = moment(this.currentDate).subtract(1, 'months');
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = moment(this.currentDate).add(1, 'months');
    this.generateCalendar();
  }

  firstMonth(): void {
    this.currentDate = moment(this.currentDate).startOf('year');
    this.generateCalendar();
  }

  lastMonth(): void {
    this.currentDate = moment(this.currentDate).endOf('year');
    this.generateCalendar();
  }

  prevYear(): void {
    this.currentDate = moment(this.currentDate).subtract(1, 'year');
    this.generateCalendar();
  }

  nextYear(): void {
    this.currentDate = moment(this.currentDate).add(1, 'year');
    this.generateCalendar();
  }

  // generate the calendar grid

  generateCalendar(): void {
    const dates = this.fillDates(this.currentDate);
    const weeks: CalendarDate[][] = [];
    while (dates.length > 0) {
      weeks.push(dates.splice(0, 7));
    }
    this.weeks = weeks;
    this.array = JSON.parse(sessionStorage.getItem('datos'));
    this.weeks.forEach(week => {
      week.forEach(day => {
        this.array.forEach(element => {
              if (day.mDate.format('L') === element.date) {
                day.selected = true;
              } else {
                this.available = true;
              }
            });
      });
    });
  }

  fillDates(currentMoment: moment.Moment): CalendarDate[] {
    const firstOfMonth = moment(currentMoment).startOf('month').day();
    const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
    const start = firstDayOfGrid.date();
    return _.range(start, start + 42)
            .map((date: number): CalendarDate => {
              const d = moment(firstDayOfGrid).date(date);
              return {
                today: this.isToday(d),
                selected: this.isSelected(d),
                mDate: d,
              };
            });
  }
}


