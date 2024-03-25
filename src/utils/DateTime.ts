export class DateTime extends Date {
  // Subtraction of time
  subtractMilliSeconds(ms: number): DateTime {
    this.setMilliseconds(this.getMilliseconds() - ms);
    return this;
  }

  subtractSeconds(seconds: number): DateTime {
    this.setSeconds(this.getSeconds() - seconds);
    return this;
  }

  subtractMinutes(minutes: number): DateTime {
    this.setMinutes(this.getMinutes() - minutes);
    return this;
  }

  subtractHours(hours: number): DateTime {
    this.setHours(this.getHours() - hours);
    return this;
  }

  subtractDays(days: number): DateTime {
    this.setDate(this.getDate() - days);
    return this;
  }

  subtractMonths(months: number): DateTime {
    this.setMonth(this.getMonth() - months);
    return this;
  }

  subtractYears(years: number): DateTime {
    this.setFullYear(this.getFullYear() - years);
    return this;
  }

  // Addition of time
  addMilliSeconds(ms: number): DateTime {
    this.setMilliseconds(this.getMilliseconds() + ms);
    return this;
  }

  addSeconds(seconds: number): DateTime {
    this.setSeconds(this.getSeconds() + seconds);
    return this;
  }

  addMinutes(minutes: number): DateTime {
    this.setMinutes(this.getMinutes() + minutes);
    return this;
  }

  addHours(hours: number): DateTime {
    this.setHours(this.getHours() + hours);
    return this;
  }

  addDays(days: number): DateTime {
    this.setDate(this.getDate() + days);
    return this;
  }

  addMonths(months: number): DateTime {
    this.setMonth(this.getMonth() + months);
    return this;
  }

  addYears(years: number): DateTime {
    this.setFullYear(this.getFullYear() + years);
    return this;
  }
}
