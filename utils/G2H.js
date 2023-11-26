'use strict';

const GREG_SDN_OFFSET = 32045;
const DAYS_PER_5_MONTHS = 153;
const DAYS_PER_4_YEARS = 1461;
const DAYS_PER_400_YEARS = 146097;

const HALAKIM_PER_HOUR = 1080;
const HALAKIM_PER_DAY = 25920;
const HALAKIM_PER_LUNAR_CYCLE = 29 * HALAKIM_PER_DAY + 13753;
const HALAKIM_PER_METONIC_CYCLE = HALAKIM_PER_LUNAR_CYCLE * (12 * 19 + 7);

const HEB_SDN_OFFSET = 347997;
const NEW_MOON_OF_CREATION = 31524;
const NOON = 18 * HALAKIM_PER_HOUR;
const AM3_11_20 = 9 * HALAKIM_PER_HOUR + 204;
const AM9_32_43 = 15 * HALAKIM_PER_HOUR + 589;

const SUN = 0,
  MON = 1,
  TUES = 2,
  WED = 3,
  THUR = 4,
  FRI = 5,
  SAT = 6;
//ימי השבוע בסריקה הפוכה
const gWeekday = ['ןושאר', 'ינש', 'ישילש', 'יעיבר', 'ישימח', 'ישיש', 'תבש'];
const gMonth = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const hMonth = ['ירשת', 'ןוושח', 'ולסכ', 'תבט', 'טבש', 'רדא', 'ב רדא', 'ןסינ', 'רייא', 'ןוויס', 'זומת', 'בא', 'לולא'];
const mpy = [12, 12, 13, 12, 12, 13, 12, 13, 12, 12, 13, 12, 12, 13, 12, 12, 13, 12, 13];

function weekdayarr(d0, d1, d2, d3, d4, d5, d6) {
  return [d0, d1, d2, d3, d4, d5, d6];
}

function gregmontharr(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11) {
  return [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11];
}

function hebrewmontharr(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13) {
  return [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13];
}

function monthsperyeararr(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18) {
  return [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18];
}

const gWeekdayArr = weekdayarr(...gWeekday);
const gMonthArr = gregmontharr(...gMonth);
const hMonthArr = hebrewmontharr(...hMonth);
const mpyArr = monthsperyeararr(...mpy);

/**
 * hebrewDate
 * Convert the Gregorian dates into Hebrew calendar dates.
 *
 * @name hebrewDate
 * @function
 * @param {Date|Number} inputDate The date object (representing the Gregorian date) or the year.
 * @param {Number} inputMonth The Gregorian month (**one-indexed**, January being `1`!).
 * @param {Number} inputDate The Gregorian date.
 * @return {Object} An object containing:
 *
 *  - `year`: The Hebrew year.
 *  - `month`: The Hebrew month.
 *  - `month_name`: The Hebrew month name.
 *  - `date`: The Hebrew date.
 *  - `day_of_the_week`: The current day name.
 */
