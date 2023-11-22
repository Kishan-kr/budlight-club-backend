function generateBetId(lastId = '20230101001') {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const dateString = year.toString() + padToTwoDigit(month) + padToTwoDigit(day) ;

  // initialize bet id with as today's first bet 
  let betId = dateString + '001';

  // compare if last doc is of today 
  const dateOfLastId = lastId.slice(0,8);
  if(dateString === dateOfLastId) {
    let lastThreeDigit = Number(lastId.slice(8));
    lastThreeDigit += 1;

    betId = dateString + padToThreeDigits(lastThreeDigit);
  }

  return betId;
}

function padToTwoDigit(number) {
  return number < 10 ? '0' + number : number.toString();
}

function padToThreeDigits(number) {
  if (number < 10) {
    return '00' + number;
  } else if (number < 100) {
    return '0' + number;
  } else {
    return number.toString();
  }
}

module.exports = generateBetId;