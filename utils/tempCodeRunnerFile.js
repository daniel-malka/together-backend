    if (Month === 2) {
      if ((Year % 4 === 0 && Year % 100 !== 0) || (Year % 100 === 0 && Year % 400 !== 0) || Year % 400 === 0) {
        for (Day; Day <= 29; Day++) {
          console.log(hebrewDate(Year, Month, Day));
        }
        Day = 1;
      } else {
        for (Day; Day <= 28; Day++) {
          console.log(hebrewDate(Year, Month, Day));
        }
        Day = 1;
      }
    }