const hebrewDate = function (inputDateOrYear, inputMonth, inputDate) {
  let hebrewMonth = 0,
    hebrewDate = 0,
    hebrewYear = 0,
    metonicCycle = 0,
    metonicYear = 0,
    moladDay = 0,
    moladHalakim = 0;

  function GregorianToSdn(inputYear, inputMonth, inputDay) {
    let year = 0,
      month = 0,
      sdn;

    // Make year a positive number
    if (inputYear < 0) {
      year = inputYear + 4801;
    } else {
      year = inputYear + 4800;
    }

    // Adjust the start of the year
    if (inputMonth > 2) {
      month = inputMonth - 3;
    } else {
      month = inputMonth + 9;
      year--;
    }

    sdn =
      Math.floor((Math.floor(year / 100) * DAYS_PER_400_YEARS) / 4) +
      Math.floor(((year % 100) * DAYS_PER_4_YEARS) / 4) +
      Math.floor((month * DAYS_PER_5_MONTHS + 2) / 5) +
      (inputDay - GREG_SDN_OFFSET);

    return sdn;
  }

  function SdnToHebrew(sdn) {
    let tishri1 = 0,
      tishri1After = 0,
      yearLength = 0,
      inputDay = sdn - HEB_SDN_OFFSET;

    FindTishriMolad(inputDay);
    tishri1 = Tishri1(metonicYear, moladDay, moladHalakim);

    if (inputDay >= tishri1) {
      // It found Tishri 1 at the start of the year.
      hebrewYear = metonicCycle * 19 + metonicYear + 1;
      if (inputDay < tishri1 + 59) {
        if (inputDay < tishri1 + 30) {
          hebrewMonth = 1;
          hebrewDate = inputDay - tishri1 + 1;
        } else {
          hebrewMonth = 2;
          hebrewDate = inputDay - tishri1 - 29;
        }
        return;
      }
      // We need the length of the year to figure this out, so find Tishri 1 of the next year.
      moladHalakim += HALAKIM_PER_LUNAR_CYCLE * mpyArr[metonicYear];
      moladDay += Math.floor(moladHalakim / HALAKIM_PER_DAY);
      moladHalakim = moladHalakim % HALAKIM_PER_DAY;
      tishri1After = Tishri1((metonicYear + 1) % 19, moladDay, moladHalakim);
    } else {
      // It found Tishri 1 at the end of the year.
      hebrewYear = metonicCycle * 19 + metonicYear;
      if (inputDay >= tishri1 - 177) {
        // It is one of the last 6 months of the year.
        if (inputDay > tishri1 - 30) {
          hebrewMonth = 13;
          hebrewDate = inputDay - tishri1 + 30;
        } else if (inputDay > tishri1 - 60) {
          hebrewMonth = 12;
          hebrewDate = inputDay - tishri1 + 60;
        } else if (inputDay > tishri1 - 89) {
          hebrewMonth = 11;
          hebrewDate = inputDay - tishri1 + 89;
        } else if (inputDay > tishri1 - 119) {
          hebrewMonth = 10;
          hebrewDate = inputDay - tishri1 + 119;
        } else if (inputDay > tishri1 - 148) {
          hebrewMonth = 9;
          hebrewDate = inputDay - tishri1 + 148;
        } else {
          hebrewMonth = 8;
          hebrewDate = inputDay - tishri1 + 178;
        }
        return;
      } else {
        if (mpyArr[(hebrewYear - 1) % 19] == 13) {
          hebrewMonth = 7;
          hebrewDate = inputDay - tishri1 + 207;
          if (hebrewDate > 0) return;
          hebrewMonth--;
          hebrewDate += 30;
          if (hebrewDate > 0) return;
          hebrewMonth--;
          hebrewDate += 30;
        } else {
          hebrewMonth = 6;
          hebrewDate = inputDay - tishri1 + 207;
          if (hebrewDate > 0) return;
          hebrewMonth--;
          hebrewDate += 30;
        }
        if (hebrewDate > 0) return;
        hebrewMonth--;
        hebrewDate += 29;
        if (hebrewDate > 0) return;
        // We need the length of the year to figure this out, so find Tishri 1 of this year.
        tishri1After = tishri1;
        FindTishriMolad(moladDay - 365);
        tishri1 = Tishri1(metonicYear, moladDay, moladHalakim);
      }
    }
    yearLength = tishri1After - tishri1;
    moladDay = inputDay - tishri1 - 29;
    if (yearLength == 355 || yearLength == 385) {
      // Heshvan has 30 days
      if (moladDay <= 30) {
        hebrewMonth = 2;
        hebrewDate = moladDay;
        return;
      }
      moladDay -= 30;
    } else {
      // Heshvan has 29 days
      if (moladDay <= 29) {
        hebrewMonth = 2;
        hebrewDate = moladDay;
        return;
      }
      moladDay -= 29;
    }
    // It has to be Kislev.
    hebrewMonth = 3;
    hebrewDate = moladDay;
  }

  function FindTishriMolad(inputDay) {
    // Estimate the metonic cycle number. Note that this may be an under
    // estimate because there are 6939.6896 days in a metonic cycle not
    // 6940, but it will never be an over estimate. The loop below will
    // correct for any error in this estimate.
    metonicCycle = Math.floor((inputDay + 310) / 6940);
    // Calculate the time of the starting molad for this metonic cycle.
    MoladOfMetonicCycle();
    // If the above was an under estimate, increment the cycle number until
    // the correct one is found. For modern dates this loop is about 98.6%
    // likely to not execute, even once, because the above estimate is
    // really quite close.
    while (moladDay < inputDay - 6940 + 310) {
      metonicCycle++;
      moladHalakim += HALAKIM_PER_METONIC_CYCLE;
      moladDay += Math.floor(moladHalakim / HALAKIM_PER_DAY);
      moladHalakim = moladHalakim % HALAKIM_PER_DAY;
    }
    // Find the molad of Tishri closest to this date.
    for (metonicYear = 0; metonicYear < 18; metonicYear++) {
      if (moladDay > inputDay - 74) break;
      moladHalakim += HALAKIM_PER_LUNAR_CYCLE * mpyArr[metonicYear];
      moladDay += Math.floor(moladHalakim / HALAKIM_PER_DAY);
      moladHalakim = moladHalakim % HALAKIM_PER_DAY;
    }
  }

  function MoladOfMetonicCycle() {
    // Start with the time of the first molad after creation.
    let r1, r2, d1, d2;
    r1 = NEW_MOON_OF_CREATION;
    // Calculate gMetonicCycle * HALAKIM_PER_METONIC_CYCLE. The upper 32
    // bits of the result will be in r2 and the lower 16 bits will be in r1.
    r1 += metonicCycle * (HALAKIM_PER_METONIC_CYCLE & 0xffff);
    r2 = r1 >> 16;
    r2 += metonicCycle * ((HALAKIM_PER_METONIC_CYCLE >> 16) & 0xffff);
    // Calculate r2r1 / HALAKIM_PER_DAY. The remainder will be in r1, the
    // upper 16 bits of the quotient will be in d2 and the lower 16 bits
    // will be in d1.
    d2 = Math.floor(r2 / HALAKIM_PER_DAY);
    r2 -= d2 * HALAKIM_PER_DAY;
    r1 = (r2 << 16) | (r1 & 0xffff);
    d1 = Math.floor(r1 / HALAKIM_PER_DAY);
    r1 -= d1 * HALAKIM_PER_DAY;
    moladDay = (d2 << 16) | d1;
    moladHalakim = r1;
  }

  function Tishri1(metonicYear, moladDay, moladHalakim) {
    let tishri1 = moladDay,
      dow = tishri1 % 7,
      leapYear =
        metonicYear == 2 ||
        metonicYear == 5 ||
        metonicYear == 7 ||
        metonicYear == 10 ||
        metonicYear == 13 ||
        metonicYear == 16 ||
        metonicYear == 18,
      lastWasLeapYear =
        metonicYear == 3 ||
        metonicYear == 6 ||
        metonicYear == 8 ||
        metonicYear == 11 ||
        metonicYear == 14 ||
        metonicYear == 17 ||
        metonicYear == 0;

    // Apply rules 2, 3 and 4
    if (
      moladHalakim >= NOON ||
      (!leapYear && dow == TUES && moladHalakim >= AM3_11_20) ||
      (lastWasLeapYear && dow == MON && moladHalakim >= AM9_32_43)
    ) {
      tishri1++;
      dow++;
      if (dow == 7) dow = 0;
    }

    // Apply rule 1 after the others because it can cause an additional delay of one day.
    if (dow == WED || dow == FRI || dow == SUN) {
      tishri1++;
    }

    return tishri1;
  }

  let inputYear = inputDateOrYear;

  if (typeof inputYear === 'object') {
    inputMonth = inputDateOrYear.getMonth() + 1;
    inputDate = inputDateOrYear.getDate();
    inputYear = inputDateOrYear.getFullYear();
  }

  SdnToHebrew(GregorianToSdn(inputYear, inputMonth, inputDate));

  const hebrewDayOfWeek = function (inputDateOrYear, inputMonth, inputDate) {
    // const hebrewDateObj = hebrewDate(inputDateOrYear, inputMonth, inputDate);
    const gregorianDate = new Date(inputDateOrYear, inputMonth - 1, inputDate);
    const gregorianDayOfWeek = gregorianDate.getDay();
    const hebrewDayOfWeekIndex = gregorianDayOfWeek % 7; // Adjust for Sunday being index 0
    const hebrewDayOfWeekName = gWeekday[hebrewDayOfWeekIndex];
    return hebrewDayOfWeekName;
  };

  function convertToYear(year) {
    let hebrewYear = [];
    const hebrewLetters = {
      1: 'א',
      2: 'ב',
      3: 'ג',
      4: 'ד',
      5: 'ה',
      6: 'ו',
      7: 'ז',
      8: 'ח',
      9: 'ט',
      10: 'י',
      20: 'כ',
      30: 'ל',
      40: 'מ',
      50: 'נ',
      60: 'ס',
      70: 'ע',
      80: 'פ',
      90: 'צ',
      100: 'ק',
      200: 'ר',
      300: 'ש',
      400: 'ת',
      500: 'קת',
      600: 'רת',
      700: 'שת',
      800: 'תת',
      900: 'קתת',
      1000: 'רתת',
    };
    const yearLength = year.toString().length;
    const splitNumberArray = (number) => {
      const digits = [];
      let placeValue = 1;

      while (number > 0) {
        const digit = (number % 10) * placeValue;
        if (digit > 0) {
          digits.unshift(digit);
        }
        number = Math.floor(number / 10);
        placeValue *= 10;
      }

      return digits;
    };

    if (yearLength > 3) {
      let yearArr = year.toString().split('');
      let firstDig = yearArr[0];
      let firstDigToLetter = parseInt(firstDig);
      hebrewYear.push(hebrewLetters[firstDigToLetter]);
      splitNumberArray(year)
        .slice(1)
        .map((num) => {
          hebrewYear.push(hebrewLetters[num]);
        });
    }
    return hebrewYear.reverse().join('');
  }

  // convertToYear(5783);

  if (hebrewDate === 1) hebrewDate = 'א';
  if (hebrewDate === 2) hebrewDate = 'ב';
  if (hebrewDate === 3) hebrewDate = 'ג';
  if (hebrewDate === 4) hebrewDate = 'ד';
  if (hebrewDate === 5) hebrewDate = 'ה';
  if (hebrewDate === 6) hebrewDate = 'ו';
  if (hebrewDate === 7) hebrewDate = 'ז';
  if (hebrewDate === 8) hebrewDate = 'ח';
  if (hebrewDate === 9) hebrewDate = 'ט';
  if (hebrewDate === 10) hebrewDate = 'י';
  if (hebrewDate === 11) hebrewDate = 'אי';
  if (hebrewDate === 12) hebrewDate = 'בי';
  if (hebrewDate === 13) hebrewDate = 'גי';
  if (hebrewDate === 14) hebrewDate = 'די';
  if (hebrewDate === 15) hebrewDate = 'וט';
  if (hebrewDate === 16) hebrewDate = 'זט';
  if (hebrewDate === 17) hebrewDate = 'זי';
  if (hebrewDate === 18) hebrewDate = 'חי';
  if (hebrewDate === 19) hebrewDate = 'טי';
  if (hebrewDate === 20) hebrewDate = 'כ';
  if (hebrewDate === 21) hebrewDate = 'אכ';
  if (hebrewDate === 22) hebrewDate = 'בכ';
  if (hebrewDate === 23) hebrewDate = 'גכ';
  if (hebrewDate === 24) hebrewDate = 'דכ';
  if (hebrewDate === 25) hebrewDate = 'הכ';
  if (hebrewDate === 26) hebrewDate = 'וכ';
  if (hebrewDate === 27) hebrewDate = 'זכ';
  if (hebrewDate === 28) hebrewDate = 'חכ';
  if (hebrewDate === 29) hebrewDate = 'טכ';
  if (hebrewDate === 30) hebrewDate = 'ל';

  return {
    year: convertToYear(hebrewYear),
    month: hebrewMonth,
    date: hebrewDate,
    month_name: hMonth[hebrewMonth - 1],
    day_name: hebrewDayOfWeek(inputDateOrYear, inputMonth, inputDate),
  };
};

