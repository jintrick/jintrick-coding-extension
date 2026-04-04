const { calculate_total } = require('./sample.js');

try {
  console.log('Testing calculate_total(1000, undefined)...');
  const result = calculate_total(1000, undefined);
  console.log('Result:', result);
  console.log('Type of result:', typeof result);
  if (isNaN(result)) {
    console.log('Result is NaN');
  }
} catch (error) {
  console.error('Error occurred:', error);
}
