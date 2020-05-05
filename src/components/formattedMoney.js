const formattedMoney = (amountInPenny) => Intl.NumberFormat('en-EN', {
  style: 'currency',
  currency: 'GBP',
}).format(amountInPenny / 100);

export default formattedMoney;
