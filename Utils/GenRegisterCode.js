function generateRegisterCode(name, phone) {
  // get name till first space 
  const firstName = name.split(' ')[0].toUpperCase();

  // get last digit of phone 
  let phoneLength = phone.toString().length
  const lastFourPhone = phone.toString().substring(phoneLength-4);

  // get last four digits from current millisecond 
  const timeInMillis = new Date().getTime().toString();
  let milliLength = timeInMillis.length
  const lastFourMillis = timeInMillis.substring(milliLength-4)

  // generate register code 
  const registerCode = firstName + '_' + lastFourPhone + '_' + lastFourMillis;
  return registerCode;
}

module.exports = generateRegisterCode;