const date = () => {
  return new Date().slice();
};
// check if its midnight
function checkMidnight() {
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();

  if (currentHours === 0 && currentMinutes === 0 && currentSeconds === 0) {
    // Perform your action here
    console.log("It's midnight! Do something!");
  }
}

// checkMidnight();

// for (let Year = 1990; Year <= 1992; Year++) {
//   let Month = 1;
//   for (Month; Month <= 12; Month++) {
//     console.log('Month', Month);
//     let Day = 1;
//     if (Month === 1 || Month === 3 || Month === 5 || Month === 7 || Month === 8 || Month === 10 || Month === 12) {
//       for (Day; Day <= 31; Day++) {
//         console.log(hebrewDate(Year, Month, Day));
//       }
//       Day = 1;
//     }
//     if (Month === 4 || Month === 6 || Month === 9 || Month === 11) {
//       for (Day; Day <= 30; Day++) {
//         console.log(hebrewDate(Year, Month, Day));
//       }
//       Day = 1;
//     }
//     if (Month === 2) {
//       if ((Year % 4 === 0 && Year % 100 !== 0) || (Year % 100 === 0 && Year % 400 !== 0) || Year % 400 === 0) {
//         for (Day; Day <= 29; Day++) {
//           console.log(hebrewDate(Year, Month, Day));
//         }
//         Day = 1;
//       } else {
//         for (Day; Day <= 28; Day++) {
//           console.log(hebrewDate(Year, Month, Day));
//         }
//         Day = 1;
//       }
//     }
//   }
//   Month = 1;
// }

// console.log(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
// console.log(hebrewDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()));
module.exports = hebrewDate;
